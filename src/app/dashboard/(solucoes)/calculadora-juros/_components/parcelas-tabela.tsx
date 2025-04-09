'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import classNames from 'classnames'
import { useState } from 'react'
import { Cliente } from '@/components/search-form'
import { Loader2Icon } from 'lucide-react'
import { VisualizaoCalculo } from './visualizacao-calculo'
import { formatarData, formatarValor } from '@/util'
import {
  IncomeByBillsApiResponse,
  Parcela,
} from '@/app/api/avp/income-by-bills/route'
import { ClienteInfo } from '@/components/cliente-info'
import { Contrato } from './contratos-tabela'
import { CurrentDebitBalanceApiResponse } from '@/app/api/avp/current-debit-balance/route'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type ParcelasTabelaProps = {
  cliente: Cliente
  incomeByBills: IncomeByBillsApiResponse
  currentDebitBalance: CurrentDebitBalanceApiResponse
  contrato: Contrato
}

export type ParcelaSelecionada = Parcela & {
  index: number
}

export function ParcelasTabela({
  cliente,
  incomeByBills,
  currentDebitBalance,
  contrato,
}: ParcelasTabelaProps) {
  const [parcelasValidasSelecionadas, setParcelasValidasSelecionadas] =
    useState<ParcelaSelecionada[]>([])
  const [calculo, setCalculo] = useState<boolean>(false)
  const [selectedDate, setSelectedDate] = useState('')

  const handleSelectTodasParcelas = () => {
    if (parcelasValidasSelecionadas.length === updateParcelas.length) {
      setParcelasValidasSelecionadas([])

      return
    }

    setParcelasValidasSelecionadas(
      updateParcelas.map((item, index) => {
        return {
          ...item,
          index,
        }
      }),
    )
  }

  const handleParcelasPorTipo = (tipo: string) => {
    setParcelasValidasSelecionadas(
      updateParcelas
        .filter((parcela) => parcela.paymentTerm.id === tipo)
        .map((item, index) => {
          return {
            ...item,
            index,
          }
        }),
    )
  }

  const handleSelectParcela = (parcela: Parcela, index: number) => {
    setParcelasValidasSelecionadas((prev) => {
      const parcelaJaSelecionada = prev.some(
        (p) => p.installmentId === parcela.installmentId,
      )

      if (parcelaJaSelecionada) {
        return prev.filter((p) => p.installmentId !== parcela.installmentId)
      } else {
        return [...prev, { ...parcela, index }]
      }
    })
  }

  const isParcelaSelecionada = (parcela: Parcela) =>
    parcelasValidasSelecionadas.some(
      (p) => p.installmentId === parcela.installmentId,
    )

  const calcularTotalParcelasSelecionadas = () => {
    return parcelasValidasSelecionadas.reduce((total, parcela) => {
      const valorNumerico = parseFloat(
        parcela.correctedBalanceAmount.toString().replace(',', '.').trim(),
      )
      return total + (isNaN(valorNumerico) ? 0 : valorNumerico)
    }, 0)
  }

  const sortByDueDateDesc = (array: Parcela[]) => {
    if (array.length <= 1) return array

    const validParcels = array.filter(
      (parcela) => parcela.correctedBalanceAmount !== 0,
    )

    if (validParcels.length === 0) return []

    const closestParcel = validParcels.reduce((prev, curr) =>
      new Date(prev.dueDate) < new Date(curr.dueDate) ? prev : curr,
    )

    const sortedValidParcels = [...validParcels].sort(
      (a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime(),
    )

    const index = sortedValidParcels.findIndex((p) => p === closestParcel)

    if (index !== -1) {
      sortedValidParcels.splice(index, 1)
    }

    return [closestParcel, ...sortedValidParcels]
  }

  const handleCalculo = () => {
    const isDateValid = parcelasValidasSelecionadas.every(
      (parcela: Parcela) => new Date(selectedDate) <= new Date(parcela.dueDate),
    )

    if (!isDateValid) {
      alert(
        'A data de pagamento deve ser anterior ao vencimento de todas as parcelas selecionadas.',
      )

      return
    }

    setCalculo(true)
  }

  const excludedPaymentTerms = [
    'F',
    'FB',
    'FG',
    'FI',
    'SU',
    'Su',
    'PU',
    'PE',
    'MB',
  ]

  const excludedFullPaymentTerms = [
    'Financiamento CEF',
    'Financiamento Outros Bancos',
    'FGTS Financiável',
    'Subsídio Financiável',
    'Parcela Única',
    'Permuta',
    'Morar Bem - PE',
  ]

  const updateParcelas = sortByDueDateDesc(incomeByBills.data)
    .filter((parcela) => {
      const paymentTermId = parcela.paymentTerm.id.toUpperCase()

      return !excludedPaymentTerms
        .map((term) => term.toUpperCase())
        .includes(paymentTermId)
    })
    .filter((parcela) => parcela.correctedBalanceAmount !== 0)
    .filter((parcela) => new Date(parcela.dueDate) > new Date())

  const tiposDeParcela = Array.from(
    new Set(
      incomeByBills.data
        .filter((parcela) => parcela.correctedBalanceAmount !== 0)
        .map((parcela) => parcela.paymentTerm?.id?.trim())
        .filter((id): id is string => !!id),
    ),
  )

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-6 text-xs">
      {calculo ? (
        <VisualizaoCalculo
          contrato={contrato}
          cliente={cliente}
          dataAPagar={selectedDate}
          currentDebit={currentDebitBalance}
          originalIncomeByBills={incomeByBills}
          incomeByBills={{
            data: parcelasValidasSelecionadas.sort(
              (a, b) =>
                Number(new Date(b.dueDate)) - Number(new Date(a.dueDate)),
            ),
          }}
        />
      ) : incomeByBills.data.length ? (
        <>
          <ClienteInfo cliente={cliente} contrato={contrato} />
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-base">Parcelas Vencidas</CardTitle>
              <CardDescription className="text-xs">
                Parcelas com a data de vencimento anterior à data de hoje.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentDebitBalance.data[0].dueInstallments &&
              currentDebitBalance.data[0].dueInstallments.filter((parcela) => {
                const paymentTermId = parcela.conditionType
                  .trim()
                  .replaceAll(' ', '')
                  .toUpperCase()

                return !excludedFullPaymentTerms
                  .map((term) => term.trim().replaceAll(' ', '').toUpperCase())
                  .includes(paymentTermId)
              }).length > 0 ? (
                <span className="font-bold text-red-500 text-lg uppercase">
                  {`Este cliente possui ${currentDebitBalance.data[0].dueInstallments.length} parcelas em aberto.
                  Todas as parcelas vencidas serão incluídas no cálculo do AVP, com juros aplicados.`}
                </span>
              ) : (
                <span className="font-bold text-green-500 text-lg uppercase">
                  Este cliente não possui parcelas vencidas.
                </span>
              )}
            </CardContent>
          </Card>
          <Card className="w-full">
            <CardHeader className="flex justify-between">
              <div>
                <CardTitle className="text-base">Parcelas Válidas</CardTitle>
                <CardDescription className="text-xs">
                  Parcelas com a data de vencimento posterior à data de hoje.
                </CardDescription>
              </div>
              {updateParcelas.length > 0 && (
                <div className="flex flex-row-reverse gap-3">
                  <button
                    onClick={handleSelectTodasParcelas}
                    className="w-fit bg-azul-claro-vca font-semibold text-white rounded py-1 px-3 self-end"
                  >
                    {parcelasValidasSelecionadas.length ===
                    incomeByBills.data.filter(
                      (parcela) => parcela.correctedBalanceAmount !== 0,
                    ).length
                      ? 'Desmarcar todas'
                      : 'Selecionar todas'}
                  </button>
                  <div className="self-end flex items-center justify-center gap-2">
                    <select
                      defaultValue=""
                      onChange={(e) => handleParcelasPorTipo(e.target.value)}
                      className="w-fit bg-azul-claro-vca font-semibold text-white rounded py-[3px] px-3 self-end"
                    >
                      <option value="">Selecionar parcelas pelo tipo</option>
                      {tiposDeParcela.map((item, index) => (
                        <option key={index} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {updateParcelas.length > 0 ? (
                <Table className="shadow-md p-2 rounded bg-white">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">
                        DATA VENCIMENTO
                      </TableHead>
                      <TableHead className="w-[200px]">VALOR</TableHead>
                      <TableHead className="w-[200px]">ID CONDIÇÃO</TableHead>
                      <TableHead className="w-[200px]">
                        NOME INDEXADOR{' '}
                      </TableHead>
                      <TableHead className="w-[150px] text-center">
                        SELECIONAR
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {updateParcelas.map((parcela, index) => (
                      <TableRow
                        key={index}
                        className={classNames(
                          index % 2 === 0 && 'bg-neutral-100',
                          index === 0 && 'bg-green-100',
                        )}
                      >
                        <TableCell className="font-medium">
                          {formatarData(parcela.dueDate)}
                        </TableCell>
                        <TableCell>
                          R$ {formatarValor(parcela.correctedBalanceAmount)}
                        </TableCell>
                        <TableCell>{parcela.paymentTerm.id}</TableCell>
                        <TableCell>{parcela.indexerName}</TableCell>
                        <TableCell className="border text-center">
                          <input
                            type="checkbox"
                            checked={isParcelaSelecionada(parcela)}
                            onChange={() => handleSelectParcela(parcela, index)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="size-full flex">
                  <span className="text-neutral-700">
                    Este cliente não possui parcelas à vencer.
                  </span>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <div className="w-full flex justify-between items-start">
                <div className="rounded flex items-center justify-center w-full text-xs gap-2">
                  <span className="text-azul-vca">
                    Quantidade de títulos:{' '}
                    <span className="font-bold">{updateParcelas.length}</span>
                  </span>
                </div>
              </div>
            </CardFooter>
          </Card>
          <div className="bg-white shadow-md rounded w-full p-2 flex justify-between items-start">
            <div className="rounded p-2 flex flex-col gap-2">
              <span className="text-azul-vca">
                Títulos Selecionados:{' '}
                <span className="font-bold">
                  {parcelasValidasSelecionadas.length}
                </span>
              </span>
              <span className="text-azul-vca">
                Total das Parcelas:{' '}
                <span className="font-bold">{`R$ ${formatarValor(Number(calcularTotalParcelasSelecionadas().toFixed(2)))}`}</span>
              </span>
            </div>
            <div className="rounded p-2 flex flex-col items-center gap-2">
              <span className="text-azul-vca">
                Data a Pagar:{' '}
                <input
                  id="date"
                  type="date"
                  className="font-bold"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  max={
                    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                      .toISOString()
                      .split('T')[0]
                  }
                  onChange={(e) => {
                    setSelectedDate(e.target.value)
                  }}
                />
              </span>
              <button
                onClick={handleCalculo}
                disabled={!selectedDate}
                className="w-fit bg-azul-claro-vca text-white rounded font-bold py-1 px-3 self-end disabled:bg-gray-300"
              >
                Calcular
              </button>
            </div>
          </div>
        </>
      ) : (
        <Loader2Icon className="animate-spin duration-1000 text-neutral-500" />
      )}
    </div>
  )
}
