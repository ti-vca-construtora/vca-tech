'use client'

import { calcularDiferencaDias, formatarData, formatarValor } from '@/util'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import classNames from 'classnames'
import { Cliente } from './form'
import { Contrato } from './contratos-tabela'
import { ParcelaSelecionada } from './parcelas-tabela'
import { CalculoPorParcela } from './visualizacao-calculo'

import { LOGO_BASE64 } from '@/util/logo-base64'
import { contratos } from '@/data/contratos'

export type PdfProps = {
  valor: number
  dataAPagar: string
  parcelasSelecionadas: ParcelaSelecionada[]
  cliente: Cliente
  contrato: Contrato
  getValorPresenteTotal: () => number
  calculoPorParcela: CalculoPorParcela[]
}

export function Pdf({
  cliente,
  contrato,
  parcelasSelecionadas,
  valor,
  dataAPagar,
  getValorPresenteTotal,
  calculoPorParcela,
}: PdfProps) {
  const taxaTotal =
    contratos.find((contrato) => contrato.cliente === cliente.name)
      ?.taxaTotal || null

  return (
    <div
      id="downloadable"
      className="flex flex-col gap-4 w-full items-center justify-center h-full p-6 text-sm"
    >
      <img
        src={LOGO_BASE64}
        alt="Logo da VCA Construtora"
        style={{ width: '150px', height: 'auto' }}
      />
      <h1 className="font-bold text-center m-6 text-2xl">
        Simulação de Antecipação de Parcelas
      </h1>
      <Card className="w-full h-[500px]">
        <CardHeader>
          <CardTitle className="text-lg">Informações</CardTitle>
          <CardDescription className="text-xs">
            Informações relacionadas ao cliente, contrato e parcelas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <p className="border-b w-full">
              Cliente: <span className="font-semibold">{cliente.name}</span>
            </p>
            <p className="border-b w-full">
              Empreendimento:{' '}
              <span className="font-semibold">{contrato.enterpriseName}</span>
            </p>
            <p className="border-b w-full">
              Contrato:{' '}
              <span className="font-semibold">{contrato.contractNumber}</span>
            </p>
            <p className="border-b w-full">
              Unidade: <span className="font-semibold">{contrato.unit}</span>
            </p>
            <p className="border-b w-full">
              Quantidade de Títulos:{' '}
              <span className="font-semibold">
                {parcelasSelecionadas.length}
              </span>
            </p>
            <p className="border-b w-full">
              Valor Total Anterior:{' '}
              <span className="font-semibold">{`RS ${formatarValor(valor)}`}</span>
            </p>
            <p className="border-b w-full">
              Valor Total Presente:{' '}
              <span className="font-semibold">{`RS ${formatarValor(getValorPresenteTotal())}`}</span>
            </p>
            <p className="border-b w-full">
              Valor Desconto:{' '}
              <span className="font-semibold">{`RS ${formatarValor(valor - getValorPresenteTotal())}`}</span>
            </p>
            <p className="border-b w-full">
              Data a Pagar:{' '}
              <span className="font-semibold">{formatarData(dataAPagar)}</span>
            </p>
          </div>
        </CardContent>
      </Card>
      <Card className="flex-grow">
        <CardHeader>
          <CardTitle className="text-lg">Base de Cálculo</CardTitle>
          <CardDescription className="text-xs">
            Informações utilizadas no cálculo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Valor Original</TableHead>
                <TableHead>Valor Presente</TableHead>
                <TableHead>Valor Desconto</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>{`Período (dias)`}</TableHead>
                <TableHead>{`Taxa (%)`}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calculoPorParcela.map((item, index) => (
                <TableRow
                  className={classNames(index % 2 === 0 && 'bg-neutral-100')}
                  key={index}
                >
                  <TableCell>R$ {formatarValor(item.valorAnterior)}</TableCell>
                  <TableCell>R$ {formatarValor(item.valorPresente)}</TableCell>
                  <TableCell>
                    R$ {formatarValor(item.valorAnterior - item.valorPresente)}
                  </TableCell>
                  <TableCell>{formatarData(item.dataVencimento)}</TableCell>
                  <TableCell>{formatarData(item.dataAPagar)}</TableCell>
                  <TableCell>
                    {calcularDiferencaDias(
                      item.dataAPagar,
                      item.dataVencimento,
                    )}
                  </TableCell>
                  <TableCell>{taxaTotal}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
