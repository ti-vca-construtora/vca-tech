'use client'

import {
  CurrentDebitBalanceApiResponse,
  DueInstallment,
} from '@/app/api/avp/current-debit-balance/route'
import { Cliente } from '@/components/search-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import {
  buscaTaxaPorContrato,
  calcularDiferencaDias,
  calcularTJM,
  calcularVPA,
  dias360,
  formatarData,
  formatarValor,
  handleFetchCurrentDebitBalance,
} from '@/util'
import classNames from 'classnames'
import { useEffect, useState } from 'react'
import { IncomeByBillsApiResponse } from '@/app/api/avp/income-by-bills/route'
import { Contrato } from './contratos-tabela'
import { GeradorPdf } from './gerador-pdf'
import { Pdf } from './pdf'

type VisualizaoCalculoProps = {
  currentDebit: CurrentDebitBalanceApiResponse
  incomeByBills: IncomeByBillsApiResponse
  originalIncomeByBills: IncomeByBillsApiResponse
  contrato: Contrato
  cliente: Cliente
  dataAPagar: string
}

export type CalculoPorParcela = {
  valorAnterior: number
  valorPresente: number
  dataAPagar: string
  dataVencimento: string
  taxa: number
  indexador?: string
}

export function VisualizaoCalculo({
  currentDebit,
  incomeByBills,
  originalIncomeByBills,
  contrato,
  cliente,
  dataAPagar,
}: VisualizaoCalculoProps) {
  const [calculoPorParcela, setCalculoPorParcela] = useState<
    CalculoPorParcela[]
  >([])
  const [updatedCurrentDebitDue, setUpdatedCurrentDebitDue] = useState<
    DueInstallment[]
  >([])
  const [isLoading, setIsLoading] = useState(true)

  const excludedFullPaymentTerms = [
    'Financiamento CEF',
    'Financiamento Outros Bancos',
    'FGTS Financiável',
    'Subsídio Financiável',
    'Parcela Única',
    'Permuta',
    'Morar Bem - PE',
  ]

  const getParcelaDoMesDoPagamento = () => {
    const isSameMonthYear = (dueDate: string, targetDate: Date): boolean => {
      const due = new Date(`${dueDate}T04:00:00Z`)

      return (
        due.getMonth() === targetDate.getMonth() &&
        due.getFullYear() === targetDate.getFullYear()
      )
    }

    const pagarDate = new Date(
      `${new Date().toISOString().split('T')[0]}T04:00:00Z`,
    )

    const checkOrder = [
      currentDebit.data[0].payableInstallments,
      currentDebit.data[0].paidInstallments,
      currentDebit.data[0].dueInstallments,
    ]

    for (const installments of checkOrder) {
      if (installments && installments.length > 0) {
        const found = installments
          .filter((parcela) => {
            const paymentTermId = parcela.conditionType
              .trim()
              .replaceAll(' ', '')
              .toUpperCase()

            return !excludedFullPaymentTerms
              .map((term) => term.trim().replaceAll(' ', '').toUpperCase())
              .includes(paymentTermId)
          })
          .find(
            (inst) =>
              inst.dueDate &&
              isSameMonthYear(inst.dueDate, pagarDate) &&
              ((inst.conditionType.toUpperCase().includes('MENSAL') &&
                inst.conditionType.toUpperCase().includes('ANO')) ||
                inst.conditionType.toUpperCase().includes('MENSAL HABITAR')),
          )

        if (found) {
          return {
            originalAmount: found.adjustedValue,
          }
        }
      }
    }

    return undefined
  }

  const parcelaDoMesDoPagamento = getParcelaDoMesDoPagamento()

  const hasFP = originalIncomeByBills.data.some(
    (item) =>
      item.paymentTerm.id.trim() === 'FP' &&
      Number(item.correctedBalanceAmount) > 0,
  )

  let hasPP = originalIncomeByBills.data.some(
    (item) =>
      item.paymentTerm.id.trim() === 'PP' &&
      Number(item.correctedBalanceAmount) > 0,
  )

  if (hasPP) {
    const hasM = originalIncomeByBills.data.some(
      (item) =>
        item.paymentTerm.id.trim().match(/^M\d+$/)?.input ||
        item.paymentTerm.id.trim().match(/^\d{2,}$/)?.input,
    )

    if (hasM) {
      hasPP = false
    }
  }

  const conditionTypeId = hasFP ? 'FP' : hasPP ? 'PP' : null

  const getValorPresentePorParcela = () => {
    const taxaAdm = buscaTaxaPorContrato(contrato.contractNumber)?.taxaAdm
    const taxaTotal = buscaTaxaPorContrato(contrato.contractNumber)?.taxaTotal

    let taxaAnual: number

    const primeiraParcela = incomeByBills.data[0]

    const calculoParcelas = incomeByBills.data
      .map((parcela) => {
        if (conditionTypeId) {
          return { ...parcela, paymentTerm: { id: conditionTypeId } }
        }
        return parcela
      })
      .map((item) => {
        const tipoDeParcela = item.paymentTerm.id
        const diferencaDias = dias360(
          new Date(`${new Date().toISOString().split('T')[0]}T04:00:00Z`),
          new Date(`${item.dueDate}T04:00:00Z`),
        )

        if (taxaTotal && taxaAdm) {
          taxaAnual = taxaTotal - taxaAdm
        }

        let valorPorParcela = 0

        switch (tipoDeParcela.trim()) {
          case 'FP': {
            const dataAPagarDate = new Date(
              `${new Date().toISOString().split('T')[0]}T04:00:00Z`,
            )
            const dataVencimento = new Date(`${item.dueDate}T04:00:00Z`)

            const isMesAtual =
              dataVencimento.getFullYear() === dataAPagarDate.getFullYear() &&
              dataVencimento.getMonth() === dataAPagarDate.getMonth()

            if (isMesAtual) {
              valorPorParcela = item.correctedBalanceAmount
            } else if (taxaAnual) {
              const taxaDeJurosMensal = calcularTJM(taxaAnual)
              const mesesDeDiferenca = diferencaDias / 30

              valorPorParcela = calcularVPA(
                taxaDeJurosMensal,
                mesesDeDiferenca,
                item.correctedBalanceAmount,
              )
            }
            break
          }

          case 'PP':
          case 'M':
            valorPorParcela = item.correctedBalanceAmount * 1
            break

          // Para tipos 'M1', 'M2', ..., 'M9' ou '10', '11', '12', etc.
          case tipoDeParcela.match(/^M\d+$/)?.input:
          case tipoDeParcela.match(/^\d{2,}$/)?.input:
          case 'MH':
            if (parcelaDoMesDoPagamento) {
              valorPorParcela = parcelaDoMesDoPagamento.originalAmount

              break
            }
            valorPorParcela = primeiraParcela.correctedBalanceAmount

            break

          default:
            valorPorParcela = item.correctedBalanceAmount
            break
        }

        return {
          valorAnterior: item.correctedBalanceAmount,
          valorPresente: valorPorParcela,
          dataAPagar: new Date().toISOString().split('T')[0],
          dataVencimento: item.dueDate,
          taxa: taxaAnual,
          indexador: item.indexerName,
        }
      })

    setCalculoPorParcela(calculoParcelas)
  }

  const calculaValorTotalPresenteVencidas = () => {
    let total = 0

    if (updatedCurrentDebitDue) {
      total += updatedCurrentDebitDue.reduce((total, parcela) => {
        const valorString = (parcela.adjustedValue + parcela.additionalValue)
          .toString()
          .replace(',', '.')

        const valorNumerico = parseFloat(valorString) || 0

        return total + valorNumerico
      }, 0)
    }

    return total
  }

  const calculaValorTotalPresenteFuturas = () => {
    return calculoPorParcela.reduce(
      (soma, parcela) => soma + (parcela.valorPresente || 0),
      0,
    )
  }

  const valorTotalGeral = () => {
    return (
      calculaValorTotalPresenteVencidas() + calculaValorTotalPresenteFuturas()
    )
  }

  const calculaQuantidadeTitulosVencidos = () => {
    return currentDebit.data[0].dueInstallments
      ? currentDebit.data[0].dueInstallments.filter((parcela) => {
          const paymentTermId = parcela.conditionType
            .trim()
            .replaceAll(' ', '')
            .toUpperCase()

          return !excludedFullPaymentTerms
            .map((term) => term.trim().replaceAll(' ', '').toUpperCase())
            .includes(paymentTermId)
        }).length
      : 0
  }

  const calculaQuantidadeTotalTitulos = () => {
    return calculoPorParcela.length + calculaQuantidadeTitulosVencidos()
  }

  const atualizaCurrentDebit = async () => {
    setIsLoading(true)

    try {
      const response: CurrentDebitBalanceApiResponse =
        await handleFetchCurrentDebitBalance(
          contrato.customerId,
          contrato.contractNumber,
          contrato.origem,
          cliente.documentNumber,
          cliente.documentType,
          dataAPagar,
        )

      if (response.data[0].dueInstallments) {
        setUpdatedCurrentDebitDue(
          response.data[0].dueInstallments.filter((parcela) => {
            const paymentTermId = parcela.conditionType
              .trim()
              .replaceAll(' ', '')
              .toUpperCase()

            return !excludedFullPaymentTerms
              .map((term) => term.trim().replaceAll(' ', '').toUpperCase())
              .includes(paymentTermId)
          }),
        )
      }
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  const calcularTotalParcelasFuturas = () => {
    return incomeByBills.data.reduce((total, parcela) => {
      const valorNumerico = parseFloat(
        parcela.correctedBalanceAmount.toString().replace(',', '.').trim(),
      )
      return total + (isNaN(valorNumerico) ? 0 : valorNumerico)
    }, 0)
  }

  const calcularTotalParcelasVencidas = () => {
    let total = 0

    if (updatedCurrentDebitDue) {
      total += updatedCurrentDebitDue.reduce((total, parcela) => {
        const valorNumerico = parseFloat(
          parcela.originalValue.toString().replace(',', '.').trim(),
        )

        return total + (isNaN(valorNumerico) ? 0 : valorNumerico)
      }, 0)
    }

    return total
  }

  useEffect(() => {
    if (incomeByBills.data.length > 0) {
      getValorPresentePorParcela()
    }

    if (currentDebit.data.length > 0) {
      atualizaCurrentDebit()
    }
  }, [incomeByBills.data, contrato, currentDebit.data])

  return (
    <div className="flex flex-col gap-4 justify-between w-full items-center h-full text-xs">
      <div className="flex gap-4 justify-between w-full items-center h-full">
        <Card className="w-fit min-w-[400px] h-full flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-lg">Informações</CardTitle>
            <CardDescription className="text-xs">
              Informações relacionadas ao cliente, contrato e parcelas
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="flex flex-col gap-2 h-full">
              <div className="flex flex-col gap-2">
                <span className="font-bold text-base border-l-8 pl-4 border-azul-vca">
                  Informações de contrato
                </span>
                <p className="border-b w-full">
                  Cliente: <span className="font-semibold">{cliente.name}</span>
                </p>
                <p className="border-b w-full">
                  Empreendimento:{' '}
                  <span className="font-semibold">
                    {contrato.enterpriseName}
                  </span>
                </p>
                <p className="border-b w-full">
                  Contrato:{' '}
                  <span className="font-semibold">
                    {contrato.contractNumber}
                  </span>
                </p>
                <p className="border-b w-full">
                  Unidade:{' '}
                  <span className="font-semibold">{contrato.unit}</span>
                </p>
                <p className="border-b w-full">
                  Quantidade total de parcelas:{' '}
                  <span className="font-semibold">
                    {calculaQuantidadeTotalTitulos()}
                  </span>
                </p>
              </div>
              <span className="font-bold mt-2 text-base border-l-8 pl-4 border-red-500">
                Subtotal parcelas vencidas
              </span>
              {currentDebit.data[0].dueInstallments ? (
                <div className="flex flex-col gap-2">
                  <p className="border-b w-full">
                    Quantidade de parcelas:{' '}
                    <span className="font-semibold">
                      {calculaQuantidadeTitulosVencidos()}
                    </span>
                  </p>
                  <p className="border-b w-full">
                    Valor Total Anterior:{' '}
                    <span className="font-semibold">{`R$ ${formatarValor(calcularTotalParcelasVencidas())}`}</span>
                  </p>
                  <p className="border-b w-full">
                    Valor Total Presente:{' '}
                    <span className="font-semibold">{`R$ ${formatarValor(calculaValorTotalPresenteVencidas())}`}</span>
                  </p>
                  <p className="border-b w-full">
                    Valor Acrescido:{' '}
                    <span className="font-semibold">{`R$ ${formatarValor(calculaValorTotalPresenteVencidas() - calcularTotalParcelasVencidas())}`}</span>
                  </p>
                </div>
              ) : (
                <span>Não há parcelas vencidas.</span>
              )}
              <span className="font-bold mt-2 text-base border-l-8 pl-4 border-green-500">
                Subtotal parcelas futuras
              </span>
              {calculoPorParcela.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <p className="border-b w-full">
                    Quantidade de parcelas:{' '}
                    <span className="font-semibold">
                      {calculoPorParcela.length}
                    </span>
                  </p>
                  <p className="border-b w-full">
                    Valor Total Anterior:{' '}
                    <span className="font-semibold">{`R$ ${formatarValor(calcularTotalParcelasFuturas())}`}</span>
                  </p>
                  <p className="border-b w-full">
                    Valor Total Presente:{' '}
                    <span className="font-semibold">{`R$ ${formatarValor(calculaValorTotalPresenteFuturas())}`}</span>
                  </p>
                  <p className="border-b w-full">
                    Valor Descontado:{' '}
                    <span className="font-semibold">{`R$ ${formatarValor(Math.abs(calculaValorTotalPresenteFuturas() - calcularTotalParcelasFuturas()))}`}</span>
                  </p>
                </div>
              ) : (
                <span>Não há parcelas futuras.</span>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Resumo</CardTitle>
              </CardHeader>
              <CardContent className="w-full items-center justify-center">
                <div className="flex flex-col gap-2">
                  <p className="border-b w-full">
                    Data a Pagar:{' '}
                    <span className="font-semibold">
                      {formatarData(dataAPagar)}
                    </span>
                  </p>
                  <p className="border-b w-full text-lg">
                    Valor:{' '}
                    <span className="font-semibold">
                      {`R$ ${formatarValor(Number(valorTotalGeral().toFixed(2)))}`}
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </CardFooter>
        </Card>
        <div className="flex flex-col gap-2 w-full h-full">
          <Card className="flex-grow h-full text-xs">
            <CardHeader>
              <CardTitle className="text-lg">Parcelas Vencidas</CardTitle>
              <CardDescription className="text-xs">
                Parcelas com data de vencimento anterior a data atual
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-azul-claro-vca"></div>
                </div>
              ) : updatedCurrentDebitDue &&
                updatedCurrentDebitDue.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Valor Original</TableHead>
                      <TableHead>Valor Presente</TableHead>
                      <TableHead>Valor Acréscimo</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Indexador</TableHead>
                      <TableHead>{`Período (dias)`}</TableHead>
                      <TableHead>{`Taxa (%)`}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {updatedCurrentDebitDue.map((item, index) => (
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
                            item.additionalValue + item.adjustedValue,
                          )}
                        </TableCell>
                        <TableCell>
                          R$ {formatarValor(item.additionalValue)}
                        </TableCell>
                        <TableCell>{formatarData(item.dueDate)}</TableCell>
                        <TableCell>{item.indexerName}</TableCell>
                        <TableCell>
                          {calcularDiferencaDias(
                            new Date().toISOString().split('T')[0],
                            item.dueDate,
                          )}
                        </TableCell>
                        <TableCell>Sem taxa</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <span>Não há parcelas vencidas.</span>
              )}
            </CardContent>
          </Card>
          <Card className="flex-grow h-full text-xs">
            <CardHeader>
              <CardTitle className="text-lg">Parcelas Futuras</CardTitle>
              <CardDescription className="text-xs">
                Parcelas com data de vencimento posterior a data atual
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {calculoPorParcela.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Valor Original</TableHead>
                      <TableHead>Valor Presente</TableHead>
                      <TableHead>Valor Desconto</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Indexador</TableHead>
                      <TableHead>{`Período (dias)`}</TableHead>
                      <TableHead>{`Taxa (%)`}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {calculoPorParcela.map((item, index) => (
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
                        <TableCell>{item.indexador}</TableCell>
                        <TableCell>
                          {calcularDiferencaDias(
                            new Date().toISOString().split('T')[0],
                            item.dataVencimento,
                          )}
                        </TableCell>
                        <TableCell>{item.taxa}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <span>Não há parcelas para serem pagas.</span>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="flex items-center gap-2 h-fit p-4">
        <GeradorPdf
          Component={Pdf}
          props={{
            cliente,
            contrato,
            dataAPagar,
            currentDebit: updatedCurrentDebitDue,
            incomeByBills: calculoPorParcela,
            valorTotalGeral: valorTotalGeral(),
            valorAnteriorFuturas: calcularTotalParcelasFuturas(),
            valorPresenteFuturas: calculaValorTotalPresenteFuturas(),
            valorAnteriorVencidas: calcularTotalParcelasVencidas(),
            valorPresenteVencidas: calculaValorTotalPresenteVencidas(),
          }}
          fileName={`${contrato.contractNumber}-AVP`}
        />
        <button
          onClick={() => window.location.reload()}
          className="w-48 bg-azul-claro-vca text-white rounded font-bold py-1 px-3 self-end disabled:bg-gray-300"
        >
          Fazer nova simulação
        </button>
      </div>
    </div>
  )
}
