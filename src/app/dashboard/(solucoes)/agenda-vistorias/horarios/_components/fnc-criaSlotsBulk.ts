'use client'

import RetornaEmpAtivos from './fnc-empativos'

// Cria slots para todos os empreendimentos ou somente para os IDs informados
const CriarSlotsBulk = (onlyIds?: (string | number)[]) => {
  const diasPrazo = 3 - 3
  const diasDuracao = 60
  const horarios = [
    { inicio: '08:00', fim: '09:00' },
    { inicio: '09:00', fim: '10:00' },
    { inicio: '10:00', fim: '11:00' },
    { inicio: '11:00', fim: '12:00' },
    { inicio: '12:00', fim: '13:00' },
    { inicio: '13:00', fim: '14:00' },
    { inicio: '14:00', fim: '15:00' },
    { inicio: '15:00', fim: '16:00' },
    { inicio: '16:00', fim: '17:00' },
    { inicio: '17:00', fim: '18:00' },
  ]

  const executar = async () => {
    const ids =
      onlyIds && onlyIds.length > 0 ? onlyIds : await RetornaEmpAtivos()
    if (!ids || ids.length === 0) return
    await createSlots(ids)
  }

  const createSlots = async (ids: (string | number)[]) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    today.setDate(today.getDate() + diasPrazo)

    const endDate = new Date(today)
    endDate.setDate(today.getDate() + diasDuracao - 1)
    endDate.setHours(23, 59, 59, 999)

    const fromIso = today.toISOString()
    const toIso = endDate.toISOString()

    const newSlots: Array<{
      startAt: string
      endAt: string
      developmentId: string | number
    }> = []

    for (const id of ids) {
      // Busca slots existentes no período para o empreendimento
      const existingRes = await fetch(
        // eslint-disable-next-line prettier/prettier
        `/api/vistorias/slots?fromDate=${fromIso}&toDate=${toIso}&developmentId=${id}&page=1&pageSize=99999`
      )
      const existingData = await existingRes.json()
      const existed: Set<string> = new Set(
        // eslint-disable-next-line prettier/prettier
        (existingData?.data ?? []).map((s: { startAt: string }) => s.startAt)
      )

      for (let i = 0; i < diasDuracao; i++) {
        const currentDate = new Date(today)
        currentDate.setDate(today.getDate() + i)

        for (const horario of horarios) {
          const startAt = new Date(currentDate)
          const [startHour, startMinute] = horario.inicio.split(':')
          startAt.setHours(Number(startHour) - 3, Number(startMinute), 0, 0)

          const startIso = startAt.toISOString()
          if (existed.has(startIso)) continue // já existe, não recria

          const endAt = new Date(currentDate)
          const [endHour, endMinute] = horario.fim.split(':')
          endAt.setHours(Number(endHour) - 3, Number(endMinute), 0, 0)

          newSlots.push({
            startAt: startIso,
            endAt: endAt.toISOString(),
            developmentId: id,
          })
        }
      }
    }

    if (newSlots.length === 0) return

    console.log('Criando slots faltantes:', newSlots.length)
    const response = await fetch('/api/vistorias/slots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slots: newSlots }),
    })

    if (!response.ok) {
      console.error('Erro ao criar slots')
      return
    }

    const data = await response.json()
    console.log('Slots criados:', data)
  }

  return executar()
}

export default CriarSlotsBulk
