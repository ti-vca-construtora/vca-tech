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

import { MoreHorizontal } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type Empreendimento = {
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
    })

  const getEmpreendimentos = async () => {
    const response = await fetch(
      '/api/vistorias/empreendimentos?page=1&pageSize=20',
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
    getEmpreendimentos()
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
            <Table className="p-2 rounded bg-white">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[350px]">Empreendimento</TableHead>
                  <TableHead className="w-44">Status</TableHead>
                  <TableHead className="w-16 text-center"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {empreendimentos.map((index) => (
                  <TableRow key={index.id} className="bg-neutral-50">
                    <TableCell className="flex flex-col w-fit">
                      <span className="font-semibold">{index.name}</span>
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
          </CardContent>
        </Card>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar Unidades</DialogTitle>
            <DialogDescription>
              {selectedEmpreendimento.id}
              {selectedEmpreendimento.name}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </section>
  )
}
