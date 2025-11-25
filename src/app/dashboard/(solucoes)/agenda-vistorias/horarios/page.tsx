/* eslint-disable prettier/prettier */
'use client'

import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LoaderCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Calendar } from './_components/calendar'
import { DisponibilizarHorarios } from './_components/disponibilizar-horarios'
import CriarSlotsBulk from './_components/fnc-criaSlotsBulk'
import vrfCriaSlot from './_components/fnc-verificaUltSlot'

type Empreendimento = {
  id: string
  name: string
  isActive: boolean
}

const Horarios = () => {
  const [empreendimentos, setEmpreendimentos] = useState<Empreendimento[]>([])
  const [selectedDevelopment, setSelectedDevelopment] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

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

  const initRef = useRef(false)

  const checkSlots = async () => {
    console.log('[HORARIOS] Iniciando verificação de slots...')
    setIsLoading(true)
    try {
      // retorna lista de empreendimentos sem agenda completa
      console.log('[HORARIOS] Chamando vrfCriaSlot...')
      const missingIds = await vrfCriaSlot()
      console.log('[HORARIOS] Empreendimentos faltantes:', missingIds)

      if (missingIds && missingIds.length > 0) {
        console.log(
          '[HORARIOS] Criando slots para',
          missingIds.length,
          'empreendimentos'
        )
        await CriarSlotsBulk(missingIds)
        console.log('[HORARIOS] Slots criados com sucesso')
      } else {
        console.log('[HORARIOS] Nenhum empreendimento precisa de slots')
      }
    } catch (error) {
      console.error('[HORARIOS] Erro ao verificar/criar slots:', error)
    } finally {
      setIsLoading(false)
      console.log('[HORARIOS] Verificação finalizada')
    }
  }

  useEffect(() => {
    if (initRef.current) return
    initRef.current = true
    getEmpreendimentos()
    checkSlots()
  }, [])

  return (
    <section className="flex p-6 flex-col">
      {isLoading ? (
        <Card>
          <div className="flex w-full h-full justify-center items-center">
            <LoaderCircle className="flex animate-spin duration-700 self-center text-neutral-500" />
          </div>
        </Card>
      ) : (
        <>
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
        </>
      )}
    </section>
  )
}

export default Horarios
