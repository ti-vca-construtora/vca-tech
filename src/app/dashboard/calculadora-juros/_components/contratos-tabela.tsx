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
import { IncomeByBillsApiResponse } from '@/app/api/avp/income-by-bills/route'

export type Contrato = {
  unit: string
  contractNumber: string
  enterpriseName: string
}

type ContratosTabela = {
  action: Dispatch<SetStateAction<boolean>>
  setParcelas: Dispatch<SetStateAction<IncomeByBillsApiResponse>>
  setContratosInfo: Dispatch<SetStateAction<Contrato>>
  customerId: string
  contratos: Contrato[]
}

type ReceivableBills = {
  documentNumber: string
}

export function ContratosTabela({
  action,
  setParcelas,
  setContratosInfo,
  contratos,
  customerId,
}: ContratosTabela) {
  const handleFetchReceivableBills = async (
    customerId: string,
    contractNumber: string,
  ) => {
    try {
      const data = await fetch(
        `/api/avp/receivable-bills?customerId=${customerId}&contractNumber=${contractNumber}`,
      )

      if (!data.ok) {
        throw new Error('Erro ao buscar contratos')
      }

      const parsed = await data.json()

      const filteredContratos = parsed.results.filter(
        (item: ReceivableBills) => item.documentNumber === contractNumber,
      )

      if (!filteredContratos.length) {
        throw new Error('Nenhum contrato correspondente encontrado')
      }

      const receivableBillId = filteredContratos[0].receivableBillId

      const billsData = await fetch(
        `/api/avp/income-by-bills?billId=${receivableBillId}`,
      )

      if (!billsData.ok) {
        throw new Error('Erro ao buscar parcelas')
      }

      const parsedBillsData: IncomeByBillsApiResponse = await billsData.json()

      console.log('Novo retorno de API: ', parsedBillsData)

      setParcelas(parsedBillsData)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any | unknown) {
      console.log(error.message)
    }
  }

  const handleClick = (contract: Contrato) => {
    console.log(contract)
    handleFetchReceivableBills(customerId, contract.contractNumber)
    setContratosInfo({
      contractNumber: contract.contractNumber,
      enterpriseName: contract.enterpriseName,
      unit: contract.unit,
    })
    action(true)
  }

  console.log(contratos)

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
