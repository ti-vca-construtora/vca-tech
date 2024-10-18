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

type ContratosTabela = {
  action: Dispatch<SetStateAction<boolean>>
}

export function ContratosTabela({ action }: ContratosTabela) {
  return (
    <Table>
      <TableCaption>Lista de Contratos.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Contrato</TableHead>
          <TableHead>Unidade</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell
            onClick={() => action(true)}
            className="font-semibold cursor-pointer"
          >
            98908230938
          </TableCell>
          <TableCell>Unidade Exemplo</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}
