'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { addDays, addHours, format, isSameDay, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'

interface Inspection {
  id: string
  status: string
  inspectionSlot: {
    startAt: string | Date
    endAt: string | Date
    status: string
  }
  unitId: string
  unit: {
    unit: string
    development: {
      name: string
    }
  }
}

const ScheduledInspectionsPage = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const sucessNotif = () =>
    toast.success('Registro registrado!', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'light',
    })

  const errorNotif = () =>
    toast.error('Falha no registro.', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'light',
    })

  useEffect(() => {
    const fetchInspections = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(
          '/api/vistorias/inspections?page=1&pageSize=999999',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            // eslint-disable-next-line prettier/prettier
          }
        )

        if (!response.ok) {
          throw new Error('Erro ao carregar vistorias')
        }

        const data = await response.json()
        const scheduledInspections = data.data.filter(
          // eslint-disable-next-line prettier/prettier
          (item: Inspection) =>
            item.status === 'SCHEDULED' ||
            item.status === 'COMPLETED' ||
            // eslint-disable-next-line prettier/prettier
            item.status === 'RESCHEDULED'
        )
        setInspections(scheduledInspections)
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInspections()
  }, [])

  const goToPreviousDay = () => {
    setCurrentDate(addDays(currentDate, -1))
  }

  const goToNextDay = () => {
    setCurrentDate(addDays(currentDate, 1))
  }

  const formatDate = (date: Date) => {
    return format(date, "EEEE, d 'de' MMMM", { locale: ptBR })
  }

  const formatTime = (date: string | Date) => {
    if (date instanceof Date) {
      return format(date, 'HH:mm')
    }
    if (typeof date === 'string') {
      return format(parseISO(date), 'HH:mm')
    }
    return ''
  }

  const normalizeDate = (date: string | Date): Date => {
    let dateObj: Date

    if (date instanceof Date) {
      dateObj = date
    } else {
      dateObj = parseISO(date)
    }

    // Adiciona 3 horas para ajuste de fuso horário
    return addHours(dateObj, 3)
  }

  const filteredInspections = inspections.filter((inspection) => {
    const startDate = normalizeDate(inspection.inspectionSlot.startAt)
    return isSameDay(startDate, currentDate)
  })

  const renderInspections = () => {
    if (isLoading) {
      return <div className="text-center py-4">Carregando...</div>
    }

    if (filteredInspections.length === 0) {
      return (
        <div className="text-center py-4 text-muted-foreground">
          Nenhuma vistoria agendada para este dia.
        </div>
      )
    }

    const atualizarCheckUnidade = async (id: string) => {
      const response = await fetch(`/api/vistorias/unidades?id=${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          validations: ['FINANCIAL', 'QUALITY'],
        }),
      })

      if (!response.ok) {
        console.error('Erro ao atualizar agendamento.')
        errorNotif()
        return
      }

      const data = await response.json()
      console.log(data)
      sucessNotif()
      setTimeout(() => {
        window.location.reload()
      }, 3000)
    }

    const atualizarVistoria = async (
      id: string,
      status: string,
      // eslint-disable-next-line prettier/prettier
      unitId: string
    ) => {
      const response = await fetch(`/api/vistorias/inspections?id=${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
        }),
      })

      if (!response.ok) {
        console.error('Erro ao atualizar agendamento.')
        errorNotif()
        return
      }

      if (status === 'COMPLETED') {
        const data = await response.json()
        console.log(data)
        sucessNotif()
        setTimeout(() => {
          window.location.reload()
        }, 3000)
      } else if (status === 'RESCHEDULED') {
        const data = await response.json()
        console.log(data)
        atualizarCheckUnidade(unitId)
      }
    }

    return filteredInspections.map((inspection) => {
      const startDate = normalizeDate(inspection.inspectionSlot.startAt)
      const endDate = normalizeDate(inspection.inspectionSlot.endAt)

      return (
        <div
          key={inspection.id}
          className="mt-2 flex py-2 px-4 sm:flex-row flex-col justify-between items-center rounded-lg border bg-card text-card-foreground shadow-sm w-full h-auto"
        >
          <div>
            <h2 className="font-semibold">
              {inspection.unit.development.name}
            </h2>
            <p>{`Unidade: ${inspection.unit.unit}`}</p>
            <p className="text-sm text-muted-foreground">
              {`Horário: ${formatTime(startDate)} às ${formatTime(endDate)}`}
            </p>
          </div>

          {inspection.status === 'COMPLETED' ? (
            <div>
              <Badge
                variant={'outline'}
                className="flex items-center gap-2 justify-center border-green-500 bg-green-100"
              >
                <span className="text-xl m-0 p-0 text-green-500">•</span>
                <p className="text-sm font-medium">Entregue</p>
              </Badge>
            </div>
          ) : inspection.status === 'RESCHEDULED' ? (
            <div>
              <Badge
                variant={'outline'}
                className="flex items-center gap-2 justify-center border-yellow-500 bg-yellow-100"
              >
                <span className="text-xl m-0 p-0 text-yellow-500">•</span>
                <p className="text-sm font-medium">Recusado</p>
              </Badge>
            </div>
          ) : (
            <div>
              <Badge
                variant={'outline'}
                className="flex items-center gap-2 justify-center"
              >
                <span className="text-xl m-0 p-0">•</span>
                <p className="text-sm font-medium">Agendado</p>
              </Badge>
            </div>
          )}

          <div className="sm:mt-0 mt-3">
            <DialogTrigger className="w-full h-full flex justify-center items-center py-4 px-3">
              <Button variant="outline">Registrar</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registro de vistoria</DialogTitle>
                <DialogDescription>
                  Informe se a unidade foi aceita ou recusada pelo cliente.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 mt-4">
                <Button
                  variant="outline"
                  className="bg-azul-claro-vca text-white"
                  onClick={() =>
                    atualizarVistoria(
                      inspection.id,
                      'COMPLETED',
                      // eslint-disable-next-line prettier/prettier
                      inspection.unitId
                    )
                  }
                >
                  Entregue
                </Button>
                <Button
                  variant="destructive"
                  onClick={() =>
                    atualizarVistoria(
                      inspection.id,
                      'RESCHEDULED',
                      // eslint-disable-next-line prettier/prettier
                      inspection.unitId
                    )
                  }
                >
                  Recusado
                </Button>
              </div>
            </DialogContent>
          </div>
        </div>
      )
    })
  }

  return (
    <div className="size-full p-4">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Dialog>
        <Card className="size-full">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Vistorias Agendadas</CardTitle>
                <CardDescription className="mt-2">
                  Visualize as vistorias agendadas por dia
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={goToPreviousDay}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-lg font-medium">
                  {formatDate(currentDate)}
                </div>
                <Button variant="outline" size="icon" onClick={goToNextDay}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="sm:max-h-90 max-h-96 overflow-y-scroll no-scrollbar">
              {renderInspections()}
            </div>
          </CardContent>
        </Card>
      </Dialog>
    </div>
  )
}

export default ScheduledInspectionsPage
