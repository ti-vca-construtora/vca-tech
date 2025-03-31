'use client'

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { useEffect, useState } from 'react'

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
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

  const diasPrazo = 3
  const diasDuracao = 4

  console.log(selectedSlot)
  console.log(selectedDevelopment)

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const groupedSlots = (slots ?? []).reduce((acc: any, slot) => {
    const date = format(parseISO(slot.startAt), 'yyyy-MM-dd')
    if (!acc[date]) acc[date] = []
    acc[date].push(slot)
    return acc
  }, {})

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

                      return (
                        <td
                          key={day + rowIndex}
                          className="cursor-pointer border text-center hover:bg-gray-200"
                          onClick={() => setSelectedSlot(slot?.id)}
                        >
                          <ContextMenu>
                            <ContextMenuTrigger className="w-full h-full flex justify-center items-center py-4 px-3">
                              {slot
                                ? `${format(parseISO(slot.startAt), 'HH:mm')} às ${format(parseISO(slot.endAt), 'HH:mm')}`
                                : '—'}
                            </ContextMenuTrigger>
                            <ContextMenuContent>
                              <ContextMenuItem className="cursor-pointer">
                                Disponibilizar
                              </ContextMenuItem>
                              <ContextMenuItem className="cursor-pointer">
                                Indisponibilizar
                              </ContextMenuItem>
                            </ContextMenuContent>
                          </ContextMenu>
                        </td>
                      )
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
