'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function CalendarConfig() {
  return (
    <div>
      <div className="mb-4">
        <label>Prazo mínimo de agendamento</label>
        <Input type="number" />
      </div>
      <div className="mb-4">
        <label>Prazo máximo de agendamento</label>
        <Input type="number" />
      </div>
      <div className="flex justify-end">
        <Button
          variant="outline"
          className="bg-azul-claro-vca text-white hover:bg-azul-vca hover:text-white"
        >
          Salvar
        </Button>
      </div>
    </div>
  )
}
