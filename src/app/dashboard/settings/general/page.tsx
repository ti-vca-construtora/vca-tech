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
import { usuarios } from '@/data/usuarios'
import classNames from 'classnames'
import { MoreHorizontal, User } from 'lucide-react'

export default function Page() {
  return (
    <section className="flex flex-col items-start gap-6 w-full h-full p-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Usuários</CardTitle>
          <CardDescription>Gerenciamento geral de usuários</CardDescription>
        </CardHeader>
        <CardContent>
          <Table className="p-2 rounded bg-white">
            <TableHeader>
              <TableRow>
                <TableHead className="w-20"></TableHead>
                <TableHead className="w-[350px]">Usuário</TableHead>
                <TableHead className="w-44">Setor</TableHead>
                <TableHead className="flex-grow">Cargo</TableHead>
                <TableHead className="w-16 text-center"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.map((usuario, index) => (
                <TableRow
                  key={index}
                  className={classNames(index % 2 === 0 && 'bg-neutral-50')}
                >
                  <TableCell>
                    <div className="rounded-full size-10 bg-neutral-100 flex items-center justify-center">
                      <User />
                    </div>
                  </TableCell>
                  <TableCell className="flex flex-col w-fit">
                    <span className="font-semibold">{usuario.user}</span>
                    <span className="text-xs">{usuario.email}</span>
                  </TableCell>
                  <TableCell className="text-start">
                    <span className="text-sm">{usuario.setor}</span>
                  </TableCell>
                  <TableCell className="text-start">
                    <span className="text-sm">{usuario.cargo}</span>
                  </TableCell>
                  <TableCell className="">
                    <MoreHorizontal />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="w-full p-4 text-xs flex items-center justify-between">
            <span className="text-neutral-400 font-semibold">
              0 de 0 linha(s) selecionada(s).
            </span>
            <div className="flex gap-2 items-center justify-center">
              <button className="rounded p-2 border font-semibold text-neutral-400">
                Anterior
              </button>
              <button className="rounded p-2 border font-semibold text-neutral-400">
                Próxima
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
