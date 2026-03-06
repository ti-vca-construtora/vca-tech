"use client";

import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { db, rtdb } from "@/lib/firebase";
import { get, ref, set } from "firebase/database";
import { addDoc, collection } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { Carousel } from "./_components/Carousel";
import { checkUserHasReservation } from "./_components/hasReservation";

export default function ReservarPatinete() {
  const { user } = useUser();

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [availableCount, setAvailableCount] = useState(0);
  const [userLoggedId, setUserLoggedId] = useState<string | null>(null);
  const [userLoggedName, setUserLoggedName] = useState<string | null>(null);
  const [hasReservation, setHasReservation] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOpenCheckout, setModalOpenCheckout] = useState(false);
  const [obsCheckin, setObsCheckin] = useState<string>("");
  const [obsCheckout, setObsCheckout] = useState<string>("");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [activeAccessCode, setActiveAccessCode] = useState<string | null>(null);
  const [showActiveCodeModal, setShowActiveCodeModal] = useState(false);

  const sucessNotif = () =>
    toast.success("Reserva realizada!", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });

  const sucessNotifCheckout = () =>
    toast.success("Check-Out realizado!", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });

  const warnNotif = () =>
    toast.warn("Tente novamente mais tarde.", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });

  const warnNotifUser = () =>
    toast.warn("Erro! Procure o TECH.", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });

  const fridayDay = () =>
    toast.warn(
      "OS PATINETES NÃO PODEM SER LEVADOS PARA CASA NAS SEXTAS-FEIRAS",
      {
        position: "top-right",
        autoClose: 20000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        // eslint-disable-next-line prettier/prettier
      },
    );

  const errorNotif = () =>
    toast.error("Falha na reserva.", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });

  const errorNotifOut = () =>
    toast.error("Falha no check-out.", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });

  const warnMissingCode = () =>
    toast.warn("Senha não encontrada para esta reserva.", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });

  const generateAccessCode = (): string => {
    const BLOCKED = ["8001", "8002", "8003", "8004", "8005"];
    let code: string;
    do {
      code = Math.floor(1000 + Math.random() * 9000).toString();
    } while (BLOCKED.includes(code));
    return code;
  };

  const equipmentNames = ["vca001", "vca002", "vca003", "vca004", "vca005"];
  const selectedEquipmentName =
    selectedIndex !== null ? equipmentNames[selectedIndex] : null;

  const openModal = async () => {
    if (!userLoggedId) return;

    // se hoje for sexta-feira, warn toast
    const today = new Date();
    // console.log('Hoje é:', today.getDay())
    if (today.getDay() === 5) {
      fridayDay();
    }

    // Verifica se o usuário está no target_limits
    const userLimitRef = ref(rtdb, `target_limits/${userLoggedId}`);
    const snapshot = await get(userLimitRef);

    if (snapshot.exists()) {
      const limitData = snapshot.val();
      const reserveLimit = new Date(limitData.reserveLimit);
      const now = new Date();

      if (now < reserveLimit) {
        toast.error(
          `Você só pode reservar novamente após ${reserveLimit.toLocaleString()}`,
          {
            position: "top-right",
            autoClose: 5000,
            // eslint-disable-next-line prettier/prettier
          },
        );
        return;
      }
    }

    setModalOpen(true);
  };

  const openModalCheckout = () => {
    setModalOpenCheckout(true);
  };

  const checkAndAutoCheckout = async () => {
    if (!hasReservation || !userLoggedId) return;

    const equipmentRef = ref(rtdb, `equipments/${hasReservation}`);
    const snapshot = await get(equipmentRef);
    const equipmentData = snapshot.val();

    if (equipmentData && equipmentData.reservedUntil) {
      const reservedUntil = new Date(equipmentData.reservedUntil);
      const now = new Date();

      if (now > reservedUntil) {
        // Faz checkout automático
        await set(equipmentRef, {
          available: true,
          currentUser: "",
          reservedUntil: "",
          accessCode: "",
        });

        // Registra no Firestore
        const date = new Date();
        date.setHours(date.getHours() - 3);
        const logsRef = collection(db, "logs");

        await addDoc(logsRef, {
          equipment: hasReservation,
          obs: "CHECKOUT AUTOMÁTICO - LIMITE EXPIRADO",
          photos: [],
          time: date.toISOString(),
          type: "out",
          userName: user?.name,
        });

        // Remove o limite do usuárioopenModal
        const userLimitRef = ref(rtdb, `target_limits/${userLoggedId}`);
        await set(userLimitRef, null);

        setHasReservation(null);
        setActiveAccessCode(null);
        window.location.reload();
      }
    }
  };

  useEffect(() => {
    if (user) {
      setUserLoggedId(user.id);
      setUserLoggedName(user.name ?? null);
    }

    const checkReservations = async () => {
      await checkUserReservation();
      await checkAndAutoCheckout();
    };

    checkReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex, user]);

  const checkUserReservation = async () => {
    if (!userLoggedId) return;

    const reservation = await checkUserHasReservation(userLoggedId);
    if (reservation) {
      setHasReservation(reservation);

      const equipmentRef = ref(rtdb, `equipments/${reservation}`);
      const snapshot = await get(equipmentRef);
      const equipmentData = snapshot.val();
      setActiveAccessCode(equipmentData?.accessCode ?? null);
    } else {
      setHasReservation(null);
      setActiveAccessCode(null);
    }
  };

  const showReservationCode = async () => {
    if (!hasReservation) return;

    const equipmentRef = ref(rtdb, `equipments/${hasReservation}`);
    const snapshot = await get(equipmentRef);
    const equipmentData = snapshot.val();
    const reservationCode = equipmentData?.accessCode;

    if (!reservationCode) {
      warnMissingCode();
      return;
    }

    setActiveAccessCode(reservationCode);
    setShowActiveCodeModal(true);
  };

  const reservarPatineteRealtimeDb = async () => {
    if (!userLoggedId || !userLoggedName) {
      warnNotifUser();
      return;
    }

    const prazoDevolucao = new Date();
    prazoDevolucao.setHours(prazoDevolucao.getHours() + 12 - 3);
    const reservedUntil = prazoDevolucao.toISOString();

    const limiteReserva = new Date();
    limiteReserva.setHours(limiteReserva.getHours() + 48 - 3);
    const reserveLimit = limiteReserva.toISOString();

    const equipmentIds = ["vca001", "vca002", "vca003", "vca004", "vca005"];
    const selectedEquipmentId =
      selectedIndex !== null ? equipmentIds[selectedIndex] : null;

    const equipmentRef = ref(rtdb, `equipments/${selectedEquipmentId}`);
    const userLimitRef = ref(rtdb, `target_limits/${userLoggedId}`);

    const accessCode = generateAccessCode();

    try {
      await set(equipmentRef, {
        available: false,
        currentUser: userLoggedId,
        reservedUntil,
        accessCode,
      });

      await set(userLimitRef, {
        userId: userLoggedId,
        reserveLimit,
      });

      setGeneratedCode(accessCode);
      reservarPatineteFirestoreDb(accessCode);
    } catch (error) {
      console.error("Erro ao reservar patinete na realtimeDb:", error);
      warnNotif();
    }
  };

  const reservarPatineteFirestoreDb = async (accessCode: string) => {
    const date = new Date();
    date.setHours(date.getHours() - 3);

    const equipmentIds = ["vca001", "vca002", "vca003", "vca004", "vca005"];
    const selectedEquipmentId =
      selectedIndex !== null ? equipmentIds[selectedIndex] : null;

    const logsRef = collection(db, "logs");

    try {
      await addDoc(logsRef, {
        equipment: selectedEquipmentId,
        obs: obsCheckin,
        accessCode,
        photos: [],
        time: date.toISOString(),
        type: "in",
        userName: user?.name,
      });
      console.log(`Reserva feita com sucesso para ${selectedEquipmentId}`);
      sucessNotif();
      setShowCodeModal(true);
    } catch (error) {
      console.error("Erro ao reservar patinete no firestoreDb:", error);
      errorNotif();
    }
  };

  const devolverPatineteRealtimeDb = async () => {
    if (!userLoggedId || !userLoggedName) {
      alert("Erro ao devolver. Procure o setor TECH.");
      return;
    }

    const equipmentRef = ref(rtdb, `equipments/${hasReservation}`);

    try {
      await set(equipmentRef, {
        available: true,
        currentUser: "",
        reservedUntil: "",
        accessCode: "",
      });
      setActiveAccessCode(null);
      devolverPatineteFirestoreDb();
    } catch (error) {
      console.error("Erro ao devolver patinete no realtimeDb:", error);
      errorNotifOut();
    }
  };

  const devolverPatineteFirestoreDb = async () => {
    const date = new Date();
    date.setHours(date.getHours() - 3);

    const logsRef = collection(db, "logs");

    try {
      await addDoc(logsRef, {
        equipment: hasReservation,
        obs: obsCheckout,
        photos: [],
        time: date.toISOString(),
        type: "out",
        userName: user?.name,
      });
      sucessNotifCheckout();
      console.log(`Checkout feito com sucesso para ${hasReservation}`);
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      console.error("Erro ao devolver patinete no firestoreDb:", error);
      errorNotifOut();
    }
  };

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
      {showActiveCodeModal && activeAccessCode ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="flex w-10/12 flex-col items-center rounded-lg bg-white p-8 shadow-md md:w-2/5">
            <div className="mb-4 rounded-full bg-emerald-100 p-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-center text-xl font-bold text-gray-800">
              Sua senha de retirada
            </h2>
            <p className="mb-4 text-center text-gray-600">
              Patinete <strong>{hasReservation?.toUpperCase()}</strong>
            </p>
            <div className="mb-4 rounded-lg bg-gray-100 px-8 py-4">
              <span className="font-mono text-4xl font-bold tracking-[0.5em] text-gray-900">
                {activeAccessCode}
              </span>
            </div>
            <p className="mb-6 text-center text-sm text-gray-500">
              Digite essa senha no teclado da caixa de chaves.
            </p>
            <Button
              variant="default"
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              onClick={() => setShowActiveCodeModal(false)}
            >
              Fechar
            </Button>
          </div>
        </div>
      ) : null}
      {showCodeModal && generatedCode ? (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-md w-10/12 md:w-2/5 flex flex-col items-center">
            <div className="bg-green-100 rounded-full p-4 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Reserva confirmada!</h2>
            <p className="text-gray-600 mb-4 text-center">
              Use a senha abaixo no dispositivo para retirar a chave do patinete <strong>{selectedEquipmentName?.toUpperCase()}</strong>
            </p>
            <div className="bg-gray-100 rounded-lg px-8 py-4 mb-4">
              <span className="text-4xl font-mono font-bold tracking-[0.5em] text-gray-900">
                {generatedCode}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-6 text-center">
              Digite essa senha no teclado da caixa de chaves para liberar a chave do seu patinete.
            </p>
            <Button
              variant="default"
              className="bg-green-600 hover:bg-green-700 w-full"
              onClick={() => {
                setShowCodeModal(false);
                setGeneratedCode(null);
                setModalOpen(false);
                window.location.reload();
              }}
            >
              Entendi
            </Button>
          </div>
        </div>
      ) : modalOpen ? (
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
                variant="destructive"
                className="mr-2"
                onClick={() => setModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="default"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  reservarPatineteRealtimeDb();
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
                  devolverPatineteRealtimeDb();
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
          <div className="flex flex-col items-center justify-center gap-6 p-8">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mb-2">
              <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h1 className="text-lg font-bold text-slate-800">
              Reserva ativa
            </h1>
            <p className="text-sm text-slate-500">Você já possui o patinete <span className="font-semibold text-slate-700">{hasReservation?.toUpperCase()}</span> reservado.</p>
            <Image
              width={220}
              height={220}
              src={`/assets/${hasReservation}.png`}
              alt="Patinete reservado"
              className="hover:scale-105 transition-transform duration-500"
            />
            <div className="flex flex-col md:flex-row gap-3 items-center">
              <Button
                onClick={showReservationCode}
                variant="outline"
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300"
              >
                Mostrar senha
              </Button>
              <Button onClick={openModalCheckout} className="bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-200">
                Fazer Check-Out
              </Button>
            </div>
          </div>
        ) : (
          <div className="size-full flex-col flex items-center justify-start p-6 md:p-10 relative bg-gradient-to-br from-slate-50 via-white to-emerald-50/40">
            {/* Header section */}
            <div className="flex flex-col md:flex-row w-full max-w-4xl justify-between items-center mb-8 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-800">
                    Reserva de Patinetes
                  </h1>
                  <p className="text-sm text-slate-500">
                    <span className="font-semibold text-emerald-600">{availableCount}</span> disponíveis agora
                  </p>
                </div>
              </div>
              <Link href="/dashboard/reserva-patinete/historico">
                <Button
                  variant="outline"
                  className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300"
                >
                  Histórico de reservas
                </Button>
              </Link>
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
  );
}
