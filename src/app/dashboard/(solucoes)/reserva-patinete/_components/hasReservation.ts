/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { rtdb } from "@/lib/firebase";
import { get, ref } from "firebase/database";

export const checkUserHasReservation = async (
  userLoggedId: string | null,
): Promise<string | null> => {
  if (!userLoggedId) return null;

  const equipmentsRef = ref(rtdb, "equipments");

  try {
    const snapshot = await get(equipmentsRef);
    const data = snapshot.val();

    const entry = Object.entries(data || {}).find(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ([_, equip]: any) => equip.currentUser === userLoggedId,
    );

    // Retorna o ID do equipamento (ex: "vca001")
    return entry ? entry[0] : null;
  } catch (error) {
    console.error("Erro ao verificar reserva do usuário:", error);
    return null;
  }
};
