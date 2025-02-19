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
import { Cliente } from './form'
import { Contrato } from './contratos-tabela'
import { Loader2Icon } from 'lucide-react'
import { VisualizaoCalculo } from './visualizacao-calculo'
import { formatarCpfCnpj, formatarData, formatarValor } from '@/util'
import {
  IncomeByBillsApiResponse,
  Parcela,
} from '@/app/api/avp/income-by-bills/route'

type ParcelasTabelaProps = {
  cliente: Cliente
  parcelas: IncomeByBillsApiResponse
  contrato: Contrato
}

export type ParcelaSelecionada = Parcela & {
  index: number
}

export function ParcelasTabela({
  cliente,
  parcelas,
  contrato,
}: ParcelasTabelaProps) {
  const [parcelasSelecionadas, setParcelasSelecionadas] = useState<
    ParcelaSelecionada[]
  >([])
  const [calculo, setCalculo] = useState<boolean>(false)
  const [selectedDate, setSelectedDate] = useState('')

  const handleSelectTodasParcelas = () => {
    if (
      parcelasSelecionadas.length ===
      parcelas.data.filter((parcela) => parcela.correctedBalanceAmount !== 0)
        .length
    ) {
      setParcelasSelecionadas([])

      return
    }

    setParcelasSelecionadas(
      parcelas.data
        .filter((parcela) => parcela.correctedBalanceAmount !== 0)
        .map((item, index) => {
          return {
            ...item,
            index,
          }
        }),
    )
  }

  const handleParcelasPorTipo = (tipo: string) => {
    setParcelasSelecionadas(
      parcelas.data
        .filter((parcela) => parcela.correctedBalanceAmount !== 0)
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
    setParcelasSelecionadas((prev) => {
      const parcelaJaSelecionada = prev.some(
        (p) => p.installmentId === parcela.installmentId,
      )

      if (parcelaJaSelecionada) {
        // Desmarcar a parcela se ela já está selecionada
        return prev.filter((p) => p.installmentId !== parcela.installmentId)
      } else {
        return [...prev, { ...parcela, index }]
      }
    })
  }

  const isParcelaSelecionada = (parcela: Parcela) =>
    parcelasSelecionadas.some((p) => p.installmentId === parcela.installmentId)

  const calcularTotalParcelasSelecionadas = () => {
    return parcelasSelecionadas.reduce((total, parcela) => {
      const valorNumerico = parseFloat(
        parcela.correctedBalanceAmount.toString().replace(',', '.').trim(),
      )
      return total + (isNaN(valorNumerico) ? 0 : valorNumerico)
    }, 0)
  }

  const sortByDueDateDesc = (array: Parcela[]) => {
    if (array.length <= 1) return array // Retorna o array se houver 0 ou 1 item.

    // Filtrar as parcelas com balanceDue diferente de 0
    const validParcels = array.filter(
      (parcela) => parcela.correctedBalanceAmount !== 0,
    )

    if (validParcels.length === 0) {
      throw new Error(
        'Nenhuma parcela válida com balanceDue diferente de 0 encontrada.',
      )
    }

    // Encontrar a parcela mais próxima com balanceDue diferente de 0
    const closestParcel = validParcels.reduce((prev, curr) =>
      new Date(prev.dueDate) < new Date(curr.dueDate) ? prev : curr,
    )

    // Separar a parcela mais próxima do restante
    const remainingParcels = array.filter(
      (parcela) => parcela !== closestParcel,
    )

    // Ordenar o restante em ordem decrescente
    const sortedRemaining = remainingParcels.sort(
      (a, b) => Number(new Date(b.dueDate)) - Number(new Date(a.dueDate)),
    )

    // Retornar o array com a parcela mais próxima na primeira posição
    return [closestParcel, ...sortedRemaining]
  }

  const handleCalculo = () => {
    const isDateValid = parcelasSelecionadas.every(
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

  const verificarParcelaEmAberto = () => {
    const hoje = new Date() // Data atual
    return parcelas.data
      .filter((parcela) => parcela.correctedBalanceAmount !== 0)
      .some((parcela) => new Date(parcela.dueDate) < hoje)
  }

  const parcelaVencida = verificarParcelaEmAberto()

  const updateParcelas = sortByDueDateDesc(parcelas.data).filter(
    (parcela) => parcela.correctedBalanceAmount !== 0,
  )

  const tiposDeParcela = Array.from(
    new Set(
      parcelas.data
        .filter((parcela) => parcela.correctedBalanceAmount !== 0)
        .map((parcela) => parcela.paymentTerm?.id?.trim())
        .filter((id): id is string => !!id),
    ),
  )

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-6 text-xs">
      {calculo ? (
        <VisualizaoCalculo
          parcelasSelecionadas={parcelasSelecionadas}
          parcelas={parcelas}
          cliente={cliente}
          contrato={contrato}
          valor={Number(calcularTotalParcelasSelecionadas().toFixed(2))}
          dataAPagar={selectedDate}
        />
      ) : parcelas.data.length ? (
        <>
          <div className="bg-neutral-50 shadow-md rounded w-full p-2 flex justify-between items-start">
            <div className="rounded p-2 flex flex-col gap-2">
              <span className="text-azul-vca">
                Nome do Cliente:{' '}
                <span className="font-bold">{cliente.name}</span>
              </span>
              <span className="text-azul-vca">
                CPF/CNPJ:{' '}
                <span className="font-bold">
                  {formatarCpfCnpj(cliente.documentNumber)}
                </span>
              </span>
              <span className="text-azul-vca">
                Empreendimento:{' '}
                <span className="font-bold">{contrato.enterpriseName}</span>
              </span>
            </div>
            <div className="rounded p-2 flex flex-col gap-2">
              <span className="text-azul-vca">
                Contrato:{' '}
                <span className="font-bold">{contrato.contractNumber}</span>
              </span>
              <span className="text-azul-vca">
                Unidade: <span className="font-bold">{contrato.unit}</span>
              </span>
              {/* <span className="text-azul-vca">
                Contrato ID:{' '}
                <span className="font-bold">FALTA IMPLEMENTAR</span>
              </span> */}
            </div>
          </div>
          <div className="flex flex-row-reverse items-center justify-center self-end gap-3">
            <button
              onClick={handleSelectTodasParcelas}
              className="w-fit bg-azul-claro-vca font-semibold text-white rounded py-1 px-3 self-end"
            >
              {parcelasSelecionadas.length ===
              parcelas.data.filter(
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
          {parcelaVencida && (
            <div className="font-bold text-base text-red-500">
              ESTE CLIENTE POSSUI PARCELAS EM ABERTO.
            </div>
          )}
          <Table className="shadow-md p-2 rounded bg-white">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">DATA VENCIMENTO</TableHead>
                <TableHead className="w-[200px]">VALOR</TableHead>
                <TableHead className="w-[200px]">ID CONDIÇÃO</TableHead>
                <TableHead className="w-[200px]">NOME INDEXADOR </TableHead>
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
          <div className="w-full flex justify-between items-start">
            <div className="rounded flex items-center justify-center w-full text-xs gap-2">
              <span className="text-azul-vca">
                Quantidade total de títulos:{' '}
                <span className="font-bold">
                  {
                    parcelas.data.filter(
                      (parcela) => parcela.correctedBalanceAmount !== 0,
                    ).length
                  }
                </span>
              </span>
            </div>
          </div>
          <div className="bg-white shadow-md rounded w-full p-2 flex justify-between items-start">
            <div className="rounded p-2 flex flex-col gap-2">
              <span className="text-azul-vca">
                Títulos Selecionados:{' '}
                <span className="font-bold">{parcelasSelecionadas.length}</span>
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
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </span>
              <button
                onClick={handleCalculo}
                disabled={parcelaVencida || !selectedDate}
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
