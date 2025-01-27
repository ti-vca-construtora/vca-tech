'use client'

import { useState } from 'react'
import { Modal } from './modal'
import { ParcelasTabela } from './parcelas-tabela'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Contrato } from './contratos-tabela'
import { IncomeByBillsApiResponse } from '@/app/api/avp/income-by-bills/route'

const formSchema = z.object({
  buscaCliente: z
    .string()
    .min(11, 'Informe um CPF/CNPJ válido.')
    .max(18, 'Informe um CPF/CNPJ válido.'),
})

type FormType = z.infer<typeof formSchema>

export type Cliente = {
  id: string
  name: string
  documentType: 'cpf' | 'cnpj'
  documentNumber: string
}

type ContractItem = {
  number: string
  enterpriseName: string
  salesContractUnits: {
    name: string
  }[]
}

export function Form() {
  const [showTable, setShowTable] = useState(false)
  const [contratoInfo, setContratoInfo] = useState<Contrato>({
    contractNumber: '',
    enterpriseName: '',
    unit: '',
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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormType>({
    resolver: zodResolver(formSchema),
  })

  const handleFetchContracts = async (formData: FormType) => {
    try {
      const documentType =
        formData.buscaCliente.replace(/\D/g, '').length === 11 ? 'cpf' : 'cnpj'

      const data = await fetch(
        `/api/avp/customer-cpf?documento=${formData.buscaCliente.replace(/\D/g, '')}`,
      )

      if (data) {
        const parsed = await data.json()

        const cliente = parsed.results[0]

        const contratos = await fetch(
          `/api/avp/sales-contracts?id=${cliente.id}`,
        )
        const contratosParsed = await contratos.json()

        if (cliente.name && cliente.id) {
          setClienteInfo({
            id: cliente.id,
            name: cliente.name,
            documentNumber: cliente[documentType],
            documentType,
          })
        }

        const filteredContratos = contratosParsed.results.map(
          (item: ContractItem) => {
            return {
              contractNumber: item.number,
              enterpriseName: item.enterpriseName,
              documentId: item.enterpriseName,
              unit: item.salesContractUnits[0].name,
            }
          },
        )

        setContratosFull([...filteredContratos])

        if (typeof window !== 'undefined') {
          const modalTrigger = document.getElementById('modal-trigger')
          if (modalTrigger) {
            modalTrigger.click()
          }
        }
      }
    } catch (error: unknown) {
      console.log(error)
    }
  }

  return (
    <div className="w-full h-full">
      {!showTable ? (
        <form
          onSubmit={handleSubmit(handleFetchContracts)}
          className="shadow-md bg-neutral-50 p-4 rounded flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1 w-full">
            <label className="text-azul-vca font-semibold" htmlFor="">
              Informe o CPF/CNPJ:
            </label>
            <input
              {...register('buscaCliente')}
              placeholder="CPF/CNPJ"
              className="border h-12 p-2 w-80 rounded shadow-md"
              type="text"
            />
            {errors.buscaCliente?.message && (
              <span className="text-xs text-red-500">
                {errors.buscaCliente?.message}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button
              className="bg-azul-claro-vca font-semibold text-sm rounded text-white w-fit p-2"
              type="submit"
            >
              Buscar Contratos
            </button>
            <Modal
              setContratosInfo={setContratoInfo}
              setParcelas={setParcelas}
              document={{
                documentNumber: clienteInfo.documentNumber,
                documentType: clienteInfo.documentType,
                customerId: clienteInfo.id,
              }}
              contratos={contratosFull}
              action={setShowTable}
            />
          </div>
        </form>
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
