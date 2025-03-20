'use client'

import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Contrato } from '@/app/dashboard/(solucoes)/calculadora-juros/_components/contratos-tabela'

const formSchema = z.object({
  buscaCliente: z
    .string()
    .min(11, 'Informe um CPF/CNPJ válido.')
    .max(18, 'Informe um CPF/CNPJ válido.'),
})

type FormType = z.infer<typeof formSchema>

export type Cliente = {
  name: string
  documentType: 'cpf' | 'cnpj'
  documentNumber: string
}

// type CustomerCpfApiResponse = {
//   vca: {
//     resultSetMetadata: {
//       count: number
//       offset: number
//       limit: number
//     }
//     results: Cliente[]
//     origem: 'vca' | 'vcalotear'
//   }
//   vcalotear: {
//     resultSetMetadata: {
//       count: number
//       offset: number
//       limit: number
//     }
//     results: Cliente[]
//     origem: 'vca' | 'vcalotear'
//   }
// }

type ContractItem = {
  number: string
  enterpriseName: string
  salesContractUnits: {
    name: string
  }[]
  origem: string
  customerId: string
}

type SearchFormProps = {
  onSearchComplete: (data: { cliente: Cliente; contratos: Contrato[] }) => void
  children?: React.ReactNode
}

export function SearchForm({ onSearchComplete, children }: SearchFormProps) {
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

        const cliente = parsed.vca.results[0]

        const idVca =
          parsed.vca.results.length > 0 ? parsed.vca.results[0].id : 0
        const idLotear =
          parsed.vcalotear.results.length > 0
            ? parsed.vcalotear.results[0].id
            : 0

        const contratos = await fetch(
          `/api/avp/sales-contracts?idVca=${idVca}&idLotear=${idLotear}`,
        )

        const contratosParsed = await contratos.json()

        const clienteInfo: Cliente = {
          name: cliente.name,
          documentNumber: cliente[documentType],
          documentType,
        }

        const filteredContratos = contratosParsed.contratos.map(
          (item: ContractItem) => ({
            contractNumber: item.number,
            enterpriseName: item.enterpriseName,
            unit: item.salesContractUnits[0].name,
            customerId: parsed[item.origem].results[0].id,
            origem: item.origem,
          }),
        )

        console.log(filteredContratos)

        onSearchComplete({
          cliente: clienteInfo,
          contratos: filteredContratos,
        })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  }

  return (
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
        {children}
      </div>
    </form>
  )
}
