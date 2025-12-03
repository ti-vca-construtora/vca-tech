/* eslint-disable prettier/prettier */
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

// Retorna a lista de empreendimentos que NÃO possuem slots até a data alvo
const vrfCriaSlot = async (): Promise<(string | number)[]> => {
  console.log("[VRFCRIA] Iniciando verificação de slots...");

  // Buscar configurações
  const config = await fetchInspectionConfig();
  const diasPrazo = config?.minDaysToSchedule ?? 3;
  const diasDuracao = config?.maxDaysToSchedule ?? 60;
  console.log("[VRFCRIA] Configurações:", { diasPrazo, diasDuracao });

  // data alvo: último dia que deveria existir slot
  const paramDate = new Date();
  paramDate.setHours(0, 0, 0, 0);
  paramDate.setDate(paramDate.getDate() + diasPrazo + diasDuracao - 1);
  const targetIso = paramDate.toISOString();
  console.log("[VRFCRIA] Data alvo (último dia que deve ter slot):", targetIso);

  // busca empreendimentos ativos
  const empreendimentos = (await RetornaEmpAtivos()) ?? [];
  console.log(
    "[VRFCRIA] Total de empreendimentos ativos:",
    empreendimentos.length,
  );
  const faltantes: (string | number)[] = [];

  // checa por empreendimento se há ao menos 1 slot a partir da data alvo
  for (const devId of empreendimentos) {
    console.log(`[VRFCRIA] Verificando empreendimento ${devId}...`);
    const res = await fetch(
      `/api/vistorias/slots?fromDate=${targetIso}&developmentId=${devId}&page=1&pageSize=1`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );

    if (!res.ok) {
      console.error(
        `[VRFCRIA] Erro ao verificar slots do empreendimento ${devId}:`,
        res.status,
        res.statusText,
      );
      // Em caso de erro, considere como faltante para não bloquear criação
      faltantes.push(devId);
      continue;
    }

    const data = await res.json();
    console.log(
      `[VRFCRIA] Empreendimento ${devId} - slots encontrados na data alvo:`,
      data?.data?.length ?? 0,
    );
    if (!data?.data || data.data.length === 0) {
      console.log(`[VRFCRIA] Empreendimento ${devId} PRECISA de slots`);
      faltantes.push(devId);
    } else {
      console.log(`[VRFCRIA] Empreendimento ${devId} JÁ TEM slots`);
    }
  }

  console.log(
    "[VRFCRIA] Total de empreendimentos que precisam de slots:",
    faltantes.length,
    faltantes,
  );
  return faltantes;
};

export default vrfCriaSlot;
