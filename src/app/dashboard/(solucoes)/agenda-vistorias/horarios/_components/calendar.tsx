'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { addHours, format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { useEffect, useMemo, useState } from 'react'

interface Slot {
  id: string
  startAt: string
  endAt: string
}

export function Calendar({
  selectedDevelopment,
}: {
  selectedDevelopment?: string
}) {
  const [slots, setSlots] = useState<Slot[]>([])

  const diasPrazo = 3
  const diasDuracao = 4

  useEffect(() => {
    if (!selectedDevelopment) return
    loadSlots()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDevelopment])

  const loadSlots = async () => {
    const firstDateRender = new Date()
    firstDateRender.setHours(2, 0, 0, 0)
    firstDateRender.setDate(firstDateRender.getDate() + diasPrazo)

    const response = await fetch(
      // eslint-disable-next-line prettier/prettier
      `/api/vistorias/slots?fromDate=${firstDateRender.toISOString()}&developmentId=${selectedDevelopment}`
    )

    if (!response.ok) {
      console.error('Erro ao carregar slots')
      return
    }

    const data = await response.json()
    console.log(data.data)
    setSlots(data.data)
  }

  const groupedSlots = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (slots ?? []).reduce((acc: any, slot) => {
      const date = format(parseISO(slot.startAt), 'yyyy-MM-dd')
      if (!acc[date]) acc[date] = []
      acc[date].push(slot)
      return acc
    }, {})
  }, [slots])

  const getNextDays = () => {
    const days = []
    const today = new Date()
    today.setDate(today.getDate() + diasPrazo)

    for (let i = 0; i < diasDuracao; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      days.push(format(date, 'yyyy-MM-dd'))
    }

    return days
  }

  const nextDays = getNextDays()

  const disponibilizarSlot = async (slotId: string) => {
    const response = await fetch(`/api/vistorias/slots?id=${slotId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'AVAILABLE',
      }),
      // eslint-disable-next-line prettier/prettier
    })

    if (!response.ok) {
      console.error('Erro ao disponibilizar slot')
      return
    }

    const data = await response.json()
    loadSlots()
    console.log(data)
  }

  const inDisponibilizarSlot = async (slotId: string) => {
    const response = await fetch(`/api/vistorias/slots?id=${slotId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'UNAVAILABLE',
      }),
      // eslint-disable-next-line prettier/prettier
    })

    if (!response.ok) {
      console.error('Erro ao disponibilizar slot')
      return
    }

    const data = await response.json()
    loadSlots()
    console.log(data)
  }

  return (
    <div className="max-w-screen-sm">
      <div className="flex flex-col p-2 justify-center items-center rounded-lg border bg-card text-card-foreground shadow-sm w-full h-auto">
        <h1 className="font-semibold text-2xl mb-5">Agenda ativa:</h1>
        {selectedDevelopment ? (
          <div className="overflow-x-auto w-full">
            <table className="min-w-max border-collapse">
              <thead>
                <tr>
                  {nextDays.map((day) => (
                    <th
                      key={day}
                      className="border py-2 px-2 text-center bg-gray-100"
                    >
                      {format(parseISO(day), 'dd/MM', { locale: ptBR })}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 4 }, (_, rowIndex) => (
                  <tr key={rowIndex}>
                    {nextDays.map((day) => {
                      const slot = groupedSlots[day]?.[rowIndex]

                      if (!slot) {
                        return (
                          <td
                            key={day + rowIndex}
                            className="border text-center"
                          >
                            <DropdownMenu>
                              <DropdownMenuTrigger className="w-full h-full flex justify-center items-center py-4 px-3">
                                —
                              </DropdownMenuTrigger>
                            </DropdownMenu>
                          </td>
                        )
                      }

                      return slot.status === 'UNAVAILABLE' ? (
                        <td
                          key={day + rowIndex}
                          className="cursor-pointer border text-center bg-red-100 hover:bg-gray-200"
                        >
                          <DropdownMenu>
                            <DropdownMenuTrigger className="w-full h-full flex justify-center items-center py-4 px-3 outline-none focus:outline-none">
                              {`${format(addHours(parseISO(slot.startAt), 3), 'HH:mm')} às ${format(addHours(parseISO(slot.endAt), 3), 'HH:mm')}`}{' '}
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() => disponibilizarSlot(slot.id)}
                                className="cursor-pointer"
                              >
                                Disponibilizar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      ) : slot.status === 'AVAILABLE' ? (
                        <td
                          key={day + rowIndex}
                          className="cursor-pointer border text-center bg-green-100 hover:bg-gray-200"
                        >
                          <DropdownMenu>
                            <DropdownMenuTrigger className="w-full h-full flex justify-center items-center py-4 px-3 outline-none focus:outline-none">
                              {`${format(addHours(parseISO(slot.startAt), 3), 'HH:mm')} às ${format(addHours(parseISO(slot.endAt), 3), 'HH:mm')}`}{' '}
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() => inDisponibilizarSlot(slot.id)}
                                className="cursor-pointer"
                              >
                                Indisponibilizar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      ) : slot.status === 'BOOKED' ? (
                        <td
                          key={day + rowIndex}
                          className="cursor-pointer border text-center bg-blue-100 hover:bg-gray-200"
                        >
                          <DropdownMenu>
                            <DropdownMenuTrigger className="w-full h-full flex justify-center items-center py-4 px-3">
                              {`${format(addHours(parseISO(slot.startAt), 3), 'HH:mm')} às ${format(addHours(parseISO(slot.endAt), 3), 'HH:mm')}`}{' '}
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem className="cursor-pointer">
                                Disponibilizar
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer">
                                Indisponibilizar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      ) : null
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Selecione um empreendimento</p>
        )}
      </div>
    </div>
  )
}
