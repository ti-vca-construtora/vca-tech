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
import { Parcela, ParcelasFull } from './form'

export type Contrato = {
  unit: string
  contractNumber: string
  enterpriseName: string
}

type ContratosTabela = {
  action: Dispatch<SetStateAction<boolean>>
  setParcelas: Dispatch<SetStateAction<ParcelasFull>>
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
        `/api/receivable-bills?customerId=${customerId}&contractNumber=${contractNumber}`,
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

      // Busca paginada das parcelas
      const allParcelasResults: Parcela[] = []
      let offset = 0
      const limit = 200 // Ajuste o limite conforme necessário
      let total = 0

      do {
        const billsData = await fetch(
          `/api/receivable-bills-installments?billId=${receivableBillId}&offset=${offset}&limit=${limit}`,
        )

        if (!billsData.ok) {
          throw new Error('Erro ao buscar parcelas')
        }

        const parsedBillsData = await billsData.json()

        console.log('total: ', parsedBillsData.resultSetMetadata.count)

        allParcelasResults.push(...parsedBillsData.results) // Adiciona as parcelas ao array
        total = parsedBillsData.resultSetMetadata.count // Total de parcelas disponíveis na API
        offset += limit // Incrementa o offset para a próxima página
      } while (allParcelasResults.length < total)

      // Construção do objeto final
      const allParcelas: ParcelasFull = {
        results: allParcelasResults,
        resultSetMetadata: {
          limit, // O limite utilizado em cada requisição
          count: allParcelasResults.length, // Número total de parcelas acumuladas
          offset: 0, // Offset inicial (0 para indicar o início)
        },
      }

      setParcelas(allParcelas)

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
