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
  action?: Dispatch<SetStateAction<T>>,
) => Promise<void>

export type Contrato = {
  unit: string
  contractNumber: string
  enterpriseName: string
  origem: string
}

type ContratosTabelaProps<T> = {
  action: Dispatch<SetStateAction<boolean>>
  setContratosInfo: Dispatch<SetStateAction<Contrato>>
  contratos: Contrato[]
  customerId: string
  fetchHandler: FetchHandler<T>
  document?: string
  documentType?: 'cpf' | 'cnpj'
  setData: Dispatch<SetStateAction<T>>
}

export function ContratosTabela<T>({
  action,
  setContratosInfo,
  contratos,
  customerId,
  fetchHandler,
  document,
  documentType,
  setData,
}: ContratosTabelaProps<T>) {
  const handleClick = async (contract: Contrato) => {
    try {
      await fetchHandler(
        customerId,
        contract.contractNumber,
        contract.origem,
        document,
        documentType,
        setData,
      )

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
