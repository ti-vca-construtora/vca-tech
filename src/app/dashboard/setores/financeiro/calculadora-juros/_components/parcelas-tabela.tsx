'use client'

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useState } from 'react'

type Parcela = {
  id: string
  valor: string
  dataVencimento: string
  descricao: string
}

const parcelasMock: Parcela[] = [
  {
    id: '1',
    valor: 'R$ 15.000,00',
    dataVencimento: '15/11/2024',
    descricao: '...',
  },
  {
    id: '2',
    valor: 'R$ 12.000,00',
    dataVencimento: '15/12/2024',
    descricao: '...',
  },
  {
    id: '3',
    valor: 'R$ 10.000,00',
    dataVencimento: '15/01/2025',
    descricao: '...',
  },
  {
    id: '4',
    valor: 'R$ 8.000,00',
    dataVencimento: '15/02/2025',
    descricao: '...',
  },
  {
    id: '5',
    valor: 'R$ 5.000,00',
    dataVencimento: '15/03/2025',
    descricao: '...',
  },
]

export function ParcelasTabela() {
  const [parcelasSelecionadas, setParcelasSelecionadas] = useState<Parcela[]>(
    [],
  )

  const handleSelectParcela = (parcela: Parcela) => {
    setParcelasSelecionadas((prev) => {
      const parcelaJaSelecionada = prev.some((p) => p.id === parcela.id)

      if (parcelaJaSelecionada) {
        return prev.filter((p) => p.id !== parcela.id)
      } else {
        return [...prev, parcela]
      }
    })

    console.log(parcelasSelecionadas)
  }

  const isParcelaSelecionada = (parcela: Parcela) =>
    parcelasSelecionadas.some((p) => p.id === parcela.id)

  const calcularTotalParcelasSelecionadas = () => {
    return parcelasSelecionadas.reduce((total, parcela) => {
      const valorNumerico = parseFloat(
        parcela.valor
          .replace('R$', '')
          .replace('.', '')
          .replace(',', '.')
          .trim(),
      )
      return total + valorNumerico
    }, 0)
  }

  return (
    <div className="w-full h-full flex flex-col gap-6">
      <div className="border rounded w-full p-4 flex justify-between items-start">
        <div className="rounded p-4">
          <span className="text-neutral-600">
            Nome do Cliente: <span className="font-bold">Fulano de Tal</span>
          </span>
        </div>
        <div className="rounded p-4 flex flex-col gap-2">
          <span className="text-neutral-600">
            Contrato: <span className="font-bold">CV123456789</span>
          </span>
          <span className="text-neutral-600">
            Unidade: <span className="font-bold">BLOCO A - APTO 02</span>
          </span>
        </div>
      </div>
      <Table className="border p-4 rounded">
        <TableCaption>
          Lista de parcelas atraladas ao contrato: 012938120983.
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">DATA VENCIMENTO</TableHead>
            <TableHead className="w-[200px]">VALOR</TableHead>
            <TableHead className="flex-grow">...</TableHead>
            <TableHead className="border w-[150px] text-center">
              SELECIONAR
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parcelasMock.map((parcela, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">
                {parcela.dataVencimento}
              </TableCell>
              <TableCell>{parcela.valor}</TableCell>
              <TableCell>{parcela.descricao}</TableCell>
              <TableCell className="border text-center">
                <input
                  type="checkbox"
                  checked={isParcelaSelecionada(parcela)}
                  onChange={() => handleSelectParcela(parcela)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="border rounded w-full p-4 flex justify-between items-start">
        <div className="rounded p-4 flex flex-col gap-2">
          <span className="text-neutral-600">
            Títulos Selecionados:{' '}
            <span className="font-bold">{parcelasSelecionadas.length}</span>
          </span>
          <span className="text-neutral-600">
            Total das Parcelas:{' '}
            <span className="font-bold">{`R$ ${calcularTotalParcelasSelecionadas().toFixed(2)}`}</span>
          </span>
        </div>
        {/* <div className="rounded p-4 flex flex-col gap-2">
          <span className="text-neutral-600">
            Contrato: <span className="font-bold">CV123456789</span>
          </span>
          <span className="text-neutral-600">
            Unidade: <span className="font-bold">BLOCO A - APTO 02</span>
          </span>
        </div> */}
      </div>
    </div>
  )
}
