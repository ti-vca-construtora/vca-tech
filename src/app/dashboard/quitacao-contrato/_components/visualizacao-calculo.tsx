import { CurrentDebitBalanceApiResponse } from '@/app/api/avp/current-debit-balance/route'
import { Cliente, Contrato } from '@/components/search-form'
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
import {
  buscaTaxaPorContrato,
  calcularDiferencaDias,
  calcularTJM,
  calcularVPA,
  dias360,
  formatarData,
  formatarValor,
} from '@/util'
import classNames from 'classnames'
import { CalculoPorParcela } from '../../calculadora-juros/_components/visualizacao-calculo'
import { useEffect, useState } from 'react'

type VisualizaoCalculoProps = {
  currentDebit: CurrentDebitBalanceApiResponse
  contrato: Contrato
  cliente: Cliente
  valor: number
}

export function VisualizaoCalculo({
  currentDebit,
  contrato,
  cliente,
  valor,
}: VisualizaoCalculoProps) {
  const [calculoPorParcela, setCalculoPorParcela] = useState<
    CalculoPorParcela[]
  >([])

  const parcelaDoMesDoPagamento =
    currentDebit.results[0].payableInstallments.find((item) => {
      const dueDate = new Date(`${item.dueDate}T04:00:00Z`)
      const pagarDate = new Date(
        `${new Date().toISOString().split('T')[0]}T04:00:00Z`,
      )

      const isSameMonthYear =
        dueDate.getFullYear() === pagarDate.getFullYear() &&
        dueDate.getMonth() === pagarDate.getMonth()

      const hasValidPaymentTerm =
        item.indexerName.trim().match(/^M\d+$/) ||
        item.indexerName.trim().match(/^\d{2,}$/)

      return isSameMonthYear && hasValidPaymentTerm
    })

  // MODIFICAR ORIGNAL VALUE
  const hasFP = currentDebit.results[0].payableInstallments.some(
    (item) =>
      item.indexerName.trim() === 'FP' && Number(item.adjustedValue) > 0,
  )

  let hasPP = currentDebit.results[0].payableInstallments.some(
    (item) => item.indexerName.trim() === 'PP',
  )

  if (hasPP) {
    let hasM = currentDebit.results[0].payableInstallments.some(
      (item) => item.indexerName.trim().match(/^M\d+$/)?.input,
    )

    hasM = currentDebit.results[0].payableInstallments.some(
      (item) => item.indexerName.trim().match(/^\d{2,}$/)?.input,
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

    const primeiraParcela = currentDebit.results[0].payableInstallments[0]

    const calculoParcelas = currentDebit.results[0].payableInstallments
      .map((parcela) => {
        if (conditionTypeId) {
          return { ...parcela, paymentTerm: { id: conditionTypeId } }
        }
        return parcela
      })
      .map((item) => {
        const tipoDeParcela = item.indexerName
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
              valorPorParcela = item.adjustedValue
            } else if (taxaAnual) {
              const taxaDeJurosMensal = calcularTJM(taxaAnual)
              const mesesDeDiferenca = diferencaDias / 30

              valorPorParcela = calcularVPA(
                taxaDeJurosMensal,
                mesesDeDiferenca,
                item.adjustedValue,
              )
            }
            break
          }

          case 'PP':
          case 'M':
            valorPorParcela = item.adjustedValue * 1
            break

          // Para tipos 'M1', 'M2', ..., 'M9' ou '10', '11', '12', etc.
          case tipoDeParcela.match(/^M\d+$/)?.input:
          case tipoDeParcela.match(/^\d{2,}$/)?.input:
            if (parcelaDoMesDoPagamento) {
              valorPorParcela = parcelaDoMesDoPagamento.adjustedValue

              break
            }
            valorPorParcela = primeiraParcela.adjustedValue

            break

          default:
            valorPorParcela = item.adjustedValue
            break
        }

        return {
          valorAnterior: item.adjustedValue,
          valorPresente: valorPorParcela,
          dataAPagar: new Date().toISOString().split('T')[0],
          dataVencimento: item.dueDate,
          taxa: taxaAnual,
        }
      })

    setCalculoPorParcela(calculoParcelas)
  }

  const calculaValorPresenteTotal = () => {
    let total = 0

    if (currentDebit.results[0].dueInstallments) {
      total += currentDebit.results[0].dueInstallments.reduce(
        (total, parcela) => {
          const valorNumerico = parseFloat(
            parcela.adjustedValue.toString().replace(',', '.').trim(),
          )

          return total + (isNaN(valorNumerico) ? 0 : valorNumerico)
        },
        0,
      )
    }

    if (currentDebit.results[0].payableInstallments) {
      total += currentDebit.results[0].payableInstallments.reduce(
        (total, parcela) => {
          const valorNumerico = parseFloat(
            parcela.adjustedValue.toString().replace(',', '.').trim(),
          )

          return total + (isNaN(valorNumerico) ? 0 : valorNumerico)
        },
        0,
      )
    }

    return total
  }

  useEffect(() => {
    if (currentDebit.results[0].payableInstallments) {
      getValorPresentePorParcela()
    }
  }, [currentDebit.results[0].payableInstallments, contrato])

  console.log(calculoPorParcela)

  return (
    <div className="flex gap-4 justify-between w-full items-center h-full text-xs">
      <Card className="w-fit min-w-[400px] h-full">
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
                {currentDebit.results[0].dueInstallments &&
                  currentDebit.results[0].dueInstallments.length}
              </span>
            </p>
            <p className="border-b w-full">
              Valor Total Anterior:{' '}
              <span className="font-semibold">{`RS ${formatarValor(valor)}`}</span>
            </p>
            <p className="border-b w-full">
              Valor Total Presente:{' '}
              <span className="font-semibold">{`RS ${formatarValor(calculaValorPresenteTotal())}`}</span>
            </p>
            <p className="border-b w-full">
              Valor Acréscimo:{' '}
              <span className="font-semibold">{`RS ${formatarValor(calculaValorPresenteTotal() - valor)}`}</span>
            </p>
            <p className="border-b w-full">
              Data a Pagar:{' '}
              <span className="font-semibold">
                {formatarData(new Date().toISOString().split('T')[0])}
              </span>
            </p>
          </div>
        </CardContent>
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
            {currentDebit.results[0].dueInstallments ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Valor Original</TableHead>
                    <TableHead>Valor Presente</TableHead>
                    <TableHead>Valor Acréscimo</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead>{`Período (dias)`}</TableHead>
                    <TableHead>{`Taxa (%)`}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentDebit.results[0].dueInstallments.map(
                    (item, index) => (
                      <TableRow
                        className={classNames(
                          index % 2 === 0 && 'bg-neutral-100',
                        )}
                        key={index}
                      >
                        <TableCell>
                          R$ {formatarValor(item.originalValue)}
                        </TableCell>
                        <TableCell>
                          R${' '}
                          {formatarValor(
                            item.additionalValue + item.adjustedValue,
                          )}
                        </TableCell>
                        <TableCell>
                          R${' '}
                          {formatarValor(
                            item.additionalValue +
                              item.adjustedValue -
                              item.originalValue,
                          )}
                        </TableCell>
                        <TableCell>{formatarData(item.dueDate)}</TableCell>
                        <TableCell>
                          {formatarData(new Date().toISOString().split('T')[0])}
                        </TableCell>
                        <TableCell>
                          {calcularDiferencaDias(
                            new Date().toLocaleDateString(),
                            item.dueDate,
                          )}
                        </TableCell>
                        <TableCell>Sem taxa</TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            ) : (
              <span>Não há parcelas vencidas.</span>
            )}
          </CardContent>
        </Card>
        <Card className="flex-grow h-full text-xs">
          <CardHeader>
            <CardTitle className="text-lg">Parcelas Válidas</CardTitle>
            <CardDescription className="text-xs">
              Parcelas com data de vencimento posterior a data atual
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {currentDebit.results[0].payableInstallments ? (
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
                  {currentDebit.results[0].payableInstallments.map(
                    (item, index) => (
                      <TableRow
                        className={classNames(
                          index % 2 === 0 && 'bg-neutral-100',
                        )}
                        key={index}
                      >
                        <TableCell>
                          R$ {formatarValor(item.originalValue)}
                        </TableCell>
                        <TableCell>
                          R${' '}
                          {formatarValor(
                            item.additionalValue + item.adjustedValue,
                          )}
                        </TableCell>
                        <TableCell>
                          R${' '}
                          {formatarValor(
                            item.additionalValue +
                              item.adjustedValue -
                              item.originalValue,
                          )}
                        </TableCell>
                        <TableCell>{formatarData(item.dueDate)}</TableCell>
                        <TableCell>
                          {formatarData(new Date().toISOString().split('T')[0])}
                        </TableCell>
                        <TableCell>
                          {calcularDiferencaDias(
                            new Date().toLocaleDateString(),
                            item.dueDate,
                          )}
                        </TableCell>
                        <TableCell>Sem taxa</TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            ) : (
              <span>Não há parcelas para serem pagas.</span>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
