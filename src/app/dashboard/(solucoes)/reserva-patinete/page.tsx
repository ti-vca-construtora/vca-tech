'use client'

// import { RouteGuard } from '@/components/route-guard'

import { Button } from '@/components/ui/button'
import { useUser } from '@/hooks/use-user'
import { db, rtdb } from '@/lib/firebase'
import { ref, set } from 'firebase/database'
import { addDoc, collection } from 'firebase/firestore'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Carousel } from './_components/Carousel'
import { checkUserHasReservation } from './_components/hasReservation'

export default function AgendaVistorias() {
  const { user } = useUser()

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [availableCount, setAvailableCount] = useState(0)
  const [userLoggedId, setUserLoggedId] = useState<string | null>(null)
  const [userLoggedName, setUserLoggedName] = useState<string | null>(null)
  const [hasReservation, setHasReservation] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [obsCheckin, setObsCheckin] = useState<string>('')

  const equipmentNames = ['vca001', 'vca002', 'vca003', 'vca004', 'vca005']
  const selectedEquipmentName =
    selectedIndex !== null ? equipmentNames[selectedIndex] : null

  const openModal = () => {
    setModalOpen(true)
  }

  useEffect(() => {
    if (selectedIndex !== null) {
      console.log(selectedIndex)
    }

    if (user) {
      setUserLoggedId(user.id)
      setUserLoggedName(user.name ?? null)
    }

    checkUserReservation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex, user])

  const checkUserReservation = async () => {
    if (!userLoggedId) return

    const hasReservation = await checkUserHasReservation(userLoggedId)
    if (hasReservation) {
      setHasReservation(true)
    }
  }

  const reservarPatineteRealtimeDb = async () => {
    if (!userLoggedId || !userLoggedName) {
      alert('Erro ao reservar. Procure o setor TECH.')
      return
    }

    const prazoDevolucao = new Date()
    prazoDevolucao.setDate(prazoDevolucao.getDate() + 1)
    const reservedUntil = prazoDevolucao.toISOString()

    const equipmentIds = ['vca001', 'vca002', 'vca003', 'vca004', 'vca005']
    const selectedEquipmentId =
      selectedIndex !== null ? equipmentIds[selectedIndex] : null

    const equipmentRef = ref(rtdb, `equipments/${selectedEquipmentId}`)

    try {
      await set(equipmentRef, {
        available: false,
        currentUser: userLoggedId,
        reservedUntil,
      })
      reservarPatineteFirestoreDb()
    } catch (error) {
      console.error('Erro ao reservar patinete na primeira etapa!:', error)
    }
  }

  const reservarPatineteFirestoreDb = async () => {
    const date = new Date()
    date.setHours(date.getHours() - 3)

    const equipmentIds = ['vca001', 'vca002', 'vca003', 'vca004', 'vca005']
    const selectedEquipmentId =
      selectedIndex !== null ? equipmentIds[selectedIndex] : null

    const logsRef = collection(db, 'logs')

    try {
      await addDoc(logsRef, {
        equipment: selectedEquipmentId,
        obs: obsCheckin,
        photos: [],
        time: date.toISOString(),
        type: 'in',
        userName: user?.name,
      })
      console.log(`Reserva feita com sucesso para ${selectedEquipmentId}`)
      window.location.reload()
    } catch (error) {
      console.error('Erro ao reservar patinete na segunda etapa!:', error)
    }
  }

  return (
    // <RouteGuard
    //   requiredArea="entregas"
    //   requiredPermission="agendamento-vistorias"
    // >
    <>
      {modalOpen ? (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-3/5">
            <h2 className="text-lg font-semibold">Check-In</h2>
            <h3 className="mb-4">{`Reservando patinete elétrico ${selectedEquipmentName?.toUpperCase()}`}</h3>
            <h2 className="font-medium">Observações:</h2>
            <textarea
              className="w-full h-36 border border-gray-300 rounded p-2"
              value={obsCheckin}
              onChange={(e) => setObsCheckin(e.target.value)}
              placeholder="Digite aqui suas observações sobre o patinete escolhido..."
            ></textarea>
            <div className="flex justify-end mt-4">
              <Button
                variant="default"
                className="bg-red-600 hover:bg-red-700 mr-2"
                onClick={() => setModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="default"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  reservarPatineteRealtimeDb()
                }}
              >
                Reservar
              </Button>
            </div>
          </div>
        </div>
      ) : null}
      <>
        {hasReservation ? (
          <div>
            <h1 className="text-xl font-semibold text-red-600">
              Você já possui uma reserva ativa.
            </h1>
          </div>
        ) : (
          <div className="size-full flex-col flex items-center justify-center p-6">
            <div className="flex w-4/6 justify-between items-center mb-10">
              <div>
                <h1 className="text-xl font-semibold text-green-600">
                  Patinetes disponíveis: {availableCount}
                </h1>
              </div>
              <div>
                <Link href="/dashboard/reserva-patinete/historico">
                  <Button
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Histórico de reservas
                  </Button>
                </Link>
              </div>
            </div>
            <Carousel
              onSlideChange={setSelectedIndex}
              onAvailableCountChange={setAvailableCount}
              onOpenModal={openModal}
            />
          </div>
        )}
      </>
    </>
    // </RouteGuard>
  )
}
