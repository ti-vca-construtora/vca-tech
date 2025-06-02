'use client'

import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { db } from '@/lib/firebase'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { collection, getDocs } from 'firebase/firestore'
import { Eye } from 'lucide-react'
import { useEffect, useState } from 'react'

type Log = {
  id: string
  type: 'in' | 'out'
  time: string
  equipment: string
  userName: string
  obs?: string
}

const LogsReservaPatinete = () => {
  const [logs, setLogs] = useState<Log[]>([])

  useEffect(() => {
    const fetchLogs = async () => {
      const snapshot = await getDocs(collection(db, 'logs'))
      const data: Log[] = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Log, 'id'>),
        }))
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      setLogs(data)
    }

    fetchLogs()
  }, [])

  // Deploy

  return (
    <div className="flex flex-col w-full items-center gap-6 h-5/6">
      <div className="w-full max-w-6xl">
        <h1 className="text-2xl font-bold">Histórico de Reservas</h1>
        <p className="text-gray-600">
          Aqui você pode visualizar o histórico de reservas de patinetes.
        </p>
      </div>

      <div className="flex w-full h-full justify-center">
        <div className="w-full max-w-6xl">
          <Table>
            <TableHeader>
              <TableRow className="flex w-full justify-between items-center">
                <TableHead>Tipo</TableHead>
                <TableHead className="mr-40">Data</TableHead>
                <TableHead>Patinete</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead className="text-center">Observações</TableHead>
              </TableRow>
            </TableHeader>
          </Table>

          {/* SCROLLABLE BODY */}
          <div className="overflow-y-auto max-h-[400px]">
            <Table>
              <TableBody>
                {logs.map((log) => {
                  const date = new Date(log.time)
                  date.setHours(date.getHours() + 3)

                  return (
                    <TableRow key={log.id} className="even:bg-white">
                      <TableCell className="rounded-l-xl">
                        <Badge
                          variant={
                            log.type === 'in' ? 'default' : 'destructive'
                          }
                          className={
                            log.type === 'in'
                              ? 'bg-green-500 hover:bg-green-600 cursor-pointer'
                              : 'bg-red-500 hover:bg-red-600 cursor-pointer'
                          }
                        >
                          {log.type === 'in' ? 'Check-In' : 'Check-Out'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(date, 'dd/MM/yyyy - HH:mm:ss', {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell>{log.equipment.toUpperCase()}</TableCell>
                      <TableCell>{log.userName}</TableCell>
                      <TableCell className="rounded-r-xl text-center">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Eye className="h-4 w-4 cursor-pointer mx-auto" />
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Observações</DialogTitle>
                              <DialogDescription className="text-sm text-gray-500">
                                {log.obs
                                  ? log.obs
                                  : 'Nenhuma observação registrada.'}
                              </DialogDescription>
                            </DialogHeader>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {/* FOOTER FIXO */}
          <Table>
            <TableCaption>
              Registros de entrada e saída de patinetes.
            </TableCaption>
          </Table>
        </div>
      </div>
    </div>
  )
}

export default LogsReservaPatinete
