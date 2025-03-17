import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MoreHorizontal } from 'lucide-react'
import Link from 'next/link'

export default function Empreendimentos() {
  return (
    <section className="flex flex-col items-start gap-6 w-full h-full p-6">
      <Card className="w-full">
        <CardHeader className="flex justify-between flex-row">
          <div>
            <CardTitle>Empreendimentos</CardTitle>
            <CardDescription>Gerenciamento de empreendimentos.</CardDescription>
          </div>
          <div>
            <Link href="/dashboard/agenda-vistorias/empreendimentos/cadastrar?title=Cadastrar+empreendimento">
              <button className="px-4 py-1 rounded-md bg-azul-claro-vca text-white">
                Cadastrar empreendimento
              </button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <Table className="p-2 rounded bg-white">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[350px]">Empreendimento</TableHead>
                <TableHead className="w-44">Status</TableHead>
                <TableHead className="w-16 text-center"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="bg-neutral-50">
                <TableCell className="flex flex-col w-fit">
                  <span className="font-semibold">
                    DONNA OLÍVIA UNIVERSIDADE
                  </span>
                </TableCell>
                <TableCell className="text-start">
                  <span className="text-sm">Ativo</span>
                </TableCell>
                <TableCell className="">
                  <MoreHorizontal />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  )
}
