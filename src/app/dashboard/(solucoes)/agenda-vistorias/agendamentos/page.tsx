/* eslint-disable prettier/prettier */
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addHours, format, isWithinInterval, parseISO } from "date-fns";
import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";

interface Inspection {
  id: string;
  status: string;
  inspectionSlot: {
    startAt: string | Date;
    endAt: string | Date;
    status: string;
    developmentId: string;
  };
  unitId: string;
  unit: {
    unit: string;
    developmentId: string;
  };
  developmentName?: string; // Nome do empreendimento carregado posteriormente
}

interface Development {
  id: string;
  name: string;
  isActive: boolean;
}

const ScheduledInspectionsPage = () => {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [developments, setDevelopments] = useState<Development[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);
  const [selectedDevelopment, setSelectedDevelopment] = useState<string>("ALL");
  const [startDate, setStartDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [endDate, setEndDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [cancelModalOpen, setCancelModalOpen] = useState<boolean>(false);
  const [inspectionToCancel, setInspectionToCancel] = useState<string | null>(
    null,
  );

  const sucessNotif = () =>
    toast.success("Registro registrado!", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });

  const errorNotif = () =>
    toast.error("Falha no registro.", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });

  const handleCancelInspection = async () => {
    if (!inspectionToCancel) return;

    try {
      const response = await fetch(
        `/api/vistorias/inspections?id=${inspectionToCancel}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Erro ao cancelar agendamento");
      }

      toast.success("Agendamento cancelado com sucesso!");
      setCancelModalOpen(false);
      setInspectionToCancel(null);

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Erro ao cancelar agendamento:", error);
      toast.error("Erro ao cancelar agendamento");
    }
  };

  const openCancelModal = (inspectionId: string) => {
    setInspectionToCancel(inspectionId);
    setCancelModalOpen(true);
  };

  const handleExportPDF = async () => {
    if (isGeneratingPDF) return; // Previne cliques duplicados

    setIsGeneratingPDF(true);
    try {
      const response = await fetch("/api/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "agendamentos",
          data: {
            inspections: filteredInspections,
            filters: {
              startDate,
              endDate,
              development:
                selectedDevelopment === "ALL"
                  ? "Todos os empreendimentos"
                  : selectedDevelopment,
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao gerar relatório");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `agendamentos-${format(new Date(), "dd-MM-yyyy-HHmmss")}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Relatório gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      toast.error("Erro ao gerar relatório");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  useEffect(() => {
    const fetchDevelopments = async () => {
      try {
        const response = await fetch(
          "/api/vistorias/empreendimentos?page=1&pageSize=500&isActive=1",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error("Erro ao carregar empreendimentos");
        }

        const data = await response.json();
        setDevelopments(data.data);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchInspections = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          "/api/vistorias/inspections?page=1&pageSize=999999",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            // eslint-disable-next-line prettier/prettier
          },
        );

        if (!response.ok) {
          throw new Error("Erro ao carregar vistorias");
        }

        const data = await response.json();
        console.log("[AGENDAMENTOS] Dados brutos da API:", data);

        const scheduledInspections = data.data.filter(
          // eslint-disable-next-line prettier/prettier
          (item: Inspection) =>
            item.status === "SCHEDULED" ||
            item.status === "COMPLETED" ||
            // eslint-disable-next-line prettier/prettier
            item.status === "RESCHEDULED",
        );

        console.log(
          "[AGENDAMENTOS] Inspeções filtradas:",
          scheduledInspections,
        );
        console.log(
          "[AGENDAMENTOS] Amostra da primeira inspeção:",
          scheduledInspections[0],
        );

        // Buscar nomes dos empreendimentos para cada inspeção
        const inspectionsWithDevelopmentNames = await Promise.all(
          scheduledInspections.map(async (inspection: Inspection) => {
            const developmentId = inspection.unit.developmentId;
            console.log(
              `[AGENDAMENTOS] Buscando nome do empreendimento ${developmentId}...`,
            );

            try {
              const devResponse = await fetch(
                `/api/vistorias/empreendimentos/development?id=${developmentId}`,
              );

              if (devResponse.ok) {
                const devData = await devResponse.json();
                console.log(
                  `[AGENDAMENTOS] Empreendimento ${developmentId}:`,
                  devData,
                );
                return {
                  ...inspection,
                  developmentName: devData.data?.name || "Nome não disponível",
                };
              } else {
                console.error(
                  `[AGENDAMENTOS] Erro ao buscar empreendimento ${developmentId}:`,
                  devResponse.status,
                );
                return {
                  ...inspection,
                  developmentName: "Nome não disponível",
                };
              }
            } catch (error) {
              console.error(
                `[AGENDAMENTOS] Erro ao buscar empreendimento ${developmentId}:`,
                error,
              );
              return {
                ...inspection,
                developmentName: "Nome não disponível",
              };
            }
          }),
        );

        console.log(
          "[AGENDAMENTOS] Inspeções com nomes dos empreendimentos:",
          inspectionsWithDevelopmentNames,
        );

        setInspections(inspectionsWithDevelopmentNames);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDevelopments();
    fetchInspections();
  }, []);

  const formatTime = (date: string | Date) => {
    if (date instanceof Date) {
      return format(date, "HH:mm");
    }
    if (typeof date === "string") {
      return format(parseISO(date), "HH:mm");
    }
    return "";
  };

  const normalizeDate = (date: string | Date): Date => {
    let dateObj: Date;

    if (date instanceof Date) {
      dateObj = date;
    } else {
      dateObj = parseISO(date);
    }

    // Adiciona 3 horas para ajuste de fuso horário
    return addHours(dateObj, 3);
  };

  const filteredInspections = inspections.filter((inspection) => {
    const inspectionDate = normalizeDate(inspection.inspectionSlot.startAt);

    // Filtro de empreendimento
    if (selectedDevelopment !== "ALL") {
      if (inspection.developmentName !== selectedDevelopment) {
        return false;
      }
    }

    // Filtro de data (intervalo de/até)
    const start = parseISO(startDate + "T00:00:00");
    const end = parseISO(endDate + "T23:59:59");

    return isWithinInterval(inspectionDate, { start, end });
  });

  const renderInspections = () => {
    if (isLoading) {
      return <div className="text-center py-4">Carregando...</div>;
    }

    if (filteredInspections.length === 0) {
      return (
        <div className="text-center py-4 text-muted-foreground">
          Nenhuma vistoria agendada para este dia.
        </div>
      );
    }

    const atualizarCheckUnidade = async (id: string) => {
      const response = await fetch(`/api/vistorias/unidades?id=${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          validations: ["FINANCIAL", "QUALITY"],
        }),
      });

      if (!response.ok) {
        console.error("Erro ao atualizar agendamento.");
        errorNotif();
        return;
      }

      const data = await response.json();
      console.log(data);
      sucessNotif();
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    };

    const atualizarVistoria = async (
      id: string,
      status: string,
      // eslint-disable-next-line prettier/prettier
      unitId: string,
    ) => {
      console.log("[ATUALIZAR VISTORIA] Iniciando atualização...");
      console.log("[ATUALIZAR VISTORIA] ID:", id);
      console.log("[ATUALIZAR VISTORIA] Status:", status);
      console.log("[ATUALIZAR VISTORIA] UnitId:", unitId);

      try {
        const response = await fetch(`/api/vistorias/inspections?id=${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        });

        console.log("[ATUALIZAR VISTORIA] Response status:", response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error("[ATUALIZAR VISTORIA] Erro na resposta:", errorData);
          errorNotif();
          return;
        }

        const data = await response.json();
        console.log("[ATUALIZAR VISTORIA] Resposta sucesso:", data);

        if (status === "COMPLETED") {
          sucessNotif();
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        } else if (status === "RESCHEDULED") {
          atualizarCheckUnidade(unitId);
        }
      } catch (error) {
        console.error("[ATUALIZAR VISTORIA] Exception:", error);
        errorNotif();
      }
    };

    return filteredInspections.map((inspection) => {
      const startDate = normalizeDate(inspection.inspectionSlot.startAt);
      const endDate = normalizeDate(inspection.inspectionSlot.endAt);

      console.log("[AGENDAMENTOS RENDER] Inspection:", inspection);
      console.log(
        "[AGENDAMENTOS RENDER] Development Name:",
        inspection.developmentName,
      );

      return (
        <div
          key={inspection.id}
          className="mt-2 flex py-2 px-4 sm:flex-row flex-col justify-between items-center rounded-lg border bg-card text-card-foreground shadow-sm w-full h-auto"
        >
          <div>
            <h2 className="font-semibold">
              {inspection.developmentName || "Nome não disponível"}
            </h2>
            <p>{`Unidade: ${inspection.unit.unit}`}</p>
            <p className="text-sm text-muted-foreground">
              {`Horário: ${formatTime(startDate)} às ${formatTime(endDate)}`}
            </p>
          </div>

          {inspection.status === "COMPLETED" ? (
            <div>
              <Badge
                variant={"outline"}
                className="flex items-center gap-2 justify-center border-green-500 bg-green-100"
              >
                <span className="text-xl m-0 p-0 text-green-500">•</span>
                <p className="text-sm font-medium">Entregue</p>
              </Badge>
            </div>
          ) : inspection.status === "RESCHEDULED" ? (
            <div>
              <Badge
                variant={"outline"}
                className="flex items-center gap-2 justify-center border-yellow-500 bg-yellow-100"
              >
                <span className="text-xl m-0 p-0 text-yellow-500">•</span>
                <p className="text-sm font-medium">Recusado</p>
              </Badge>
            </div>
          ) : (
            <div>
              <Badge
                variant={"outline"}
                className="flex items-center gap-2 justify-center"
              >
                <span className="text-xl m-0 p-0">•</span>
                <p className="text-sm font-medium">Agendado</p>
              </Badge>
            </div>
          )}

          <div className="sm:mt-0 mt-3 flex gap-2 items-center">
            <Button
              variant="destructive"
              size="icon"
              onClick={() => openCancelModal(inspection.id)}
            >
              <X className="h-4 w-4" />
            </Button>
            <DialogTrigger className="w-full h-full flex justify-center items-center py-4 px-3">
              <Button variant="outline">Registrar</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registro de vistoria</DialogTitle>
                <DialogDescription>
                  Informe se a unidade foi aceita ou recusada pelo cliente.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 mt-4">
                <Button
                  variant="outline"
                  className="bg-azul-claro-vca text-white"
                  onClick={() =>
                    atualizarVistoria(
                      inspection.id,
                      "COMPLETED",
                      // eslint-disable-next-line prettier/prettier
                      inspection.unitId,
                    )
                  }
                >
                  Entregue
                </Button>
                <Button
                  variant="destructive"
                  onClick={() =>
                    atualizarVistoria(
                      inspection.id,
                      "RESCHEDULED",
                      // eslint-disable-next-line prettier/prettier
                      inspection.unitId,
                    )
                  }
                >
                  Recusado
                </Button>
              </div>
            </DialogContent>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="size-full p-4">
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
      {/* Modal de Cancelamento */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar cancelamento</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar este agendamento? Esta ação não
              pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-4 mt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setCancelModalOpen(false);
                setInspectionToCancel(null);
              }}
            >
              Voltar
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleCancelInspection}
            >
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Registro */}
      <Dialog>
        <Card className="size-full">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Vistorias Agendadas</CardTitle>
                <CardDescription className="mt-2">
                  Visualize as vistorias agendadas por período
                </CardDescription>
              </div>
              <Button
                onClick={handleExportPDF}
                disabled={filteredInspections.length === 0 || isGeneratingPDF}
                className="flex items-center gap-2 bg-azul-claro-vca text-white hover:bg-azul-vca"
              >
                <Download className="h-4 w-4" />
                {isGeneratingPDF ? "Gerando..." : "Exportar Relatório"}
              </Button>
            </div>

            {/* Filtros */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Filtro de Empreendimento */}
              <div className="space-y-2">
                <Label htmlFor="development">Empreendimento</Label>
                <Select
                  value={selectedDevelopment}
                  onValueChange={setSelectedDevelopment}
                  disabled={isLoading}
                >
                  <SelectTrigger id="development">
                    <SelectValue placeholder="Selecione o empreendimento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos</SelectItem>
                    {developments.map((dev) => (
                      <SelectItem key={dev.id} value={dev.name}>
                        {dev.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro Data Inicial */}
              <div className="space-y-2">
                <Label htmlFor="startDate">Data inicial</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              {/* Filtro Data Final */}
              <div className="space-y-2">
                <Label htmlFor="endDate">Data final</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="sm:max-h-90 max-h-96 overflow-y-scroll no-scrollbar">
              {renderInspections()}
            </div>
          </CardContent>
        </Card>
      </Dialog>
    </div>
  );
};

export default ScheduledInspectionsPage;
