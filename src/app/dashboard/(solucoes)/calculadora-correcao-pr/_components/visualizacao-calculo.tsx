"use client";

import { useState, useEffect } from "react";
import { Cliente } from "@/components/search-form";
import { Contrato } from "./contratos-tabela";
import { ParcelaCurrentDebit } from "./parcelas-tabela";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  calcularIpcAcumuladoReverso,
  calcularValorAtualizado,
  formatarData,
  formatarValor,
  getIpcDiRate,
  formatarCpfCnpj,
} from "@/util";
import classNames from "classnames";
import { GeradorPdf } from "./gerador-pdf";
import { Pdf } from "./pdf";
import * as XLSX from "xlsx";

type VisualizacaoCalculoProps = {
  cliente: Cliente;
  contrato: Contrato;
  dataReferencia: string;
  parcelas: ParcelaCurrentDebit[];
  onVoltar?: () => void;
};

export type HistoricoIpc = {
  mes: string;
  ano: number;
  mesNumero: number;
  ipc: number;
  ipcAcumulado: number;
};

export type ParcelaCalculada = {
  parcela: ParcelaCurrentDebit;
  dataBaixa: string;
  valorBaixa: number;
  ipcAcumulado: number;
  valorBaixaAtualizado: number;
};

export function VisualizacaoCalculo({
  cliente,
  contrato,
  dataReferencia,
  parcelas,
  onVoltar,
}: VisualizacaoCalculoProps) {
  const [historicoIpc, setHistoricoIpc] = useState<HistoricoIpc[]>([]);
  const [parcelasCalculadas, setParcelasCalculadas] = useState<
    ParcelaCalculada[]
  >([]);

  useEffect(() => {
    // Gerar histórico de IPC reverso
    const gerarHistoricoIpc = () => {
      const [anoRef, mesRef] = dataReferencia.split("-").map(Number);
      const historico: HistoricoIpc[] = [];

      // Encontrar a data de baixa mais antiga entre as parcelas
      let mesInicio = mesRef;
      let anoInicio = anoRef;

      parcelas.forEach((parcela) => {
        if (parcela.receipts && parcela.receipts.length > 0) {
          const dataBaixa = new Date(parcela.receipts[0].receiptDate);
          const anoBaixa = dataBaixa.getFullYear();
          const mesBaixa = dataBaixa.getMonth() + 1;

          if (
            anoBaixa < anoInicio ||
            (anoBaixa === anoInicio && mesBaixa < mesInicio)
          ) {
            anoInicio = anoBaixa;
            mesInicio = mesBaixa;
          }
        }
      });

      // Gerar histórico do mês mais antigo até a referência
      let mesAtual = mesRef;
      let anoAtual = anoRef;
      let ipcAcumuladoProximo = 0;

      const mesesNome = [
        "jan",
        "fev",
        "mar",
        "abr",
        "mai",
        "jun",
        "jul",
        "ago",
        "set",
        "out",
        "nov",
        "dez",
      ];

      // Calcular do mês de referência para trás
      while (
        anoAtual > anoInicio ||
        (anoAtual === anoInicio && mesAtual >= mesInicio)
      ) {
        const taxaIpc = getIpcDiRate(mesAtual, anoAtual) || 0;

        // No mês de referência, IPC Acumulado = próprio IPC
        if (anoAtual === anoRef && mesAtual === mesRef) {
          ipcAcumuladoProximo = taxaIpc;
        } else {
          // Fórmula reversa: (1 + IPC_Acum_próximo) * (1 + IPC_atual) - 1
          ipcAcumuladoProximo =
            (1 + ipcAcumuladoProximo / 100) * (1 + taxaIpc / 100) - 1;
          ipcAcumuladoProximo *= 100;
        }

        historico.unshift({
          mes: mesesNome[mesAtual - 1],
          ano: anoAtual,
          mesNumero: mesAtual,
          ipc: taxaIpc,
          ipcAcumulado: ipcAcumuladoProximo,
        });

        // Voltar um mês
        mesAtual--;
        if (mesAtual < 1) {
          mesAtual = 12;
          anoAtual--;
        }
      }

      setHistoricoIpc(historico);
    };

    // Calcular valores das parcelas
    const calcularParcelas = () => {
      const calculadas: ParcelaCalculada[] = parcelas.map((parcela) => {
        const primeiroRecebimento = parcela.receipts[0];
        const dataBaixa = primeiroRecebimento.receiptDate;
        const valorBaixa = primeiroRecebimento.receiptValue;

        const ipcAcumulado = calcularIpcAcumuladoReverso(
          dataBaixa,
          dataReferencia
        );
        const valorBaixaAtualizado = calcularValorAtualizado(
          valorBaixa,
          ipcAcumulado
        );

        return {
          parcela,
          dataBaixa,
          valorBaixa,
          ipcAcumulado,
          valorBaixaAtualizado,
        };
      });

      setParcelasCalculadas(calculadas);
    };

    gerarHistoricoIpc();
    calcularParcelas();
  }, [parcelas, dataReferencia]);

  const calcularTotalValorBaixa = () => {
    return parcelasCalculadas.reduce(
      (total, item) => total + item.valorBaixa,
      0
    );
  };

  const calcularTotalValorAtualizado = () => {
    return parcelasCalculadas.reduce(
      (total, item) => total + item.valorBaixaAtualizado,
      0
    );
  };

  const exportarExcel = () => {
    // Função para formatar valores como moeda
    const formatarMoeda = (valor: number) => {
      return `R$ ${valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Função para formatar porcentagem
    const formatarPorcentagem = (valor: number) => {
      return `${valor.toFixed(2).replace(".", ",")}%`;
    };

    // Criar dados das parcelas com todas as colunas
    const dadosParcelas = parcelasCalculadas.map((item) => ({
      "Dt. vencto": formatarData(item.parcela.dueDate),
      Par: item.parcela.installmentNumber,
      "Tipo Condição": item.parcela.conditionType,
      "Valor original": formatarMoeda(item.parcela.originalValue),
      "Valor corrigido": formatarMoeda(item.parcela.adjustedValue),
      Indexador: item.parcela.indexerName,
      Juros: item.parcela.monetaryCorrectionValue,
      "Dt. base correção": formatarData(item.parcela.baseDateOfCorrection),
      "Saldo atual": item.parcela.currentBalance,
      "Data baixa": formatarData(item.dataBaixa),
      "Valor baixa": formatarMoeda(item.valorBaixa),
      "Recto líquido com Mora": formatarMoeda(
        item.parcela.receipts[0]?.receiptNetValue || 0
      ),
      "IPC Acum (%)": formatarPorcentagem(item.ipcAcumulado),
      "Valor Princ Atualizado": formatarMoeda(item.valorBaixaAtualizado),
    }));

    // Calcular totais
    const totalValorBaixa = calcularTotalValorBaixa();
    const totalRectoLiquido = parcelasCalculadas.reduce(
      (total, item) => total + (item.parcela.receipts[0]?.receiptNetValue || 0),
      0
    );
    const totalValorAtualizado = calcularTotalValorAtualizado();

    // Adicionar linha de totais
    dadosParcelas.push({
      "Dt. vencto": "",
      Par: "",
      "Tipo Condição": "",
      "Valor original": "",
      "Valor corrigido": "",
      Indexador: "",
      Juros: "",
      "Dt. base correção": "",
      "Saldo atual": "",
      "Data baixa": "TOTAIS:",
      "Valor baixa": formatarMoeda(totalValorBaixa),
      "Recto líquido com Mora": formatarMoeda(totalRectoLiquido),
      "IPC Acum (%)": "",
      "Valor Princ Atualizado": formatarMoeda(totalValorAtualizado),
    });

    // Criar dados do histórico IPC
    const dadosHistorico = historicoIpc.map((item) => ({
      Mês: `${item.mes}/${String(item.ano).slice(2)}`,
      "IPC (%)": item.ipc.toFixed(2),
      "IPC Acum (%)": item.ipcAcumulado.toFixed(2),
    }));

    // Criar workbook (Resultados primeiro, depois Histórico IPC)
    const wb = XLSX.utils.book_new();

    const wsParcelas = XLSX.utils.json_to_sheet(dadosParcelas);
    const wsHistorico = XLSX.utils.json_to_sheet(dadosHistorico);

    XLSX.utils.book_append_sheet(wb, wsParcelas, "Resultados");
    XLSX.utils.book_append_sheet(wb, wsHistorico, "IPC - Histórico");

    // Download
    const dataRef = new Date(dataReferencia + "-01").toLocaleDateString(
      "pt-BR",
      { month: "long", year: "numeric" }
    );
    XLSX.writeFile(
      wb,
      `atualizacao-valores-recebidos-${cliente.name}-${dataRef}.xlsx`
    );
  };

  const calcularTotalRectoLiquido = () => {
    return parcelasCalculadas.reduce(
      (total, item) => total + (item.parcela.receipts[0]?.receiptNetValue || 0),
      0
    );
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      {/* Conteúdo */}
      <div className="w-full h-full flex gap-6 text-xs">
        {/* Coluna da Esquerda - Histórico IPC */}
        <div className="w-1/3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">Histórico IPC-DI</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto">
              <Table className="shadow-md rounded bg-white">
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow>
                    <TableHead className="w-[100px]">Mês</TableHead>
                    <TableHead className="w-[80px] text-right">IPC</TableHead>
                    <TableHead className="w-[100px] text-right">
                      IPC Acum
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historicoIpc.map((item, index) => (
                    <TableRow
                      key={index}
                      className={classNames(
                        index % 2 === 0 && "bg-neutral-100"
                      )}
                    >
                      <TableCell className="font-medium">
                        {item.mes}/{String(item.ano).slice(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.ipc.toFixed(2)}%
                      </TableCell>
                      <TableCell className="text-right">
                        {item.ipcAcumulado.toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Coluna da Direita - Resultados do Cálculo */}
        <div className="w-2/3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">
                Resultado do Cálculo IPC-DI
              </CardTitle>
              <CardDescription className="text-xs">
                Parcelas selecionadas com valores atualizados pelo IPC-DI
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto">
              <Table className="shadow-md rounded bg-white">
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow>
                    <TableHead className="w-[100px]">DT. VENCTO</TableHead>
                    <TableHead className="w-[140px]">TIPO CONDIÇÃO</TableHead>
                    <TableHead className="w-[100px]">DATA BAIXA</TableHead>
                    <TableHead className="w-[120px] text-right">
                      VALOR BAIXA
                    </TableHead>
                    <TableHead className="w-[80px] text-right">
                      IPC ACUM
                    </TableHead>
                    <TableHead className="w-[130px] text-right">
                      VALOR ATUALIZADO
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parcelasCalculadas.map((item, index) => (
                    <TableRow
                      key={index}
                      className={classNames(
                        index % 2 === 0 && "bg-neutral-100"
                      )}
                    >
                      <TableCell className="font-medium">
                        {formatarData(item.parcela.dueDate)}
                      </TableCell>
                      <TableCell>{item.parcela.conditionType}</TableCell>
                      <TableCell>{formatarData(item.dataBaixa)}</TableCell>
                      <TableCell className="text-right">
                        R$ {formatarValor(item.valorBaixa)}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.ipcAcumulado.toFixed(2)}%
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        R$ {formatarValor(item.valorBaixaAtualizado)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Seção de Totais */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Resumo</CardTitle>
        </CardHeader>
        <CardContent className="w-full">
          <div className="flex flex-col gap-2">
            <p className="border-b w-full text-base">
              Total Valor baixa:{" "}
              <span className="font-semibold">
                R$ {formatarValor(calcularTotalValorBaixa())}
              </span>
            </p>
            <p className="border-b w-full text-base">
              Total Recto líquido com Mora:{" "}
              <span className="font-semibold">
                R$ {formatarValor(calcularTotalRectoLiquido())}
              </span>
            </p>
            <p className="border-b w-full text-lg">
              Total Valor Atualizado:{" "}
              <span className="font-semibold">
                R$ {formatarValor(calcularTotalValorAtualizado())}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Botões de Ação Centralizados */}
      <div className="flex gap-4 justify-center items-center mt-6">
        <button
          onClick={exportarExcel}
          className="w-32 bg-azul-claro-vca font-semibold text-white rounded py-2 px-3 text-sm hover:opacity-90 transition-opacity"
        >
          Exportar Excel
        </button>
        <GeradorPdf
          Component={Pdf}
          props={{
            cliente,
            contrato,
            historicoIpc,
            parcelasCalculadas,
            totalValorBaixa: calcularTotalValorBaixa(),
            totalRectoLiquido: calcularTotalRectoLiquido(),
            totalValorAtualizado: calcularTotalValorAtualizado(),
          }}
          fileName={`atualizacao-valores-recebidos-${cliente.name}-${new Date(
            dataReferencia + "-01"
          ).toLocaleDateString("pt-BR", {
            month: "long",
            year: "numeric",
          })}.pdf`}
        />
      </div>
    </div>
  );
}
