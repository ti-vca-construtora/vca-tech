'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import classNames from 'classnames'
import { LoaderCircle, MoreHorizontal } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type Empreendimento = {
  units: []
  id: string
  name: string
  isActive: boolean
}

export default function Empreendimentos() {
  const [empreendimentos, setEmpreendimentos] = useState<Empreendimento[]>([])
  const [selectedEmpreendimento, setSelectedEmpreendimento] =
    useState<Empreendimento>({
      id: '',
      name: '',
      isActive: true,
      units: [],
    })

  const [isLoading, setIsLoading] = useState(true)

  const getEmpreendimentos = async () => {
    const response = await fetch(
      '/api/vistorias/empreendimentos?page=1&pageSize=200',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // eslint-disable-next-line prettier/prettier
      }
    )

    if (!response.ok) {
      console.error('Erro ao carregar empreendimentos')
      return
    }

    const data = await response.json()
    setEmpreendimentos(data.data)
    console.log('Empreendimentos lsitados:', data.data)
  }

  useEffect(() => {
    const componentRender = async () => {
      await getEmpreendimentos()
      setIsLoading(false)
    }

    componentRender()
  }, [])

  return (
    <section className="flex flex-col items-start gap-6 w-full h-full p-6">
      <Dialog>
        <Card className="w-full">
          <CardHeader className="flex justify-between flex-row">
            <div>
              <CardTitle>Empreendimentos</CardTitle>
              <CardDescription>
                Gerenciamento de empreendimentos.
              </CardDescription>
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
            {isLoading ? (
              <Card>
                <div className="flex w-full h-full justify-center items-center">
                  <LoaderCircle className="flex animate-spin duration-700 self-center text-neutral-500" />
                </div>
              </Card>
            ) : (
              <Table className="p-2 rounded bg-white">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[350px]">Empreendimento</TableHead>
                    <TableHead className="w-44">Status</TableHead>
                    <TableHead className="w-16 text-center"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {empreendimentos.map((index, i) => (
                    <TableRow
                      key={index.id}
                      className={classNames(
                        // eslint-disable-next-line prettier/prettier
                        i % 2 === 0 ? 'bg-white' : 'bg-neutral-100'
                      )}
                    >
                      <TableCell className="flex flex-col w-fit">
                        <span className="font-semibold flex">{index.name}</span>
                      </TableCell>
                      <TableCell className="text-start">
                        <span className="text-sm">
                          {index.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <MoreHorizontal />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuLabel>Opções</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <Link
                              href={`/dashboard/agenda-vistorias/empreendimentos/${index.id}`}
                            >
                              <DropdownMenuItem className="cursor-pointer">
                                Editar
                              </DropdownMenuItem>
                            </Link>
                            <DialogTrigger className="flex w-full">
                              <DropdownMenuItem
                                onClick={() => setSelectedEmpreendimento(index)}
                                className="cursor-pointer flex w-full"
                              >
                                Unidades
                              </DropdownMenuItem>
                            </DialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEmpreendimento.name}</DialogTitle>
            <DialogDescription>
              {`Unidades cadastradas: ${selectedEmpreendimento.units.length}`}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </section>
  )
}
