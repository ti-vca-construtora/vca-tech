'use client'

import { useState } from 'react'
import {
  SearchForm,
  Contrato,
  Cliente,
} from '../../../../../components/search-form'
import { ContractsModal } from '../../../../../components/contracts-modal'
import { ParcelasTabela } from './parcelas-tabela'
import { IncomeByBillsApiResponse } from '@/app/api/avp/income-by-bills/route'
import { handleFetchReceivableBills } from '@/util'

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
  const [parcelas, setParcelas] = useState<IncomeByBillsApiResponse>({
    data: [],
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

  return (
    <div className="w-full h-full">
      {!showTable ? (
        <SearchForm onSearchComplete={handleSearchComplete}>
          <ContractsModal
            setContratosInfo={setContratoInfo}
            setData={setParcelas}
            document={{
              documentNumber: clienteInfo.documentNumber,
              documentType: clienteInfo.documentType,
              customerId: clienteInfo.id,
            }}
            contratos={contratosFull}
            action={setShowTable}
            fetchHandler={handleFetchReceivableBills}
          />
        </SearchForm>
      ) : (
        <ParcelasTabela
          contrato={contratoInfo}
          parcelas={parcelas}
          cliente={clienteInfo}
        />
      )}
    </div>
  )
}
