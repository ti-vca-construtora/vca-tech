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
import { formatarData, formatarValor } from "@/util";
import { formatarCpfCnpj } from "@/util";
import { LOGO_BASE64 } from "@/util/logo-base64";
import classNames from "classnames";

export type PdfProps = {
  cliente: Cliente;
  contrato: Contrato;
  historicoIpc: HistoricoIpc[];
  parcelasCalculadas: ParcelaCalculada[];
  totalValorBaixa: number;
  totalRectoLiquido: number;
  totalValorAtualizado: number;
};

export function Pdf({
  cliente,
  contrato,
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

      {/* Histórico IPC */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Histórico IPC-DI</CardTitle>
          <CardDescription className="text-xs">
            Taxas de IPC utilizadas no cálculo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table className="shadow-md rounded bg-white text-xs">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Mês</TableHead>
                <TableHead className="w-[120px] text-right">IPC</TableHead>
                <TableHead className="w-[120px] text-right">IPC Acum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historicoIpc.map((item, index) => (
                <TableRow
                  key={index}
                  className={classNames(index % 2 === 0 && "bg-neutral-100")}
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

      {/* Resultados do Cálculo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Resultado do Cálculo IPC-DI
          </CardTitle>
          <CardDescription className="text-xs">
            Parcelas com valores atualizados pelo IPC-DI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table className="shadow-md rounded bg-white text-xs">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Dt. vencto</TableHead>
                <TableHead className="w-[50px]">Par</TableHead>
                <TableHead className="w-[100px]">Tipo Condição</TableHead>
                <TableHead className="w-[90px] text-right">
                  Valor original
                </TableHead>
                <TableHead className="w-[90px] text-right">
                  Valor corrigido
                </TableHead>
                <TableHead className="w-[80px]">Indexador</TableHead>
                <TableHead className="w-[70px] text-right">Juros</TableHead>
                <TableHead className="w-[80px]">Dt. base correção</TableHead>
                <TableHead className="w-[90px] text-right">
                  Saldo atual
                </TableHead>
                <TableHead className="w-[80px]">Data baixa</TableHead>
                <TableHead className="w-[90px] text-right">
                  Valor baixa
                </TableHead>
                <TableHead className="w-[90px] text-right">
                  Recto líq. c/ Mora
                </TableHead>
                <TableHead className="w-[70px] text-right">IPC Acum</TableHead>
                <TableHead className="w-[100px] text-right">
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
                  <TableCell className="font-medium">
                    {formatarData(item.parcela.dueDate)}
                  </TableCell>
                  <TableCell>{item.parcela.installmentNumber}</TableCell>
                  <TableCell>{item.parcela.conditionType}</TableCell>
                  <TableCell className="text-right">
                    R$ {formatarValor(item.parcela.originalValue)}
                  </TableCell>
                  <TableCell className="text-right">
                    R$ {formatarValor(item.parcela.adjustedValue)}
                  </TableCell>
                  <TableCell>{item.parcela.indexerName}</TableCell>
                  <TableCell className="text-right">
                    R$ {formatarValor(item.parcela.monetaryCorrectionValue)}
                  </TableCell>
                  <TableCell>
                    {formatarData(item.parcela.baseDateOfCorrection)}
                  </TableCell>
                  <TableCell className="text-right">
                    R$ {formatarValor(item.parcela.currentBalance)}
                  </TableCell>
                  <TableCell>{formatarData(item.dataBaixa)}</TableCell>
                  <TableCell className="text-right">
                    R$ {formatarValor(item.valorBaixa)}
                  </TableCell>
                  <TableCell className="text-right">
                    R${" "}
                    {formatarValor(
                      item.parcela.receipts[0]?.monetaryCorrectionValue || 0,
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.ipcAcumulado.toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    R$ {formatarValor(item.valorBaixaAtualizado)}
                  </TableCell>
                </TableRow>
              ))}
              {/* Linha de Totais */}
              <TableRow className="bg-azul-vca text-white font-bold">
                <TableCell colSpan={10} className="text-right">
                  TOTAIS:
                </TableCell>
                <TableCell className="text-right">
                  R$ {formatarValor(totalValorBaixa)}
                </TableCell>
                <TableCell className="text-right">
                  R$ {formatarValor(totalRectoLiquido)}
                </TableCell>
                <TableCell></TableCell>
                <TableCell className="text-right">
                  R$ {formatarValor(totalValorAtualizado)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {/* Resumo de Totais */}
      <div className="mt-8 mb-4 p-4 rounded bg-neutral-100 text-base font-semibold flex flex-col gap-2">
        <div>Resumo</div>
        <div>
          Total Valor baixa:{" "}
          <span className="font-bold">R$ {formatarValor(totalValorBaixa)}</span>
        </div>
        <div>
          Total Recto líquido com Mora:{" "}
          <span className="font-bold">
            R$ {formatarValor(totalRectoLiquido)}
          </span>
        </div>
        <div>
          Total Valor Princ Atualizado:{" "}
          <span className="font-bold">
            R$ {formatarValor(totalValorAtualizado)}
          </span>
        </div>
      </div>
    </div>
  );
}
