/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { rtdb } from '@/lib/firebase'
import { get, ref } from 'firebase/database'

export const checkUserHasReservation = async (
  userLoggedId: string | null
): Promise<boolean> => {
  if (!userLoggedId) return false

  const equipmentsRef = ref(rtdb, 'equipments')

  try {
    const snapshot = await get(equipmentsRef)
    const data = snapshot.val()

    const found = Object.values(data || {}).some(
      (equip: any) => equip.currentUser === userLoggedId
    )

    return found
  } catch (error) {
    console.error('Erro ao verificar reserva do usuário:', error)
    return false
  }
}
