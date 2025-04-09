'use client'

import RetornaEmpAtivos from './fnc-empativos'

const CriarSlotsBulk = () => {
  const diasPrazo = 3 - 3
  const diasDuracao = 60
  const horarios = [
    { inicio: '08:00', fim: '09:30' },
    { inicio: '10:00', fim: '11:30' },
    { inicio: '13:30', fim: '15:00' },
    { inicio: '15:00', fim: '16:30' },
  ]

  const fetchEmpreendimentos = async () => {
    const ids = await RetornaEmpAtivos()
    createSlots(ids)
  }

  fetchEmpreendimentos()

  const createSlots = async (ids: (string | number)[]) => {
    const slots = []
    const today = new Date()
    today.setHours(today.getHours() - 3)
    today.setDate(today.getDate() + diasPrazo)

    for (let i = 0; i < diasDuracao; i++) {
      const currentDate = new Date(today)
      currentDate.setHours(today.getHours() - 3)
      currentDate.setDate(today.getDate() + i)

      for (const horario of horarios) {
        for (const id of ids) {
          const startAt = new Date(currentDate)
          const [startHour, startMinute] = horario.inicio.split(':')
          startAt.setHours(Number(startHour) - 3, Number(startMinute), 0, 0)

          const endAt = new Date(currentDate)
          const [endHour, endMinute] = horario.fim.split(':')
          endAt.setHours(Number(endHour) - 3, Number(endMinute), 0, 0)

          slots.push({
            startAt: startAt.toISOString(),
            endAt: endAt.toISOString(),
            developmentId: id,
          })
        }
      }
    }

    console.log(slots)
    const response = await fetch('/api/vistorias/slots', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ slots }),
    })

    if (!response.ok) {
      console.error('Erro ao criar slots')
      return
    }

    const data = await response.json()
    console.log('Slots criados:', data)
  }
}

export default CriarSlotsBulk
