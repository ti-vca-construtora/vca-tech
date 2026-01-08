"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { useInspectionConfig } from "@/hooks/use-inspection-config";
import { useToast } from "@/hooks/use-toast";
import { addHours, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { useEffect, useMemo, useState } from "react";

interface Slot {
  id: string;
  startAt: string;
  endAt: string;
  status: "AVAILABLE" | "UNAVAILABLE" | "BOOKED" | string;
  developmentId?: string;
  maxInspectionsPerSlot?: number | null;
}

export function Calendar({
  selectedDevelopment,
}: {
  selectedDevelopment?: string;
}) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const { config } = useInspectionConfig();
  const { toast } = useToast();

  const [makeAvailableDialogOpen, setMakeAvailableDialogOpen] = useState(false);
  const [selectedCapacity, setSelectedCapacity] = useState<"1" | "2" | "3">(
    "3",
  );
  const [pendingSlot, setPendingSlot] = useState<Slot | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [editMaxDialogOpen, setEditMaxDialogOpen] = useState(false);
  const [editMaxSelectedCapacity, setEditMaxSelectedCapacity] = useState<
    "1" | "2" | "3"
  >("3");
  const [editMaxSlot, setEditMaxSlot] = useState<Slot | null>(null);
  const [editMaxLoading, setEditMaxLoading] = useState(false);

  const diasPrazo = config?.minDaysToSchedule ?? 3;
  const diasDuracao = config?.maxDaysToSchedule ?? 60;

  useEffect(() => {
    if (!selectedDevelopment) return;
    loadSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDevelopment]);

  const fetchSlots = async (): Promise<Slot[]> => {
    if (!selectedDevelopment) return [];

    const firstDateRender = new Date();
    firstDateRender.setHours(2, 0, 0, 0);
    firstDateRender.setDate(firstDateRender.getDate() + diasPrazo);

    const response = await fetch(
      // eslint-disable-next-line prettier/prettier
      `/api/vistorias/slots?fromDate=${firstDateRender.toISOString()}&developmentId=${selectedDevelopment}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // eslint-disable-next-line prettier/prettier
      },
    );

    if (!response.ok) {
      console.error("Erro ao carregar slots");
        return [];
    }

    const data = await response.json();
    console.log(data.data);
      return data.data ?? [];
    };

    const loadSlots = async () => {
      const data = await fetchSlots();
      setSlots(data);
  };

  const groupedSlots = useMemo(() => {
      const result: Record<string, Slot[]> = (slots ?? []).reduce(
        (acc, slot) => {
          const day = format(parseISO(slot.startAt), "yyyy-MM-dd");
          if (!acc[day]) acc[day] = [];
          acc[day].push(slot);
          return acc;
        },
        {} as Record<string, Slot[]>,
      );

      Object.keys(result).forEach((day) => {
        result[day] = (result[day] ?? []).sort((a, b) =>
          a.startAt.localeCompare(b.startAt),
        );
      });

      return result;
  }, [slots]);

  const getNextDays = () => {
    const days = [];
    const today = new Date();
    today.setDate(today.getDate() + diasPrazo);

    for (let i = 0; i < diasDuracao; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(format(date, "yyyy-MM-dd"));
    }

    return days;
  };

  const nextDays = getNextDays();

  const patchSlot = async (
    slotId: string,
    body: Record<string, unknown>,
  ) => {
    const response = await fetch(`/api/vistorias/slots?id=${slotId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error("Erro ao atualizar slot");
  };

  const getEffectiveMaxInspections = (slot: Slot) => {
    const value = slot.maxInspectionsPerSlot;
    if (value === 1 || value === 2 || value === 3) return value;
    return 3;
  };

  const openEditMaxDialog = (slot: Slot) => {
    setEditMaxSlot(slot);
    const effective = String(getEffectiveMaxInspections(slot)) as "1" | "2" | "3";
    setEditMaxSelectedCapacity(effective);
    setEditMaxDialogOpen(true);
  };

  const handleSaveEditMax = async () => {
    if (!editMaxSlot) return;
    const desired = Number(editMaxSelectedCapacity);
    setEditMaxLoading(true);
    try {
      await patchSlot(editMaxSlot.id, {
        maxInspectionsPerSlot: desired === 3 ? null : desired,
      });
      await loadSlots();
      toast({
        title: "Quantidade atualizada",
        description: `Vagas definidas: ${desired}.`,
      });
      setEditMaxDialogOpen(false);
      setEditMaxSlot(null);
    } catch (e) {
      console.error(e);
      toast({
        title: "Erro",
        description: "Falha ao atualizar a quantidade de vagas.",
        variant: "destructive",
      });
    } finally {
      setEditMaxLoading(false);
    }
  };

  const openMakeAvailableDialog = (slot: Slot) => {
    setPendingSlot(slot);
    setSelectedCapacity("3");
    setMakeAvailableDialogOpen(true);
  };

  const handleConfirmMakeAvailable = async () => {
    if (!pendingSlot) return;
    const desired = Number(selectedCapacity);
    setActionLoading(true);
    try {
      const patchBody: Record<string, unknown> = { status: "AVAILABLE" };

      // 1 ou 2: grava valor. 3: mantém null (não envia nada)
      if (desired === 1 || desired === 2) {
        patchBody.maxInspectionsPerSlot = desired;
      } else if (
        desired === 3 &&
        pendingSlot.maxInspectionsPerSlot !== null &&
        pendingSlot.maxInspectionsPerSlot !== undefined
      ) {
        patchBody.maxInspectionsPerSlot = null;
      }

      await patchSlot(pendingSlot.id, patchBody);
      await loadSlots();
      toast({
        title: "Horário disponibilizado",
        description: `Vagas definidas: ${desired}.`,
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Erro",
        description: "Falha ao disponibilizar o horário.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
      setMakeAvailableDialogOpen(false);
      setPendingSlot(null);
    }
  };

  const indisponibilizarSlot = async (slot: Slot) => {
    setActionLoading(true);
    try {
      await patchSlot(slot.id, {
        status: "UNAVAILABLE",
        maxInspectionsPerSlot: null,
      });

      await loadSlots();
      toast({
        title: "Horário indisponibilizado",
        description: "Vagas restauradas para o padrão.",
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Erro",
        description: "Falha ao indisponibilizar o horário.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // const getInspectionsBySlot = (startAt: string, endAt: string) => {
  //   const response = await fetch(`/api/vistorias/slots?id=${slotId}`, {
  //     method: 'PATCH',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       status: 'UNAVAILABLE',
  //     }),
  //     // eslint-disable-next-line prettier/prettier
  //   })

  //   if (!response.ok) {
  //     console.error('Erro ao disponibilizar slot')
  //     return
  //   }

  //   const data = await response.json()
  //   console.log(data.data)
  // }

  return (
    <div className="max-w-screen-sm">
      <AlertDialog
        open={makeAvailableDialogOpen}
        onOpenChange={setMakeAvailableDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disponibilizar horário</AlertDialogTitle>
            <AlertDialogDescription>
              Selecione quantas vagas deseja disponibilizar.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-3">
            <Label>Quantidade de vagas</Label>
            <RadioGroup
              value={selectedCapacity}
              onValueChange={(v) => setSelectedCapacity(v as "1" | "2" | "3")}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="cap-1" />
                <Label htmlFor="cap-1">1</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2" id="cap-2" />
                <Label htmlFor="cap-2">2</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3" id="cap-3" />
                <Label htmlFor="cap-3">3</Label>
              </div>
            </RadioGroup>
          </div>

          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setMakeAvailableDialogOpen(false);
                setPendingSlot(null);
              }}
              disabled={actionLoading}
            >
              Cancelar
            </Button>
            <Button onClick={handleConfirmMakeAvailable} disabled={actionLoading}>
              Confirmar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={editMaxDialogOpen}
        onOpenChange={(open) => {
          setEditMaxDialogOpen(open);
          if (!open) setEditMaxSlot(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vistorias agendadas:</DialogTitle>
            <DialogDescription>
              Quantidade de vistorias permitidas do horário:{" "}
              <span className="font-medium">
                {editMaxSlot ? getEffectiveMaxInspections(editMaxSlot) : "—"}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Label>Alterar quantidade</Label>
            <RadioGroup
              value={editMaxSelectedCapacity}
              onValueChange={(v) =>
                setEditMaxSelectedCapacity(v as "1" | "2" | "3")
              }
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="edit-cap-1" />
                <Label htmlFor="edit-cap-1">1</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2" id="edit-cap-2" />
                <Label htmlFor="edit-cap-2">2</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3" id="edit-cap-3" />
                <Label htmlFor="edit-cap-3">3</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setEditMaxDialogOpen(false);
                setEditMaxSlot(null);
              }}
              disabled={editMaxLoading}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveEditMax} disabled={editMaxLoading}>
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

        <div className="flex flex-col p-2 justify-center items-center rounded-lg border bg-card text-card-foreground shadow-sm w-full h-auto">
          <h1 className="font-semibold text-2xl mb-5">Agenda ativa:</h1>
          {selectedDevelopment ? (
            <div className="overflow-x-auto w-full">
              <table className="min-w-max border-collapse">
                <thead>
                  <tr>
                    {nextDays.map((day) => (
                      <th
                        key={day}
                        className="border py-2 px-2 text-center bg-gray-100"
                      >
                        {format(parseISO(day), "dd/MM", { locale: ptBR })}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 10 }, (_, rowIndex) => (
                    <tr key={rowIndex}>
                      {nextDays.map((day) => {
                        const slot = groupedSlots[day]?.[rowIndex];

                        if (!slot) {
                          return (
                            <td
                              key={day + rowIndex}
                              className="border text-center"
                            >
                              <DropdownMenu>
                                <DropdownMenuTrigger className="w-full h-full flex justify-center items-center py-4 px-3">
                                  —
                                </DropdownMenuTrigger>
                              </DropdownMenu>
                            </td>
                          );
                        }

                        return slot.status === "UNAVAILABLE" ? (
                          <td
                            key={day + rowIndex}
                            className="cursor-pointer border text-center bg-red-200 hover:bg-gray-200"
                          >
                            <DropdownMenu>
                              <DropdownMenuTrigger className="w-full h-full flex justify-center items-center py-4 px-3 outline-none focus:outline-none">
                                {`${format(addHours(parseISO(slot.startAt), 3), "HH:mm")} às ${format(addHours(parseISO(slot.endAt), 3), "HH:mm")}`} {" "}
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem
                                  onClick={() => openMakeAvailableDialog(slot)}
                                  className="cursor-pointer"
                                >
                                  Disponibilizar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        ) : slot.status === "AVAILABLE" ? (
                          <td
                            key={day + rowIndex}
                            className="cursor-pointer border text-center bg-green-200 hover:bg-gray-200"
                          >
                            <DropdownMenu>
                              <DropdownMenuTrigger className="w-full h-full flex justify-center items-center py-4 px-3 outline-none focus:outline-none">
                                {`${format(addHours(parseISO(slot.startAt), 3), "HH:mm")} às ${format(addHours(parseISO(slot.endAt), 3), "HH:mm")}`} {" "}
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem
                                  onClick={() => openEditMaxDialog(slot)}
                                  className="cursor-pointer"
                                >
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => indisponibilizarSlot(slot)}
                                  className="cursor-pointer"
                                >
                                  Indisponibilizar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        ) : slot.status === "BOOKED" ? (
                          <td
                            key={day + rowIndex}
                            className="cursor-pointer border text-center bg-blue-200 hover:bg-gray-200"
                            // onClick={() => getInspectionsBySlot(slot.startAt, slot.endAt)}
                          >
                            <button
                              type="button"
                              onClick={() => openEditMaxDialog(slot)}
                              className="w-full h-full flex justify-center items-center py-4 px-3"
                            >
                              {`${format(addHours(parseISO(slot.startAt), 3), "HH:mm")} às ${format(addHours(parseISO(slot.endAt), 3), "HH:mm")}`} {" "}
                            </button>
                          </td>
                        ) : null;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>Selecione um empreendimento</p>
          )}
        </div>
    </div>
  );
}
