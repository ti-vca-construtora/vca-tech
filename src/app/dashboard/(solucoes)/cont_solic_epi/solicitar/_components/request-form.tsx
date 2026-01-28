"use client";

import { useEffect, useMemo, useState } from "react";
import ExcelJS from "exceljs";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";

import {
  loadFuncoesAsync,
  loadEpiItemsAsync,
  genId,
  EmpreendimentoTipo,
} from "../../_lib/cont-solic-epi-storage";
import { saveEpiRequestToDB } from "../../_lib/cont-solic-epi-supabase";

type RequestFormProps = {
  collectedData: {
    obraId: string;
    obraName: string;
    obraState: string;
    obraCity: string;
    obraType: string;
    epiCounts: Record<string, string>; // Estoque coletado (strings dos inputs)
    currentFunctionCounts: Record<string, string>; // Efetivos coletados
    projectedFunctionCounts: Record<string, string>; // Projetados coletados
    createdAt: string;
    createdBy?: {
      id?: string;
      name?: string;
      email?: string;
    };
  };
  onBack: () => void;
};

type FunctionRequest = {
  functionName: string;
  currentEmployees: number;
  projectedEmployees: number;
  epiNeeds: Array<{
    epi: string;
    intervalMonths: number; // Intervalo de reposição em meses
    quantityPerEmployee: number; // Quantidade por funcionário projetado
    currentNeed: number; // Necessidade mensal para efetivos
    projectedNeed: number; // Necessidade para projetados
    totalNeed: number; // Total (efetivos + projetados)
    stock: number;
    shortage: number;
    manualAdjust: number;
    justification: string;
  }>;
};

export function RequestForm({ collectedData, onBack }: RequestFormProps) {
  const { toast } = useToast();
  const user = useUser();
  const [funcoes, setFuncoes] = useState<
    Array<{ id: string; name: string; items: Array<{ epi: string; intervalMonths: number; quantityPerEmployee: number }> }>
  >([]);
  const [availableEpis, setAvailableEpis] = useState<string[]>([]);

  const [addForms, setAddForms] = useState<Record<string, { query: string; selected?: string; count: string; justification: string }>>({});

  const [functionRequests, setFunctionRequests] = useState<FunctionRequest[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const epis = await loadEpiItemsAsync();
        setAvailableEpis(epis);

        // Carregar funções baseadas no tipo de empreendimento da obra
        const funcs = await loadFuncoesAsync(collectedData.obraType as EmpreendimentoTipo);
        setFuncoes(funcs);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast({
          title: "Erro ao carregar",
          description: "Não foi possível carregar os dados necessários",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectedData.obraType]);

  // calcular necessidades com base nos dados coletados
  useEffect(() => {
    if (availableEpis.length === 0) return;

    const requests: FunctionRequest[] = [];

    for (const func of funcoes) {
      const currentEmp = parseInt(collectedData.currentFunctionCounts[func.name] || "0", 10);
      const projectedEmp = parseInt(collectedData.projectedFunctionCounts[func.name] || "0", 10);

      // Filtrar apenas EPIs que ainda existem na lista cadastrada
      const epiNeeds = func.items
        .filter((item) => availableEpis.includes(item.epi))
        .map((item) => {
          const taxaMensal = item.intervalMonths > 0 ? 1 / item.intervalMonths : 0;
          const currentNeed = Math.ceil(currentEmp * taxaMensal); 
          const projectedNeed = projectedEmp * item.quantityPerEmployee; 
          const totalNeed = currentNeed + projectedNeed;
          
          // Usar estoque coletado na Etapa 1
          const stock = parseInt(collectedData.epiCounts[item.epi] || "0", 10);
          const shortage = Math.max(0, totalNeed - stock);

          return {
            epi: item.epi,
            intervalMonths: item.intervalMonths,
            quantityPerEmployee: item.quantityPerEmployee,
            currentNeed,
            projectedNeed,
            totalNeed,
            stock,
            shortage,
            manualAdjust: 0,
            justification: "",
          };
        });

      requests.push({
        functionName: func.name,
        currentEmployees: currentEmp,
        projectedEmployees: projectedEmp,
        epiNeeds,
      });
    }

    setFunctionRequests(requests);
  }, [funcoes, collectedData, availableEpis]);

  function updateManualAdjust(funcName: string, epi: string, value: string) {
    setFunctionRequests((prev) =>
      prev.map((req) => {
        if (req.functionName !== funcName) return req;
        return {
          ...req,
          epiNeeds: req.epiNeeds.map((need) =>
            need.epi === epi ? { ...need, manualAdjust: parseInt(value || "0", 10) } : need
          ),
        };
      })
    );
  }

  function updateJustification(funcName: string, epi: string, value: string) {
    setFunctionRequests((prev) =>
      prev.map((req) => {
        if (req.functionName !== funcName) return req;
        return {
          ...req,
          epiNeeds: req.epiNeeds.map((need) =>
            need.epi === epi ? { ...need, justification: value } : need
          ),
        };
      })
    );
  }

  function addManualEpiToFunction(funcName: string, epi: string, count: number, justification: string) {
    setFunctionRequests((prev) => {
      const found = prev.some((r) => r.functionName === funcName);
      const stock = parseInt(collectedData.epiCounts[epi] || "0", 10);
      const newNeed = {
        epi,
        intervalMonths: 0,
        quantityPerEmployee: 0,
        currentNeed: 0,
        projectedNeed: 0,
        totalNeed: 0,
        stock,
        shortage: Math.max(0, 0 - stock),
        manualAdjust: count,
        justification: justification || "",
      };

      if (!found) {
        return [
          ...prev,
          {
            functionName: funcName,
            currentEmployees: 0,
            projectedEmployees: 0,
            epiNeeds: [newNeed],
          },
        ];
      }

      return prev.map((r) => {
        if (r.functionName !== funcName) return r;
        return { ...r, epiNeeds: [...r.epiNeeds, newNeed] };
      });
    });
    // close form for that function
    setAddForms((prev) => {
      const copy = { ...prev };
      delete copy[funcName];
      return copy;
    });
  }

  const totalRequests = useMemo(() => {
    const summary: Record<string, { shortage: number; adjusted: number }> = {};
    for (const req of functionRequests) {
      for (const need of req.epiNeeds) {
        if (!summary[need.epi]) {
          summary[need.epi] = { shortage: 0, adjusted: 0 };
        }
        summary[need.epi].shortage += need.shortage;
        summary[need.epi].adjusted += need.shortage + need.manualAdjust;
      }
    }
    return summary;
  }, [functionRequests]);

  function handleSubmitRequest() {
    // validar ajustes manuais (se > 0, precisa justificativa)
    for (const req of functionRequests) {
      for (const need of req.epiNeeds) {
        const isKnown = availableEpis.includes(need.epi);
        if (need.manualAdjust !== 0 && !need.justification.trim()) {
          toast({
            title: "Justificativa obrigatória",
            description: `Informe a justificativa para o ajuste manual de "${need.epi}" na função "${req.functionName}".`,
            variant: "destructive",
          });
          return;
        }

        // justificativa obrigatória para EPIs que não existem no banco
        if (!isKnown && !need.justification.trim()) {
          toast({
            title: "Justificativa obrigatória",
            description: `O item "${need.epi}" não está cadastrado. Informe uma justificativa para solicitar materiais não cadastrados (função: ${req.functionName}).`,
            variant: "destructive",
          });
          return;
        }
      }
    }

    // Preparar dados para envio ao histórico
    setIsSending(true);

    const totalSummary = totalRequests;
    const requestData = {
      id: genId(),
      obraId: collectedData.obraId,
      obraName: collectedData.obraName,
      obraType: collectedData.obraType,
      epiCounts: collectedData.epiCounts,
      currentFunctionCounts: collectedData.currentFunctionCounts,
      projectedFunctionCounts: collectedData.projectedFunctionCounts,
      functionRequests,
      totalSummary,
      createdAt: new Date().toISOString(),
      createdBy: collectedData.createdBy,
    };

    // Salvar no Supabase e gerar Excel
    saveEpiRequestToDB(requestData)
      .then((success) => {
        if (success) {
          // Gerar Excel
          generateExcelReport(requestData);
          
          toast({
            title: "Solicitação criada com sucesso!",
            description: "O arquivo Excel foi baixado. Histórico salvo no sistema.",
          });
          onBack();
        } else {
          toast({
            title: "Erro ao salvar",
            description: "Não foi possível salvar a solicitação. Tente novamente.",
            variant: "destructive",
          });
        }
      })
      .finally(() => setIsSending(false));
  }

  // Função para gerar Excel com formatação profissional
  async function generateExcelReport(data: any) {
    try {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'VCA Tech';
      workbook.created = new Date();

      // Cores do tema
      const colors = {
        primary: 'FF2563EB',      // Azul
        headerBg: 'FFF1F5F9',     // Cinza claro
        headerText: 'FF1E293B',   // Cinza escuro
        border: 'FFE2E8F0',       // Cinza borda
        white: 'FFFFFFFF',
        lightGray: 'FFF8FAFC',
        accent: 'FF3B82F6',
      };

      // ============================================
      // ABA 1: RESUMO
      // ============================================
      const summarySheet = workbook.addWorksheet('Resumo', {
        views: [{ showGridLines: false }]
      });

      // Título principal
      summarySheet.mergeCells('A1:B1');
      const titleCell = summarySheet.getCell('A1');
      titleCell.value = 'SOLICITAÇÃO DE EPIs';
      titleCell.font = { size: 18, bold: true, color: { argb: colors.primary } };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      summarySheet.getRow(1).height = 35;

      // Informações
      let currentRow = 3;
      const infoFields = [
        ['Data:', new Date().toLocaleDateString('pt-BR')],
        ['Obra:', data.obraName],
        ['Tipo:', data.obraType],
        ['Técnico:', data.createdBy?.name || 'Não informado'],
      ];

      infoFields.forEach(([label, value]) => {
        summarySheet.getCell(`A${currentRow}`).value = label;
        summarySheet.getCell(`A${currentRow}`).font = { bold: true, size: 11 };
        summarySheet.getCell(`B${currentRow}`).value = value;
        summarySheet.getCell(`B${currentRow}`).font = { size: 11 };
        currentRow++;
      });

      // Espaço
      currentRow += 2;

      // Cabeçalho da tabela de resumo
      summarySheet.mergeCells(`A${currentRow}:B${currentRow}`);
      const tableTitle = summarySheet.getCell(`A${currentRow}`);
      tableTitle.value = 'EPIs Necessários';
      tableTitle.font = { size: 14, bold: true, color: { argb: colors.headerText } };
      tableTitle.alignment = { horizontal: 'center', vertical: 'middle' };
      tableTitle.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: colors.headerBg }
      };
      tableTitle.border = {
        top: { style: 'thin', color: { argb: colors.border } },
        left: { style: 'thin', color: { argb: colors.border } },
        right: { style: 'thin', color: { argb: colors.border } },
        bottom: { style: 'thin', color: { argb: colors.border } }
      };
      summarySheet.getRow(currentRow).height = 30;
      currentRow++;

      // Headers da tabela
      const headerRow = summarySheet.getRow(currentRow);
      headerRow.values = ['EPI', 'Quantidade'];
      headerRow.font = { bold: true, size: 11, color: { argb: colors.headerText } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: colors.headerBg }
      };
      headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
      headerRow.height = 25;
      ['A', 'B'].forEach(col => {
        summarySheet.getCell(`${col}${currentRow}`).border = {
          top: { style: 'thin', color: { argb: colors.border } },
          left: { style: 'thin', color: { argb: colors.border } },
          right: { style: 'thin', color: { argb: colors.border } },
          bottom: { style: 'thin', color: { argb: colors.border } }
        };
      });
      currentRow++;

      // Dados
      const items = Object.entries(data.totalSummary)
        .filter(([, v]: any) => v.adjusted > 0)
        .sort(([a], [b]) => a.localeCompare(b));

      items.forEach(([epi, details]: any, index) => {
        const row = summarySheet.getRow(currentRow);
        row.values = [epi, details.adjusted];
        row.font = { size: 11 };
        row.alignment = { horizontal: 'left', vertical: 'middle' };
        row.height = 20;

        // Linhas alternadas
        const bgColor = index % 2 === 0 ? colors.white : colors.lightGray;
        ['A', 'B'].forEach(col => {
          const cell = summarySheet.getCell(`${col}${currentRow}`);
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: bgColor }
          };
          cell.border = {
            left: { style: 'thin', color: { argb: colors.border } },
            right: { style: 'thin', color: { argb: colors.border } },
            bottom: { style: 'thin', color: { argb: colors.border } }
          };
        });

        // Alinhamento e formatação da quantidade
        const qtyCell = summarySheet.getCell(`B${currentRow}`);
        qtyCell.alignment = { horizontal: 'center', vertical: 'middle' };
        qtyCell.numFmt = '0';
        if (details.adjusted > 0) {
          qtyCell.font = { bold: true, color: { argb: colors.accent } };
        }

        // Destacar nome do EPI quando for material extra (não cadastrado)
        const epiCell = summarySheet.getCell(`A${currentRow}`);
        if (!availableEpis.includes(epi)) {
          epiCell.font = { italic: true, color: { argb: 'FF92400E' } };
        }

        currentRow++;
      });

      // Total
      const totalRow = summarySheet.getRow(currentRow);
      totalRow.values = ['TOTAL DE ITENS', items.length];
      totalRow.font = { bold: true, size: 11 };
      totalRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: colors.headerBg }
      };
      totalRow.alignment = { horizontal: 'left', vertical: 'middle' };
      totalRow.height = 25;
      ['A', 'B'].forEach(col => {
        summarySheet.getCell(`${col}${currentRow}`).border = {
          top: { style: 'thin', color: { argb: colors.border } },
          left: { style: 'thin', color: { argb: colors.border } },
          right: { style: 'thin', color: { argb: colors.border } },
          bottom: { style: 'thin', color: { argb: colors.border } }
        };
      });
      summarySheet.getCell(`B${currentRow}`).alignment = { horizontal: 'center', vertical: 'middle' };

      // Larguras das colunas
      summarySheet.getColumn('A').width = 45;
      summarySheet.getColumn('B').width = 18;

      // ============================================
      // ABA 2: DETALHADO
      // ============================================
      const detailSheet = workbook.addWorksheet('Detalhado', {
        views: [{ showGridLines: false }]
      });

      let detailRow = 1;

      // Título
      detailSheet.mergeCells('A1:J1');
      const detailTitle = detailSheet.getCell('A1');
      detailTitle.value = 'DETALHAMENTO POR FUNÇÃO';
      detailTitle.font = { size: 18, bold: true, color: { argb: colors.primary } };
      detailTitle.alignment = { horizontal: 'center', vertical: 'middle' };
      detailSheet.getRow(1).height = 35;
      detailRow = 3;

      data.functionRequests.forEach((req: any, funcIndex: number) => {
        // Nome da função
        detailSheet.mergeCells(`A${detailRow}:J${detailRow}`);
        const funcCell = detailSheet.getCell(`A${detailRow}`);
        funcCell.value = `FUNÇÃO: ${req.functionName.toUpperCase()}`;
        funcCell.font = { size: 13, bold: true, color: { argb: colors.white } };
        funcCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: colors.primary }
        };
        funcCell.alignment = { horizontal: 'center', vertical: 'middle' };
        detailSheet.getRow(detailRow).height = 28;
        detailRow++;

        // Info de funcionários
        detailSheet.mergeCells(`A${detailRow}:E${detailRow}`);
        detailSheet.getCell(`A${detailRow}`).value = `Funcionários Efetivos: ${req.currentEmployees}`;
        detailSheet.getCell(`A${detailRow}`).font = { size: 10, bold: true };
        
        detailSheet.mergeCells(`F${detailRow}:J${detailRow}`);
        detailSheet.getCell(`F${detailRow}`).value = `Funcionários Projetados: ${req.projectedEmployees}`;
        detailSheet.getCell(`F${detailRow}`).font = { size: 10, bold: true };
        detailRow += 2;

        // Cabeçalho da tabela
        const headers = ['EPI', 'Intervalo (meses)', 'Qtd/Func', 'Nec. Efetivos', 'Nec. Projetados', 'Total', 'Estoque', 'Falta', 'Ajuste', 'Justificativa'];
        const headerRow = detailSheet.getRow(detailRow);
        headerRow.values = headers;
        headerRow.font = { bold: true, size: 10, color: { argb: colors.headerText } };
        headerRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: colors.headerBg }
        };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
        headerRow.height = 25;
        
        ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].forEach(col => {
          detailSheet.getCell(`${col}${detailRow}`).border = {
            top: { style: 'thin', color: { argb: colors.border } },
            left: { style: 'thin', color: { argb: colors.border } },
            right: { style: 'thin', color: { argb: colors.border } },
            bottom: { style: 'thin', color: { argb: colors.border } }
          };
        });
        detailRow++;

        // Dados
        req.epiNeeds.forEach((need: any, index: number) => {
          const row = detailSheet.getRow(detailRow);
          row.values = [
            need.epi,
            need.intervalMonths,
            need.quantityPerEmployee,
            need.currentNeed,
            need.projectedNeed,
            need.totalNeed,
            need.stock,
            need.shortage,
            need.manualAdjust || 0,
            need.justification || ''
          ];
          row.font = { size: 10 };
          row.alignment = { vertical: 'middle' };
          row.height = 20;

          const bgColor = index % 2 === 0 ? colors.white : colors.lightGray;
          ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].forEach((col, colIndex) => {
            const cell = detailSheet.getCell(`${col}${detailRow}`);
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: bgColor }
            };
            cell.border = {
              left: { style: 'thin', color: { argb: colors.border } },
              right: { style: 'thin', color: { argb: colors.border } },
              bottom: { style: 'thin', color: { argb: colors.border } }
            };
            
            // Alinhamento
            if (colIndex === 0 || colIndex === 9) {
              cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: colIndex === 9 };
            } else {
              cell.alignment = { horizontal: 'center', vertical: 'middle' };
            }
          });

          // Destacar faltas
          const faltaCell = detailSheet.getCell(`H${detailRow}`);
          if (need.shortage > 0) {
            faltaCell.font = { color: { argb: 'FFDC2626' }, bold: true };
          } else {
            faltaCell.font = { color: { argb: 'FF16A34A' } };
          }

          // Ajustar formatação numérica
          detailSheet.getCell(`B${detailRow}`).numFmt = '0';
          detailSheet.getCell(`C${detailRow}`).numFmt = '0';
          detailSheet.getCell(`D${detailRow}`).numFmt = '0';
          detailSheet.getCell(`E${detailRow}`).numFmt = '0';
          detailSheet.getCell(`F${detailRow}`).numFmt = '0';
          detailSheet.getCell(`G${detailRow}`).numFmt = '0';
          detailSheet.getCell(`I${detailRow}`).numFmt = '0';

          detailRow++;
        });

        detailRow += 2;
      });

      // Larguras
      detailSheet.getColumn('A').width = 28;
      detailSheet.getColumn('B').width = 18;
      detailSheet.getColumn('C').width = 12;
      detailSheet.getColumn('D').width = 15;
      detailSheet.getColumn('E').width = 17;
      detailSheet.getColumn('F').width = 12;
      detailSheet.getColumn('G').width = 12;
      detailSheet.getColumn('H').width = 12;
      detailSheet.getColumn('I').width = 12;
      detailSheet.getColumn('J').width = 35;

      // ============================================
      // ABA 3: ESTOQUE INICIAL
      // ============================================
      const stockSheet = workbook.addWorksheet('Estoque Inicial', {
        views: [{ showGridLines: false }]
      });

      // Título
      stockSheet.mergeCells('A1:B1');
      const stockTitle = stockSheet.getCell('A1');
      stockTitle.value = 'ESTOQUE INICIAL';
      stockTitle.font = { size: 18, bold: true, color: { argb: colors.primary } };
      stockTitle.alignment = { horizontal: 'center', vertical: 'middle' };
      stockSheet.getRow(1).height = 35;

      // Cabeçalho
      const stockHeaderRow = stockSheet.getRow(3);
      stockHeaderRow.values = ['EPI', 'Quantidade'];
      stockHeaderRow.font = { bold: true, size: 11, color: { argb: colors.headerText } };
      stockHeaderRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: colors.headerBg }
      };
      stockHeaderRow.alignment = { horizontal: 'center', vertical: 'middle' };
      stockHeaderRow.height = 25;
      ['A', 'B'].forEach(col => {
        stockSheet.getCell(`${col}3`).border = {
          top: { style: 'thin', color: { argb: colors.border } },
          left: { style: 'thin', color: { argb: colors.border } },
          right: { style: 'thin', color: { argb: colors.border } },
          bottom: { style: 'thin', color: { argb: colors.border } }
        };
      });

      // Dados
      let stockRow = 4;
      const stockItems = Object.entries(data.epiCounts).sort(([a], [b]) => a.localeCompare(b));
      
      stockItems.forEach(([epi, qty], index) => {
        const row = stockSheet.getRow(stockRow);
        const q = parseInt(qty as string) || 0;
        row.values = [epi, q];
        row.font = { size: 11 };
        row.alignment = { vertical: 'middle' };
        row.height = 20;

        const bgColor = index % 2 === 0 ? colors.white : colors.lightGray;
        ['A', 'B'].forEach(col => {
          const cell = stockSheet.getCell(`${col}${stockRow}`);
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: bgColor }
          };
          cell.border = {
            left: { style: 'thin', color: { argb: colors.border } },
            right: { style: 'thin', color: { argb: colors.border } },
            bottom: { style: 'thin', color: { argb: colors.border } }
          };
        });
        
        stockSheet.getCell(`A${stockRow}`).alignment = { horizontal: 'left', vertical: 'middle' };
        stockSheet.getCell(`B${stockRow}`).alignment = { horizontal: 'center', vertical: 'middle' };
        stockSheet.getCell(`B${stockRow}`).numFmt = '0';
        stockRow++;
      });

      // Larguras
      stockSheet.getColumn('A').width = 45;
      stockSheet.getColumn('B').width = 18;

      // Salvar arquivo
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `solicitacao_epi_${data.obraName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao gerar Excel:', error);
      toast({
        title: "Erro ao gerar Excel",
        description: "Não foi possível gerar o arquivo. A solicitação foi salva mesmo assim.",
        variant: "destructive",
      });
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Carregando dados necessários...</p>
      </div>
    );
  }

  // Filtrar funções que tiveram EPIs solicitados (com shortage ou ajuste manual)
  const functionsWithRequests = functionRequests.filter((req) =>
    req.epiNeeds.some((need) => need.shortage > 0 || need.manualAdjust > 0)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Etapa 4: Resultado do Cálculo</h3>
          <p className="text-sm text-muted-foreground">
            Obra: {collectedData.obraName} — {collectedData.obraCity}/{collectedData.obraState}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Confira as necessidades de EPIs calculadas e faça ajustes se necessário
          </p>
        </div>
        <Button variant="outline" onClick={onBack}>
          Voltar
        </Button>
      </div>

      {/* RESUMO DA SOLICITAÇÃO - NO TOPO */}
      <div className="border rounded-lg p-4 bg-muted/10">
        <h4 className="text-sm font-semibold mb-4">Resumo da Solicitação</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>EPI</TableHead>
              <TableHead className="w-[150px]">Falta Calculada</TableHead>
              <TableHead className="w-[150px]">Total c/ Ajustes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(totalRequests)
              .filter(([, v]) => v.adjusted > 0)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([epi, data]) => (
                <TableRow key={epi}>
                  <TableCell className="font-medium">{epi}</TableCell>
                  <TableCell>{data.shortage}</TableCell>
                  <TableCell className="font-semibold">{data.adjusted}</TableCell>
                </TableRow>
              ))}
            {Object.entries(totalRequests).filter(([, v]) => v.adjusted > 0).length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-muted-foreground">
                  Nenhum EPI faltando no momento.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="border rounded-lg p-4 bg-muted/20">
        <div className="mb-4 space-y-1">
          <h4 className="text-sm font-semibold">Como funciona o cálculo:</h4>
          <p className="text-xs text-muted-foreground">
            • <strong>Efetivos</strong>: necessidade MENSAL baseada no intervalo de reposição (ex: intervalo 3 meses = 1/3 por mês)
          </p>
          <p className="text-xs text-muted-foreground">
            • <strong>Projetados</strong>: quantidade inteira para equipar os novos (ex: 5 novos = 5 unidades)
          </p>
          <p className="text-xs text-muted-foreground">
            • <strong>Total</strong>: Efetivos + Projetados
          </p>
          <p className="text-xs text-muted-foreground">
            • <strong>Falta</strong>: Total necessário - Estoque disponível (informado na Etapa 1)
          </p>
        </div>
      </div>

      {functionsWithRequests.length === 0 ? (
        <div className="border rounded-lg p-6 bg-green-50 text-center">
          <p className="text-green-700 font-medium">✓ Todos os EPIs necessários estão em estoque!</p>
          <p className="text-sm text-green-600 mt-1">Nenhum EPI foi solicitado para reposição.</p>
        </div>
      ) : (
        functionsWithRequests.map((req) => (
        <div key={req.functionName} className="mb-6 border rounded-lg p-4">
          <div className="grid gap-4 md:grid-cols-3 mb-4">
            <div>
              <Label className="font-semibold text-lg">{req.functionName}</Label>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Efetivos</Label>
              <div className="font-medium">{req.currentEmployees}</div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Projetados</Label>
              <div className="font-medium text-blue-600">{req.projectedEmployees}</div>
            </div>
          </div>

          {req.epiNeeds.length > 0 && (
            <div className="pl-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>EPI</TableHead>
                    <TableHead className="w-[110px] text-xs">Intervalo (meses)</TableHead>
                    <TableHead className="w-[90px] text-xs">Qtd/Func</TableHead>
                    <TableHead className="w-[90px]">Nec. Efetivos</TableHead>
                      <TableHead className="w-[90px]">Nec. Projetados</TableHead>
                      <TableHead className="w-[90px]">Total Mês</TableHead>
                      <TableHead className="w-[80px]">Estoque</TableHead>
                      <TableHead className="w-[70px]">Falta</TableHead>
                      <TableHead className="w-[110px]">Ajuste</TableHead>
                      <TableHead>Justificativa</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {req.epiNeeds.map((need, idx) => (
                      <TableRow key={`${req.functionName}-${need.epi}-${idx}`}>
                        <TableCell className="font-medium">
                          {need.epi}
                          {!availableEpis.includes(need.epi) && (
                            <div className="text-xs text-amber-700 font-medium mt-1">Material não cadastrado — justificativa obrigatória</div>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{need.intervalMonths} {need.intervalMonths === 1 ? 'mês' : 'meses'}</TableCell>
                        <TableCell className="text-muted-foreground">{need.quantityPerEmployee}</TableCell>
                        <TableCell>{need.currentNeed}</TableCell>
                        <TableCell className="font-semibold">{need.projectedNeed}</TableCell>
                        <TableCell className="font-semibold text-blue-600">{need.totalNeed}</TableCell>
                        <TableCell className="text-muted-foreground">{need.stock}</TableCell>
                        <TableCell className={need.shortage > 0 ? "text-red-600 font-semibold" : "text-green-600"}>
                          {need.shortage > 0 ? `${need.shortage}` : "OK"}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={need.manualAdjust}
                            onChange={(e) =>
                              updateManualAdjust(req.functionName, need.epi, e.target.value)
                            }
                            placeholder="0"
                          />
                        </TableCell>
                        <TableCell>
                          <Textarea
                            value={need.justification}
                            onChange={(e) =>
                              updateJustification(req.functionName, need.epi, e.target.value)
                            }
                            placeholder="Justificativa (obrigatória se ajustar)"
                            rows={1}
                            className="min-h-[32px]"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {/* Adicionar item manualmente */}
                <div className="mt-3">
                  {!addForms[req.functionName] ? (
                    <Button
                      variant="outline"
                      onClick={() => setAddForms((prev) => ({ ...prev, [req.functionName]: { query: "", count: "", justification: "" } }))}
                    >
                      + Adicionar item
                    </Button>
                  ) : (
                    <div className="mt-2 border rounded-md p-3 bg-white">
                      <div className="flex gap-2 items-start">
                        <div className="flex-1">
                          <Input
                            placeholder="Pesquisar EPI..."
                            value={addForms[req.functionName].query}
                            onChange={(e) => setAddForms((prev) => ({ ...prev, [req.functionName]: { ...prev[req.functionName], query: e.target.value } }))}
                          />
                          {addForms[req.functionName].query && (
                            <div className="mt-2 max-h-36 overflow-auto border rounded-md bg-white">
                              {availableEpis
                                .filter((i) => i.toLowerCase().includes((addForms[req.functionName].query || "").toLowerCase()))
                                .slice(0, 8)
                                .map((item) => (
                                  <div
                                    key={item}
                                    className="p-2 hover:bg-slate-100 cursor-pointer text-sm"
                                    onClick={() => setAddForms((prev) => ({ ...prev, [req.functionName]: { ...prev[req.functionName], query: item, selected: item } }))}
                                  >
                                    {item}
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                        <div className="w-24">
                          <Input
                            type="number"
                            placeholder="Qtd"
                            value={addForms[req.functionName].count}
                            onChange={(e) => setAddForms((prev) => ({ ...prev, [req.functionName]: { ...prev[req.functionName], count: e.target.value } }))}
                          />
                        </div>
                      </div>

                      <div className="mt-2">
                        <Textarea
                          placeholder="Justificativa (opcional)"
                          value={addForms[req.functionName].justification}
                          onChange={(e) => setAddForms((prev) => ({ ...prev, [req.functionName]: { ...prev[req.functionName], justification: e.target.value } }))}
                          rows={2}
                        />
                      </div>

                      <div className="mt-2 flex gap-2">
                        <Button
                          onClick={() => {
                            const form = addForms[req.functionName];
                            const epi = (form.selected || form.query || "").trim();
                            const qty = parseInt(form.count || "0", 10) || 0;
                            const justification = (form.justification || "").trim();
                            if (!epi || qty <= 0) {
                              toast({ title: "Preencha item e quantidade", variant: "destructive" });
                              return;
                            }
                            const isKnown = availableEpis.includes(epi);
                            if (!isKnown && !justification) {
                              toast({ title: "Justificativa obrigatória", description: `O item "${epi}" não está cadastrado. Informe uma justificativa.`, variant: "destructive" });
                              return; // keep form open
                            }
                            addManualEpiToFunction(req.functionName, epi, qty, justification);
                          }}
                        >
                          Adicionar
                        </Button>
                        <Button variant="outline" onClick={() => setAddForms((prev) => {
                          const copy = { ...prev };
                          delete copy[req.functionName];
                          return copy;
                        })}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))
      )}

      {functionsWithRequests.length > 0 && (
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={onBack}
            disabled={isSending}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmitRequest}
            disabled={isSending}
          >
            {isSending ? "Enviando..." : "Enviar Solicitação"}
          </Button>
        </div>
      )}
    </div>
  );
}
