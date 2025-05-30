'use client'

import { Button } from '@/components/ui/button'
import { useUser } from '@/hooks/use-user'
import { db, rtdb } from '@/lib/firebase'
import { ref, set } from 'firebase/database'
import { addDoc, collection } from 'firebase/firestore'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import { Carousel } from './_components/Carousel'
import { checkUserHasReservation } from './_components/hasReservation'

export default function ReservarPatinete() {
  const { user } = useUser()

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [availableCount, setAvailableCount] = useState(0)
  const [userLoggedId, setUserLoggedId] = useState<string | null>(null)
  const [userLoggedName, setUserLoggedName] = useState<string | null>(null)
  const [hasReservation, setHasReservation] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalOpenCheckout, setModalOpenCheckout] = useState(false)
  const [obsCheckin, setObsCheckin] = useState<string>('')
  const [obsCheckout, setObsCheckout] = useState<string>('')

  const sucessNotif = () =>
    toast.success('Reserva realizada!', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'light',
    })

  const sucessNotifCheckout = () =>
    toast.success('Check-Out realizado!', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'light',
    })

  const warnNotif = () =>
    toast.warn('Tente novamente mais tarde.', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'light',
    })

  const warnNotifUser = () =>
    toast.warn('Erro! Procure o TECH.', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'light',
    })

  const errorNotif = () =>
    toast.error('Falha na reserva.', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'light',
    })

  const errorNotifOut = () =>
    toast.error('Falha no check-out.', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'light',
    })

  const equipmentNames = ['vca001', 'vca002', 'vca003', 'vca004', 'vca005']
  const selectedEquipmentName =
    selectedIndex !== null ? equipmentNames[selectedIndex] : null

  const openModal = () => {
    setModalOpen(true)
  }

  const openModalCheckout = () => {
    setModalOpenCheckout(true)
  }

  useEffect(() => {
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
      setHasReservation(hasReservation)
    }
  }

  const reservarPatineteRealtimeDb = async () => {
    if (!userLoggedId || !userLoggedName) {
      warnNotifUser()
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
      console.error('Erro ao reservar patinete na realtimeDb:', error)
      warnNotif()
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
      sucessNotif()
      setTimeout(() => {
        window.location.reload()
      }, 3000)
    } catch (error) {
      console.error('Erro ao reservar patinete no firestoreDb:', error)
      errorNotif()
    }
  }

  const devolverPatineteRealtimeDb = async () => {
    if (!userLoggedId || !userLoggedName) {
      alert('Erro ao devolver. Procure o setor TECH.')
      return
    }

    const equipmentRef = ref(rtdb, `equipments/${hasReservation}`)

    try {
      await set(equipmentRef, {
        available: true,
        currentUser: '',
        reservedUntil: '',
      })
      devolverPatineteFirestoreDb()
    } catch (error) {
      console.error('Erro ao devolver patinete no realtimeDb:', error)
      errorNotifOut()
    }
  }

  const devolverPatineteFirestoreDb = async () => {
    const date = new Date()
    date.setHours(date.getHours() - 3)

    const logsRef = collection(db, 'logs')

    try {
      await addDoc(logsRef, {
        equipment: hasReservation,
        obs: obsCheckout,
        photos: [],
        time: date.toISOString(),
        type: 'out',
        userName: user?.name,
      })
      sucessNotifCheckout()
      console.log(`Checkout feito com sucesso para ${hasReservation}`)
      setTimeout(() => {
        window.location.reload()
      }, 3000)
    } catch (error) {
      console.error('Erro ao devolver patinete no firestoreDb:', error)
      errorNotifOut()
    }
  }

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {modalOpen ? (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-10/12 md:w-3/5">
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
      ) : modalOpenCheckout ? (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-10/12 md:w-3/5">
            <h2 className="text-lg font-semibold">Check-Out</h2>
            <h3 className="mb-4">{`Patinete reservado: ${hasReservation?.toUpperCase()}`}</h3>
            <h2 className="font-medium">Observações:</h2>
            <textarea
              className="w-full h-36 border border-gray-300 rounded p-2"
              value={obsCheckout}
              onChange={(e) => setObsCheckout(e.target.value)}
              placeholder="Digite aqui suas observações sobre o patinete reservado..."
            ></textarea>
            <div className="flex justify-end mt-4">
              <Button
                variant="default"
                className="bg-red-600 hover:bg-red-700 mr-2"
                onClick={() => setModalOpenCheckout(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="default"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  devolverPatineteRealtimeDb()
                }}
              >
                Check-Out
              </Button>
            </div>
          </div>
        </div>
      ) : null}
      <>
        {hasReservation ? (
          <div className="flex flex-col items-center justify-center gap-6">
            <h1 className="text-xl font-semibold text-red-600">
              Você já possui uma reserva ativa!
            </h1>
            <Image
              width={250}
              height={250}
              src={`/assets/${hasReservation}.png`}
              alt="Patinete reservado"
              className="hover:scale-110 transition-transform duration-300"
            ></Image>
            <Button onClick={openModalCheckout} variant="destructive">
              Fazer Check-Out
            </Button>
          </div>
        ) : (
          <div className="size-full flex-col flex items-center justify-center md:p-6 ">
            <div className="flex flex-col md:flex-row w-5/6 justify-center md:justify-between items-center mb-10">
              <div>
                <h1 className="text-xl font-semibold text-green-600 mb-3 md:mb-0">
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
  )
}
