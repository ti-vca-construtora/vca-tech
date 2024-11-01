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
import { Cliente, Parcela, ParcelasFull } from './form'
import { Contrato } from './contratos-tabela'
import { Loader2Icon } from 'lucide-react'
import { VisualizaoCalculo } from './visualizacao-calculo'
import { formatarData, formatarValor } from '@/app/util'

type ParcelasTabelaProps = {
  cliente: Cliente
  parcelas: ParcelasFull
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

  const handleSelectParcela = (parcela: Parcela, index: number) => {
    setParcelasSelecionadas((prev) => {
      const parcelaJaSelecionada = prev.some(
        (p) => p.installmentId === parcela.installmentId,
      )

      if (parcelaJaSelecionada) {
        // Desmarcar a parcela se ela já está selecionada
        return prev.filter((p) => p.installmentId !== parcela.installmentId)
      } else {
        // Verificar se o índice da última parcela selecionada é `index - 1`
        const ultimoIndexSelecionado =
          prev.length > 0 ? prev[prev.length - 1].index : -1
        if (ultimoIndexSelecionado !== index - 1) {
          alert('Você precisa selecionar as parcelas na ordem inversa!')
          return prev
        }

        // Adiciona a parcela ao estado, pois a seleção está válida
        return [...prev, { ...parcela, index }]
      }
    })
  }

  const isParcelaSelecionada = (parcela: Parcela) =>
    parcelasSelecionadas.some((p) => p.installmentId === parcela.installmentId)

  const calcularTotalParcelasSelecionadas = () => {
    return parcelasSelecionadas.reduce((total, parcela) => {
      const valorNumerico = parseFloat(
        parcela.balanceDue.toString().replace(',', '.').trim(),
      )
      return total + (isNaN(valorNumerico) ? 0 : valorNumerico)
    }, 0)
  }

  const sortByDueDateDesc = (array: Parcela[]) => {
    return array.sort(
      (a, b) => Number(new Date(b.dueDate)) - Number(new Date(a.dueDate)),
    )
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-6 text-xs">
      {calculo ? (
        <VisualizaoCalculo
          parcelasSelecionadas={parcelasSelecionadas}
          cliente={cliente}
          contrato={contrato}
          valor={Number(calcularTotalParcelasSelecionadas().toFixed(2))}
          dataAPagar="2024-11-01"
        />
      ) : parcelas.results.length ? (
        <>
          <div className="border rounded w-full p-2 flex justify-between items-start">
            <div className="rounded p-2 flex flex-col gap-2">
              <span className="text-neutral-600">
                Nome do Cliente:{' '}
                <span className="font-bold">{cliente.name}</span>
              </span>
              <span className="text-neutral-600">
                CPF/CNPJ:{' '}
                <span className="font-bold">{cliente.documentNumber}</span>
              </span>
              <span className="text-neutral-600">
                Empreendimento:{' '}
                <span className="font-bold">{contrato.enterpriseName}</span>
              </span>
            </div>
            <div className="rounded p-2 flex flex-col gap-2">
              <span className="text-neutral-600">
                Contrato:{' '}
                <span className="font-bold">{contrato.contractNumber}</span>
              </span>
              <span className="text-neutral-600">
                Unidade: <span className="font-bold">{contrato.unit}</span>
              </span>
              <span className="text-neutral-600">
                Contrato ID:{' '}
                <span className="font-bold">FALTA IMPLEMENTAR</span>
              </span>
            </div>
          </div>
          <Table className="border p-2 rounded">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">DATA VENCIMENTO</TableHead>
                <TableHead className="w-[200px]">VALOR</TableHead>
                <TableHead className="flex-grow">ID CONDIÇÃO</TableHead>
                <TableHead className="w-[150px] text-center">
                  SELECIONAR
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortByDueDateDesc(parcelas.results)
                .filter((parcela) => parcela.balanceDue !== 0)
                .map((parcela, index) => (
                  <TableRow
                    key={index}
                    className={classNames(index % 2 === 0 && 'bg-neutral-100')}
                  >
                    <TableCell className="font-medium">
                      {formatarData(parcela.dueDate)}
                    </TableCell>
                    <TableCell>
                      R$ {formatarValor(parcela.balanceDue)}
                    </TableCell>
                    <TableCell>{parcela.conditionTypeId}</TableCell>
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
              <span className="text-neutral-600">
                Quantidade total de títulos:{' '}
                <span className="font-bold">
                  {parcelas.resultSetMetadata.count}
                </span>
              </span>
              <span className="text-neutral-600">
                Quantidade exibida de títulos:{' '}
                <span className="font-bold">
                  {parcelas.resultSetMetadata.limit}
                </span>
              </span>
              <span className="text-neutral-600">
                Offset:{' '}
                <span className="font-bold">
                  {parcelas.resultSetMetadata.offset}
                </span>
              </span>
            </div>
          </div>
          <div className="border rounded w-full p-2 flex justify-between items-start">
            <div className="rounded p-2 flex flex-col gap-2">
              <span className="text-neutral-600">
                Títulos Selecionados:{' '}
                <span className="font-bold">{parcelasSelecionadas.length}</span>
              </span>
              <span className="text-neutral-600">
                Total das Parcelas:{' '}
                <span className="font-bold">{`R$ ${formatarValor(Number(calcularTotalParcelasSelecionadas().toFixed(2)))}`}</span>
              </span>
            </div>
            <div className="rounded p-2 flex flex-col items-center gap-2">
              <span className="text-neutral-600">
                Data a Pagar:{' '}
                <span className="font-bold bg-neutral-100 p-2">15/04/2025</span>
              </span>
              <button
                onClick={() => setCalculo(true)}
                className="w-fit bg-neutral-800 text-white rounded font-bold py-1 px-3 self-end"
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
