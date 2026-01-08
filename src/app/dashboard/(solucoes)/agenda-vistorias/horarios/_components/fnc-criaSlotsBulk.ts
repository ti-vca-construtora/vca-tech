/* eslint-disable prettier/prettier */
"use client";

import RetornaEmpAtivos from "./fnc-empativos";

// Busca as configurações de agendamento
const fetchInspectionConfig = async () => {
  try {
    const response = await fetch("/api/vistorias/inspection-config");
    if (response.ok) {
      const result = await response.json();
      return result.data;
    }
  } catch (error) {
    console.error("Erro ao buscar configurações:", error);
  }
  return null;
};

// Cria slots para todos os empreendimentos ou somente para os IDs informados
const CriarSlotsBulk = (onlyIds?: (string | number)[]) => {
  let diasPrazo = 3;
  let diasDuracao = 60;
  const horarios = [
    { inicio: "08:00", fim: "09:00" },
    { inicio: "09:00", fim: "10:00" },
    { inicio: "10:00", fim: "11:00" },
    { inicio: "11:00", fim: "12:00" },
    { inicio: "12:00", fim: "13:00" },
    { inicio: "13:00", fim: "14:00" },
    { inicio: "14:00", fim: "15:00" },
    { inicio: "15:00", fim: "16:00" },
    { inicio: "16:00", fim: "17:00" },
    { inicio: "17:00", fim: "18:00" },
  ];

  const executar = async () => {
    console.log("[CRIASLOTS] Iniciando criação de slots bulk...");
    console.log("[CRIASLOTS] IDs recebidos:", onlyIds);

    // Buscar configurações primeiro
    const config = await fetchInspectionConfig();
    if (config) {
      diasPrazo = config.minDaysToSchedule;
      diasDuracao = config.maxDaysToSchedule;
      console.log("[CRIASLOTS] Configurações carregadas:", {
        diasPrazo,
        diasDuracao,
      });
    } else {
      console.log("[CRIASLOTS] Usando configurações padrão:", {
        diasPrazo,
        diasDuracao,
      });
    }

    const ids =
      onlyIds && onlyIds.length > 0 ? onlyIds : await RetornaEmpAtivos();
    console.log(
      "[CRIASLOTS] IDs finais para criar slots:",
      ids?.length ?? 0,
      ids,
    );

    if (!ids || ids.length === 0) {
      console.log("[CRIASLOTS] Nenhum ID para processar. Abortando.");
      return;
    }
    await createSlots(ids);
  };

  const createSlots = async (ids: (string | number)[]) => {
    console.log("[CRIASLOTS] Criando slots para IDs:", ids);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    today.setDate(today.getDate() + diasPrazo);

    const endDate = new Date(today);
    endDate.setDate(today.getDate() + diasDuracao - 1);
    endDate.setHours(23, 59, 59, 999);

    const fromIso = today.toISOString();
    const toIso = endDate.toISOString();

    console.log("[CRIASLOTS] Período de criação:", {
      de: fromIso,
      até: toIso,
      dias: diasDuracao,
    });

    const newSlots: Array<{
      startAt: string;
      endAt: string;
      developmentId: string | number;
    }> = [];

    for (const id of ids) {
      console.log(`[CRIASLOTS] Processando empreendimento ${id}...`);

      // Busca slots existentes no período para o empreendimento
      const existingRes = await fetch(
        // eslint-disable-next-line prettier/prettier
        `/api/vistorias/slots?fromDate=${fromIso}&toDate=${toIso}&developmentId=${id}&page=1&pageSize=99999`,
      );
      const existingData = await existingRes.json();
      const existed: Set<string> = new Set(
        // eslint-disable-next-line prettier/prettier
        (existingData?.data ?? []).map((s: { startAt: string }) => s.startAt),
      );
      console.log(
        `[CRIASLOTS] Empreendimento ${id} - slots existentes no período:`,
        existingData?.data?.length ?? 0,
      );

      for (let i = 0; i < diasDuracao; i++) {
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() + i);

        for (const horario of horarios) {
          const startAt = new Date(currentDate);
          const [startHour, startMinute] = horario.inicio.split(":");
          startAt.setHours(Number(startHour) - 3, Number(startMinute), 0, 0);

          const startIso = startAt.toISOString();
          if (existed.has(startIso)) continue; // já existe, não recria

          const endAt = new Date(currentDate);
          const [endHour, endMinute] = horario.fim.split(":");
          endAt.setHours(Number(endHour) - 3, Number(endMinute), 0, 0);

          newSlots.push({
            startAt: startIso,
            endAt: endAt.toISOString(),
            developmentId: id,
          });
        }
      }
    }

    if (newSlots.length === 0) {
      console.log("[CRIASLOTS] Nenhum slot novo para criar. Todos já existem.");
      return;
    }

    console.log(
      "[CRIASLOTS] Total de slots faltantes a criar:",
      newSlots.length,
    );
    console.log(
      "[CRIASLOTS] Amostra dos primeiros 3 slots:",
      newSlots.slice(0, 3),
    );

    // Dividir em lotes de 100 slots para evitar problemas com payloads grandes
    const batchSize = 100;
    const batches = [];
    for (let i = 0; i < newSlots.length; i += batchSize) {
      batches.push(newSlots.slice(i, i + batchSize));
    }

    console.log(
      `[CRIASLOTS] Dividindo em ${batches.length} lotes de até ${batchSize} slots`,
    );

    // Enviar cada lote
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(
        `[CRIASLOTS] Enviando lote ${i + 1}/${batches.length} (${batch.length} slots)...`,
      );

      const payload = { slots: batch };
      console.log(`[CRIASLOTS] Lote ${i + 1} - Amostra:`, {
        totalSlots: payload.slots.length,
        primeiroSlot: payload.slots[0],
        ultimoSlot: payload.slots[payload.slots.length - 1],
      });

      const response = await fetch("/api/vistorias/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log(`[CRIASLOTS] Lote ${i + 1} - Resposta:`, data);

      if (!response.ok) {
        console.error(
          `[CRIASLOTS] Erro ao criar lote ${i + 1}:`,
          response.status,
          response.statusText,
        );
        console.error(`[CRIASLOTS] Lote ${i + 1} - Detalhes do erro:`, data);
        // Continua com os próximos lotes mesmo se um falhar
        continue;
      }

      console.log(`[CRIASLOTS] Lote ${i + 1} criado com sucesso!`);
    }

    console.log("[CRIASLOTS] Processo de criação de slots finalizado!");
  };

  return executar();
};

export default CriarSlotsBulk;
