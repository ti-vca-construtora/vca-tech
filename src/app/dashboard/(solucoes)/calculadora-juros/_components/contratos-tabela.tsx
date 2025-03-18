import { CombinedData } from '@/components/contracts-modal'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Dispatch, SetStateAction } from 'react'

export type FetchHandler<T> = (
  customerId: string,
  contractNumber: string,
  origem: string,
  document?: string,
  documentType?: 'cpf' | 'cnpj',
) => Promise<T>

export type Contrato = {
  unit: string
  contractNumber: string
  enterpriseName: string
  origem: string
}

type ContratosTabelaProps<T, U = never> = {
  action: Dispatch<SetStateAction<boolean>>
  setContratosInfo: Dispatch<SetStateAction<Contrato>>
  contratos: Contrato[]
  customerId: string
  fetchHandler?: FetchHandler<T>
  setData?: Dispatch<SetStateAction<T>>
  combinedHandlers?: {
    incomeByBills: FetchHandler<T>
    currentDebit: FetchHandler<U>
  }
  setCombinedData?: Dispatch<SetStateAction<CombinedData<T, U>>>
  document?: string
  documentType?: 'cpf' | 'cnpj'
}

export function ContratosTabela<T, U>({
  action,
  setContratosInfo,
  contratos,
  customerId,
  fetchHandler,
  setData,
  combinedHandlers,
  setCombinedData,
  document,
  documentType,
}: ContratosTabelaProps<T, U>) {
  const handleClick = async (contract: Contrato) => {
    try {
      if (combinedHandlers && setCombinedData) {
        const [incomeData, debitData] = await Promise.all([
          combinedHandlers.incomeByBills(
            customerId,
            contract.contractNumber,
            contract.origem,
            document,
            documentType,
          ),
          combinedHandlers.currentDebit(
            customerId,
            contract.contractNumber,
            contract.origem,
            document,
            documentType,
          ),
        ])

        setCombinedData({
          incomeByBills: incomeData,
          currentDebit: debitData,
        })
      } else if (fetchHandler && setData) {
        const data = await fetchHandler(
          customerId,
          contract.contractNumber,
          contract.origem,
          document,
          documentType,
        )
        setData(data)
      }

      setContratosInfo({
        contractNumber: contract.contractNumber,
        enterpriseName: contract.enterpriseName,
        unit: contract.unit,
        origem: contract.origem,
      })

      action(true)
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
    }
  }

  return (
    <Table>
      <TableCaption>Lista de Contratos.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Contrato</TableHead>
          <TableHead>Unidade</TableHead>
          <TableHead>Empreendimento</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {contratos.map((item, index) => (
          <TableRow key={index}>
            <TableCell
              onClick={() => handleClick(item)}
              className="font-semibold cursor-pointer"
            >
              {item.contractNumber}
            </TableCell>
            <TableCell>{item.unit}</TableCell>
            <TableCell>{item.enterpriseName}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
