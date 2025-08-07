/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { rtdb } from '@/lib/firebase'
import { get, ref, update } from 'firebase/database'

export const deleteExpiredReservations = async (): Promise<void> => {
  const equipmentsRef = ref(rtdb, 'equipments')

  try {
    const snapshot = await get(equipmentsRef)
    const data = snapshot.val()

    if (!data) return

    // ⏰ Ajusta o horário atual para UTC-3 manualmente
    const now = new Date()
    now.setHours(now.getHours() - 3)
    console.log('Verificando reservas expiradas em:', now.toISOString())

    const updates: Record<string, any> = {}

    Object.entries(data).forEach(([equipmentId, equipmentData]: any) => {
      const reservedUntil = equipmentData.reservedUntil

      if (!reservedUntil) return // Ignora se não tem data

      const reservedDate = new Date(reservedUntil)

      if (reservedDate < now) {
        updates[`equipments/${equipmentId}/available`] = true
        updates[`equipments/${equipmentId}/currentUser`] = ''
        updates[`equipments/${equipmentId}/reservedUntil`] = ''
      }
    })

    if (Object.keys(updates).length > 0) {
      await update(ref(rtdb), updates)
      console.log(
        'Reservas expiradas removidas com sucesso:',
        Object.keys(updates).length / 3,
        'reservas atualizadas.'
      )
    } else {
      console.log('Nenhuma reserva expirada encontrada.')
    }
  } catch (error) {
    console.error('Erro ao deletar reservas expiradas:', error)
  }
}
