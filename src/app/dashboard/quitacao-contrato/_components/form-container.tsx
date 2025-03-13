'use client'

import { useState } from 'react'
import {
  SearchForm,
  Contrato,
  Cliente,
} from '../../../../components/search-form'
import { ContractsModal } from '@/components/contracts-modal'
import { handleFetchCurrentDebitBalance } from '@/util'
import { CurrentDebitBalanceApiResponse } from '@/app/api/avp/current-debit-balance/route'
import { VisualizaoCalculo } from './visualizacao-calculo'

export function FormContainer() {
  const [showTable, setShowTable] = useState(false)
  const [contratoInfo, setContratoInfo] = useState<Contrato>({
    contractNumber: '',
    enterpriseName: '',
    unit: '',
    origem: '',
  })
  const [clienteInfo, setClienteInfo] = useState<Cliente>({
    id: '',
    name: '',
    documentType: 'cpf',
    documentNumber: '',
  })
  const [contratosFull, setContratosFull] = useState<Contrato[]>([])
  const [currentDebit, setCurrentDebit] =
    useState<CurrentDebitBalanceApiResponse>({
      resultSetMetadata: {
        count: 0,
        limit: 0,
        offset: 0,
      },
      results: [],
    })

  const handleSearchComplete = (data: {
    cliente: Cliente
    contratos: Contrato[]
  }) => {
    setClienteInfo(data.cliente)
    setContratosFull(data.contratos)

    const modalTrigger = document.getElementById('modal-trigger')
    if (modalTrigger) {
      modalTrigger.click()
    }
  }

  // const sortByDueDateDesc = (array: Parcela[]) => {
  //   if (array.length <= 1) return array

  //   const validParcels = array.filter(
  //     (parcela) => parcela.correctedBalanceAmount !== 0,
  //   )

  //   if (validParcels.length === 0) {
  //     throw new Error(
  //       'Nenhuma parcela válida com balanceDue diferente de 0 encontrada.',
  //     )
  //   }

  //   const sortedParcelas = array.sort(
  //     (a, b) => Number(new Date(b.dueDate)) - Number(new Date(a.dueDate)),
  //   )

  //   return sortedParcelas
  // }

  const calcularTotalParcelas = () => {
    let total = 0

    if (currentDebit.results[0].dueInstallments) {
      total += currentDebit.results[0].dueInstallments.reduce(
        (total, parcela) => {
          const valorNumerico = parseFloat(
            parcela.originalValue.toString().replace(',', '.').trim(),
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
            parcela.originalValue.toString().replace(',', '.').trim(),
          )

          return total + (isNaN(valorNumerico) ? 0 : valorNumerico)
        },
        0,
      )
    }

    return total
  }

  // const updateParcelas = sortByDueDateDesc(parcelas).filter(
  //   (parcela) => parcela.correctedBalanceAmount !== 0,
  // )

  return (
    <div className="w-full h-full">
      {!showTable ? (
        <SearchForm onSearchComplete={handleSearchComplete}>
          <ContractsModal<CurrentDebitBalanceApiResponse>
            setContratosInfo={setContratoInfo}
            setData={setCurrentDebit}
            document={{
              documentNumber: clienteInfo.documentNumber,
              documentType: clienteInfo.documentType,
              customerId: clienteInfo.id,
            }}
            contratos={contratosFull}
            action={setShowTable}
            fetchHandler={handleFetchCurrentDebitBalance}
          />
        </SearchForm>
      ) : (
        <VisualizaoCalculo
          valor={Number(calcularTotalParcelas().toFixed(2))}
          contrato={contratoInfo}
          cliente={clienteInfo}
          currentDebit={currentDebit}
        />
      )}
    </div>
  )
}
