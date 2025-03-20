'use client'

import { useState } from 'react'
import { SearchForm, Cliente } from '../../../../../components/search-form'
import { CombinedData, ContractsModal } from '@/components/contracts-modal'
import {
  handleFetchCurrentDebitBalance,
  handleFetchReceivableBills,
} from '@/util'
import { CurrentDebitBalanceApiResponse } from '@/app/api/avp/current-debit-balance/route'
import { VisualizaoCalculo } from './visualizacao-calculo'
import {
  IncomeByBillsApiResponse,
  Parcela,
} from '@/app/api/avp/income-by-bills/route'
import { Contrato } from '../../calculadora-juros/_components/contratos-tabela'

export function FormContainer() {
  const [showTable, setShowTable] = useState(false)
  const [contratoInfo, setContratoInfo] = useState<Contrato>({
    contractNumber: '',
    enterpriseName: '',
    unit: '',
    origem: '',
    customerId: '',
  })
  const [clienteInfo, setClienteInfo] = useState<Cliente>({
    name: '',
    documentType: 'cpf',
    documentNumber: '',
  })
  const [contratosFull, setContratosFull] = useState<Contrato[]>([])
  const [combinedData, setCombinedData] = useState<
    CombinedData<IncomeByBillsApiResponse, CurrentDebitBalanceApiResponse>
  >({
    incomeByBills: { data: [] },
    currentDebit: { data: [] },
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

  const checkValidParcelas = (array: Parcela[]) => {
    if (array.length <= 1) return array

    const validParcels = array.filter(
      (parcela) =>
        parcela.correctedBalanceAmount !== 0 &&
        new Date(parcela.dueDate) > new Date(),
    )

    if (validParcels.length === 0) {
      return []
    }

    return validParcels
  }

  const updateParcelas = checkValidParcelas(
    combinedData.incomeByBills.data,
  ).filter((parcela) => parcela.correctedBalanceAmount !== 0)

  const calcularTotalParcelasVencidas = () => {
    let total = 0

    if (combinedData.currentDebit.data[0].dueInstallments) {
      total += combinedData.currentDebit.data[0].dueInstallments.reduce(
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

  const calcularTotalParcelasFuturas = () => {
    return updateParcelas.reduce((total, parcela) => {
      const valorNumerico = parseFloat(
        parcela.correctedBalanceAmount.toString().replace(',', '.').trim(),
      )
      return total + (isNaN(valorNumerico) ? 0 : valorNumerico)
    }, 0)
  }

  return (
    <div className="w-full h-full">
      {!showTable ? (
        <SearchForm onSearchComplete={handleSearchComplete}>
          <ContractsModal<
            IncomeByBillsApiResponse,
            CurrentDebitBalanceApiResponse
          >
            action={setShowTable}
            contratos={contratosFull}
            document={{
              documentType: clienteInfo.documentType,
              documentNumber: clienteInfo.documentNumber,
              customerId: contratoInfo.customerId,
            }}
            setContratosInfo={setContratoInfo}
            combinedHandlers={{
              incomeByBills: handleFetchReceivableBills,
              currentDebit: handleFetchCurrentDebitBalance,
            }}
            setCombinedData={setCombinedData}
          />
        </SearchForm>
      ) : (
        <VisualizaoCalculo
          valorVencidas={Number(calcularTotalParcelasVencidas().toFixed(2))}
          valorFuturas={Number(calcularTotalParcelasFuturas().toFixed(2))}
          contrato={contratoInfo}
          cliente={clienteInfo}
          currentDebit={combinedData.currentDebit}
          incomeByBills={{ data: updateParcelas }}
        />
      )}
    </div>
  )
}
