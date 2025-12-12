/* eslint-disable prettier/prettier */
"use client";

import { Cliente } from "@/components/search-form";
import { Contrato } from "./contratos-tabela";
import { HistoricoIpc, ParcelaCalculada } from "./visualizacao-calculo";
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
import { formatarData, formatarValor, formatarCpfCnpj, IndexType } from "@/util";
import { LOGO_BASE64 } from "@/util/logo-base64";
import classNames from "classnames";

export type PdfProps = {
  cliente: Cliente;
  contrato: Contrato;
  indiceSelecionado: IndexType;
  historicoIpc: HistoricoIpc[];
  parcelasCalculadas: ParcelaCalculada[];
  totalValorBaixa: number;
  totalRectoLiquido: number;
  totalValorAtualizado: number;
};

export function Pdf({
  cliente,
  contrato,
  indiceSelecionado,
  historicoIpc,
  parcelasCalculadas,
  totalValorBaixa,
  totalRectoLiquido,
  totalValorAtualizado,
}: PdfProps) {
  return (
    <div id="downloadable" className="p-8 bg-white">
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <img src={LOGO_BASE64} alt="Logo VCA" className="h-20" />
      </div>

      {/* Título */}
      <h1 className="font-bold text-center mb-6 text-2xl">
        Atualização de Valores Recebidos
      </h1>

      {/* Informações do Cliente e Contrato */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              <strong>Nome:</strong> {cliente.name}
            </p>
            <p className="text-sm">
              <strong>CPF/CNPJ:</strong>{" "}
              {formatarCpfCnpj(cliente.documentNumber)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contrato</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              <strong>Número:</strong> {contrato.contractNumber}
            </p>
            <p className="text-sm">
              <strong>Unidade:</strong> {contrato.unit}
            </p>
            <p className="text-sm">
              <strong>Empreendimento:</strong> {contrato.enterpriseName}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Resumo de Totais */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Resumo</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span>Total Valor baixa:</span>
            <span className="font-bold">
              R$ {formatarValor(totalValorBaixa)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Total Recto líquido com Mora:</span>
            <span className="font-bold">
              R$ {formatarValor(totalRectoLiquido)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Total Valor Atualizado:</span>
            <span className="font-bold">
              R$ {formatarValor(totalValorAtualizado)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Histórico do Índice */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Histórico {indiceSelecionado}</CardTitle>
          <CardDescription className="text-xs">
            Taxas de {indiceSelecionado} utilizadas no cálculo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table className="shadow-md rounded bg-white border-collapse">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px] border border-neutral-300 text-xs">
                  Mês
                </TableHead>
                <TableHead className="w-[120px] text-right border border-neutral-300 text-xs">
                  {indiceSelecionado}
                </TableHead>
                <TableHead className="w-[120px] text-right border border-neutral-300 text-xs">
                  {indiceSelecionado} Acum
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historicoIpc.map((item, index) => (
                <TableRow
                  key={index}
                  className={classNames(index % 2 === 0 && "bg-neutral-100")}
                >
                  <TableCell className="font-medium border border-neutral-300 text-[10px]">
                    {item.mes}/{String(item.ano).slice(2)}
                  </TableCell>
                  <TableCell className="text-right border border-neutral-300 text-[10px]">
                    {item.taxa.toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-right border border-neutral-300 text-[10px]">
                    {item.acumulado.toFixed(2)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Resultados do Cálculo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Resultado do Cálculo {indiceSelecionado}
          </CardTitle>
          <CardDescription className="text-xs">
            Parcelas com valores atualizados pelo {indiceSelecionado}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table className="shadow-md rounded bg-white border-collapse">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px] border border-neutral-300 text-xs">
                  Dt. vencto
                </TableHead>
                <TableHead className="w-[50px] border border-neutral-300 text-xs">
                  Par
                </TableHead>
                <TableHead className="w-[100px] border border-neutral-300 text-xs">
                  Tipo Condição
                </TableHead>
                <TableHead className="w-[90px] text-right border border-neutral-300 text-xs">
                  Valor original
                </TableHead>
                <TableHead className="w-[90px] text-right border border-neutral-300 text-xs">
                  Valor corrigido
                </TableHead>
                <TableHead className="w-[90px] text-right border border-neutral-300 text-xs">
                  Saldo atual
                </TableHead>
                <TableHead className="w-[80px] border border-neutral-300 text-xs">
                  Data baixa
                </TableHead>
                <TableHead className="w-[90px] text-right border border-neutral-300 text-xs">
                  Valor baixa
                </TableHead>
                <TableHead className="w-[90px] text-right border border-neutral-300 text-xs">
                  Recto líq. c/ Mora
                </TableHead>
                <TableHead className="w-[70px] text-right border border-neutral-300 text-xs">
                  {indiceSelecionado} Acum
                </TableHead>
                <TableHead className="w-[100px] text-right border border-neutral-300 text-xs">
                  Valor Princ Atualizado
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parcelasCalculadas.map((item, index) => (
                <TableRow
                  key={index}
                  className={classNames(index % 2 === 0 && "bg-neutral-100")}
                >
                  <TableCell className="font-medium border border-neutral-300 text-[10px]">
                    {formatarData(item.parcela.dueDate)}
                  </TableCell>
                  <TableCell className="border border-neutral-300 text-[10px]">
                    {item.parcela.installmentNumber}
                  </TableCell>
                  <TableCell className="border border-neutral-300 text-[10px]">
                    {item.parcela.conditionType}
                  </TableCell>
                  <TableCell className="text-right border border-neutral-300 text-[10px]">
                    R$ {formatarValor(item.parcela.originalValue)}
                  </TableCell>
                  <TableCell className="text-right border border-neutral-300 text-[10px]">
                    R$ {formatarValor(item.parcela.adjustedValue)}
                  </TableCell>
                  <TableCell className="text-right border border-neutral-300 text-[10px]">
                    R$ {formatarValor(item.parcela.currentBalance)}
                  </TableCell>
                  <TableCell className="border border-neutral-300 text-[10px]">
                    {formatarData(item.dataBaixa)}
                  </TableCell>
                  <TableCell className="text-right border border-neutral-300 text-[10px]">
                    R$ {formatarValor(item.valorBaixa)}
                  </TableCell>
                  <TableCell className="text-right border border-neutral-300 text-[10px]">
                    R${" "}
                    {formatarValor(
                      item.parcela.receipts[0]?.receiptNetValue || 0
                    )}
                  </TableCell>
                  <TableCell className="text-right border border-neutral-300 text-[10px]">
                    {item.indexAcumulado.toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-right font-bold border border-neutral-300 text-[10px]">
                    R$ {formatarValor(item.valorBaixaAtualizado)}
                  </TableCell>
                </TableRow>
              ))}
              {/* Linha de Totais */}
              <TableRow className="bg-azul-vca text-white font-bold">
                <TableCell
                  colSpan={7}
                  className="text-right border border-neutral-300 text-xs"
                >
                  TOTAIS:
                </TableCell>
                <TableCell className="text-right border border-neutral-300 text-xs">
                  R$ {formatarValor(totalValorBaixa)}
                </TableCell>
                <TableCell className="text-right border border-neutral-300 text-xs">
                  R$ {formatarValor(totalRectoLiquido)}
                </TableCell>
                <TableCell className="border border-neutral-300 text-xs">
                  -
                </TableCell>
                <TableCell className="text-right border border-neutral-300 text-xs">
                  R$ {formatarValor(totalValorAtualizado)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
