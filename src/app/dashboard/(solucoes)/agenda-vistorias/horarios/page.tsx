'use client'

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useEffect, useState } from 'react'
import { Calendar } from './_components/calendar'
import { DisponibilizarHorarios } from './_components/disponibilizar-horarios'

type Empreendimento = {
  id: string
  name: string
  isActive: boolean
}

const Horarios = () => {
  const [empreendimentos, setEmpreendimentos] = useState<Empreendimento[]>([])
  const [selectedDevelopment, setSelectedDevelopment] = useState<string>('')

  const getEmpreendimentos = async () => {
    const response = await fetch(
      '/api/vistorias/empreendimentos?page=1&pageSize=999&isActive=1',
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
  }

  useEffect(() => {
    getEmpreendimentos()
  }, [])

  return (
    <section className="flex p-6 flex-col">
      <div className="grid w-full items-center gap-1.5 mb-4">
        <Label htmlFor="empreendimento">Empreendimento</Label>
        <Select
          value={selectedDevelopment}
          onValueChange={(value) => setSelectedDevelopment(value)}
        >
          <SelectTrigger
            id="empreendimento"
            className="w-full cursor-pointer bg-white"
          >
            <SelectValue placeholder="SELECIONE UM EMPREENDIMENTO" />
          </SelectTrigger>
          <SelectContent className="cursor-pointer">
            {empreendimentos.map((empreendimento) => (
              <SelectItem
                key={empreendimento.id}
                className="cursor-pointer"
                value={empreendimento.id}
              >
                {empreendimento.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex">
        <DisponibilizarHorarios />
        <Calendar selectedDevelopment={selectedDevelopment} />
      </div>
    </section>
  )
}

export default Horarios
