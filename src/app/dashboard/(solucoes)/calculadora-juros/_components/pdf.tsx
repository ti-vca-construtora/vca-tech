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
import { Cliente } from '@/components/search-form'

import { LOGO_BASE64 } from '@/util/logo-base64'
import { contratos } from '@/data/contratos'
import { Contrato } from './contratos-tabela'
import { DueInstallment } from '@/app/api/avp/current-debit-balance/route'
import { CalculoPorParcela } from './visualizacao-calculo'

export type PdfProps = {
  valorTotalGeral: number
  valorAnteriorVencidas: number
  valorPresenteVencidas: number
  valorAnteriorFuturas: number
  valorPresenteFuturas: number
  dataAPagar: string
  currentDebit: DueInstallment[]
  cliente: Cliente
  contrato: Contrato
  incomeByBills: CalculoPorParcela[]
}

export function Pdf({
  cliente,
  contrato,
  currentDebit,
  dataAPagar,
  valorTotalGeral,
  valorAnteriorFuturas,
  valorPresenteFuturas,
  valorAnteriorVencidas,
  valorPresenteVencidas,
  incomeByBills,
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
            <span className="font-bold">Informações de contrato</span>
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
              Quantidade de Parcelas:{' '}
              <span className="font-semibold">
                {currentDebit.length + incomeByBills.length}
              </span>
            </p>
            {currentDebit.length > 0 && (
              <div className="flex flex-col gap-2 mt-4">
                <span className="font-bold">Subtotal parcelas vencidas</span>
                <p className="border-b w-full">
                  Quantidade de Parcelas:{' '}
                  <span className="font-semibold">{currentDebit.length}</span>
                </p>
                <p className="border-b w-full">
                  Valor Anterior de Parcelas Vencidas:{' '}
                  <span className="font-semibold">{`RS ${formatarValor(valorAnteriorVencidas)}`}</span>
                </p>
                <p className="border-b w-full">
                  Valor Presente de Parcelas Vencidas:{' '}
                  <span className="font-semibold">{`RS ${formatarValor(valorPresenteVencidas)}`}</span>
                </p>
                <p className="border-b w-full">
                  Valor Acréscimo:{' '}
                  <span className="font-semibold">{`RS ${formatarValor(valorPresenteVencidas - valorAnteriorVencidas)}`}</span>
                </p>
              </div>
            )}
            {incomeByBills.length > 0 && (
              <div className="flex flex-col gap-2 mt-4">
                <span className="font-bold">Subtotal parcelas futuras</span>
                <p className="border-b w-full">
                  Quantidade de Parcelas:{' '}
                  <span className="font-semibold">{incomeByBills.length}</span>
                </p>
                <p className="border-b w-full">
                  Valor Anterior de Parcelas Futuras:{' '}
                  <span className="font-semibold">{`RS ${formatarValor(valorAnteriorFuturas)}`}</span>
                </p>
                <p className="border-b w-full">
                  Valor Presente de Parcelas Futuras:{' '}
                  <span className="font-semibold">{`RS ${formatarValor(valorPresenteFuturas)}`}</span>
                </p>
                <p className="border-b w-full">
                  Valor Desconto:{' '}
                  <span className="font-semibold">{`RS ${formatarValor(valorAnteriorFuturas - valorPresenteFuturas)}`}</span>
                </p>
              </div>
            )}
            <div className="flex flex-col gap-2 mt-4">
              <span className="font-bold">Resumo</span>
              <p className="border-b w-full">
                Data a Pagar:{' '}
                <span className="font-semibold">
                  {formatarData(dataAPagar)}
                </span>
              </p>
              <span className="font-bold">
                Total: {`RS ${formatarValor(valorTotalGeral)}`}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="flex-grow w-full">
        <CardHeader>
          <CardTitle className="text-lg">Base de Cálculo</CardTitle>
          <CardDescription className="text-xs">
            Informações utilizadas no cálculo
          </CardDescription>
        </CardHeader>
        <CardContent>
          {incomeByBills.length > 0 && (
            <Card className="w-full ">
              <CardHeader>
                <CardTitle className="text-lg">Parcelas Futuras</CardTitle>
                <CardDescription className="text-xs">
                  Parcelas com a data de vencimento posterior à data de
                  pagamento
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
                    {incomeByBills.map((item, index) => (
                      <TableRow
                        className={classNames(
                          index % 2 === 0 && 'bg-neutral-100',
                        )}
                        key={index}
                      >
                        <TableCell>
                          R$ {formatarValor(item.valorAnterior)}
                        </TableCell>
                        <TableCell>
                          R$ {formatarValor(item.valorPresente)}
                        </TableCell>
                        <TableCell>
                          R${' '}
                          {formatarValor(
                            item.valorAnterior - item.valorPresente,
                          )}
                        </TableCell>
                        <TableCell>
                          {formatarData(item.dataVencimento)}
                        </TableCell>
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
          )}
          {currentDebit.length > 0 && (
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-lg">Parcelas Vencidas</CardTitle>
                <CardDescription className="text-xs">
                  Parcelas com a data de vencimento anterior à data de pagamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Valor Original</TableHead>
                      <TableHead>Valor Presente</TableHead>
                      <TableHead>Valor Acréscimo</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Pagamento</TableHead>
                      <TableHead>{`Período (dias)`}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentDebit.map((item, index) => (
                      <TableRow
                        className={classNames(
                          index % 2 === 0 && 'bg-neutral-100',
                        )}
                        key={index}
                      >
                        <TableCell>
                          R$ {formatarValor(item.adjustedValue)}
                        </TableCell>
                        <TableCell>
                          R${' '}
                          {formatarValor(
                            item.adjustedValue + item.additionalValue,
                          )}
                        </TableCell>
                        <TableCell>
                          R${' '}
                          {formatarValor(
                            item.adjustedValue +
                              item.additionalValue -
                              item.adjustedValue,
                          )}
                        </TableCell>
                        <TableCell>{formatarData(item.dueDate)}</TableCell>
                        <TableCell>{formatarData(dataAPagar)}</TableCell>
                        <TableCell>
                          {calcularDiferencaDias(dataAPagar, item.dueDate)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
