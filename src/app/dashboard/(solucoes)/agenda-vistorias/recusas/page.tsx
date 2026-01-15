/* eslint-disable prettier/prettier */
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";

type ValidationType = "QUALITY" | "RELATIONSHIP" | "FINANCIAL";

type Unidade = {
  id: string;
  unit: string;
  isEnabled: boolean;
  validations: ValidationType[];
  developmentId: string;
  enterpriseName: string;
  customerName?: string;
};

type Empreendimento = {
  id: string;
  name: string;
  isActive: boolean;
  units: Unidade[];
};

type Inspection = {
  id: string;
  status: string;
  unitId: string;
  inspectionSlot?: {
    startAt?: string | Date;
  };
};

const UnidadesComReagendamento = () => {
  const [enterprises, setEnterprises] = useState<Empreendimento[]>([]);
  const [selectedEnterprise, setSelectedEnterprise] = useState<string>("TODOS");
  const [units, setUnits] = useState<Unidade[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [startDate, setStartDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [endDate, setEndDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const filters = {
    financial: false,
    quality: false,
    relationship: false,
  };
  const [modifiedUnits, setModifiedUnits] = useState<
    Record<string, ValidationType[]>
  >({});
  const [isSaving, setIsSaving] = useState(false);

  const toastConfig = {
    position: "top-right" as const,
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
  };

  const errorNotifPatch = () =>
    toast.error("Falha na atualização.", toastConfig);
  const sucessNotifPatch = () =>
    toast.success("Atualização realizada.", toastConfig);

  const getEmpreendimentos = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "/api/vistorias/empreendimentos?page=1&pageSize=200&isActive=1",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Erro ao carregar empreendimentos ativos");
      }

      const data = await response.json();
      setEnterprises(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getInspections = async () => {
    try {
      const response = await fetch(
        "/api/vistorias/inspections?page=1&pageSize=999999",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Erro ao carregar inspeções");
      }

      const data = await response.json();
      setInspections(data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const normalizeDate = (date: string | Date): Date => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return addHours(dateObj, 3);
  };

  const getSelectedEnterpriseLabel = () => {
    if (selectedEnterprise === "TODOS") return "Todos";
    return (
      enterprises.find((e) => e.id === selectedEnterprise)?.name ||
      selectedEnterprise
    );
  };

  const handleExportPDF = async () => {
    if (isGeneratingPDF) return;

    setIsGeneratingPDF(true);
    try {
      const response = await fetch("/api/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "recusas",
          data: {
            units: exportUnits,
            filters: {
              startDate,
              endDate,
              enterprise: getSelectedEnterpriseLabel(),
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
      a.download = `recusas-${format(new Date(), "dd-MM-yyyy-HHmmss")}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Relatório gerado com sucesso!", toastConfig);
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      toast.error("Erro ao gerar relatório", toastConfig);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const getUnitsByEnterprise = (enterpriseId: string) => {
    if (enterpriseId === "TODOS") {
      const allUnits: Unidade[] = [];
      enterprises.forEach((emp) => {
        if (emp.units) {
          allUnits.push(
            ...emp.units.map((u) => ({
              ...u,
              enterpriseName: emp.name,
            })),
          );
        }
      });
      return allUnits;
    } else {
      const enterprise = enterprises.find((emp) => emp.id === enterpriseId);
      return (
        enterprise?.units?.map((u) => ({
          ...u,
          enterpriseName: enterprise.name,
        })) || []
      );
    }
  };

  useEffect(() => {
    getEmpreendimentos();
    getInspections();
  }, []);

  useEffect(() => {
    if (enterprises.length > 0) {
      const units = getUnitsByEnterprise(selectedEnterprise);
      setUnits(units);
      setModifiedUnits({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEnterprise, enterprises]);

  const handleEnterpriseChange = (value: string) => {
    setSelectedEnterprise(value);
  };

  const hasValidation = (unit: Unidade, validation: ValidationType) => {
    if (modifiedUnits[unit.id]) {
      return modifiedUnits[unit.id].includes(validation);
    }
    return unit.validations.includes(validation);
  };

  const handleCheckboxChange = (
    unit: Unidade,
    validation: ValidationType,

    checked: boolean,
  ) => {
    setModifiedUnits((prev) => {
      const currentValidations = prev[unit.id] || unit.validations;
      const updatedValidations = checked
        ? [...currentValidations, validation]
        : currentValidations.filter((v) => v !== validation);

      return {
        ...prev,
        [unit.id]: updatedValidations,
      };
    });
  };

  const handleSaveChanges = async () => {
    if (Object.keys(modifiedUnits).length === 0) return;

    setIsSaving(true);
    try {
      for (const [unitId, validations] of Object.entries(modifiedUnits)) {
        const response = await fetch(`/api/vistorias/unidades?id=${unitId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ validations }),
        });

        if (!response.ok) {
          errorNotifPatch();
          throw new Error(`Erro ao atualizar unidade ${unitId}`);
        }
      }

      setUnits((prevUnits) =>
        prevUnits.map((unit) =>
          modifiedUnits[unit.id]
            ? { ...unit, validations: modifiedUnits[unit.id] }
            : unit,
        ),
      );

      setModifiedUnits({});
      sucessNotifPatch();
    } catch (error) {
      console.error("Erro ao salvar alterações:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const baseFilteredUnits = units.filter((unit) => {
    const startRaw = parseISO(startDate + "T00:00:00");
    const endRaw = parseISO(endDate + "T23:59:59");
    const start = startRaw <= endRaw ? startRaw : endRaw;
    const end = startRaw <= endRaw ? endRaw : startRaw;

    const hasFinancial = unit.validations.includes("FINANCIAL");
    const hasQuality = unit.validations.includes("QUALITY");
    const hasRelationship = unit.validations.includes("RELATIONSHIP");

    if (!hasFinancial || !hasQuality || hasRelationship) {
      return false;
    }

    const hasRescheduled = inspections.some((inspection) => {
      if (inspection.unitId !== unit.id) return false;
      if (inspection.status !== "RESCHEDULED") return false;

      const slotDate = inspection.inspectionSlot?.startAt;
      if (!slotDate) return true; // se não vier data, considera (fallback)

      const inspectionDate = normalizeDate(slotDate);
      return isWithinInterval(inspectionDate, { start, end });
    });

    return hasRescheduled;
  });

  const filteredUnits = baseFilteredUnits.filter((unit) => {
    const unitValidations = modifiedUnits[unit.id] || unit.validations;

    if (!filters.financial && !filters.quality && !filters.relationship) {
      return true;
    }

    const matches = [];
    if (filters.financial) matches.push(unitValidations.includes("FINANCIAL"));
    if (filters.quality) matches.push(unitValidations.includes("QUALITY"));
    if (filters.relationship)
      matches.push(unitValidations.includes("RELATIONSHIP"));

    return matches.length > 0 && matches.every((m) => m);
  });

  const exportUnits = filteredUnits.map((unit) => {
    const startRaw = parseISO(startDate + "T00:00:00");
    const endRaw = parseISO(endDate + "T23:59:59");
    const start = startRaw <= endRaw ? startRaw : endRaw;
    const end = startRaw <= endRaw ? endRaw : startRaw;

    const unitRescheduled = inspections
      .filter((inspection) => {
        if (inspection.unitId !== unit.id) return false;
        if (inspection.status !== "RESCHEDULED") return false;
        const slotDate = inspection.inspectionSlot?.startAt;
        if (!slotDate) return false;
        const inspectionDate = normalizeDate(slotDate);
        return isWithinInterval(inspectionDate, { start, end });
      })
      .sort((a, b) => {
        const aTime = a.inspectionSlot?.startAt
          ? normalizeDate(a.inspectionSlot.startAt).getTime()
          : 0;
        const bTime = b.inspectionSlot?.startAt
          ? normalizeDate(b.inspectionSlot.startAt).getTime()
          : 0;
        return bTime - aTime;
      });

    const lastRescheduledAt = unitRescheduled[0]?.inspectionSlot?.startAt
      ? normalizeDate(unitRescheduled[0].inspectionSlot.startAt).toISOString()
      : null;

    return {
      id: unit.id,
      unit: unit.unit,
      enterpriseName: unit.enterpriseName,
      customerName: unit.customerName,
      lastRescheduledAt,
    };
  });

  const renderUnitCards = () => {
    if (loading) {
      return <div className="text-center py-4">Carregando unidades...</div>;
    }

    if (filteredUnits.length === 0) {
      return <div className="text-center py-4">Nenhuma unidade encontrada</div>;
    }

    return filteredUnits.map((unit) => (
      <div key={unit.id} className="mt-4">
        <Card className="flex flex-row items-center justify-between">
          <CardHeader>
            <CardTitle>{unit.enterpriseName}</CardTitle>
            <CardDescription>{unit.unit}</CardDescription>
          </CardHeader>
          <div className="mr-6">
            <div className="flex items-center space-x-2 my-2">
              <Checkbox
                disabled
                checked={hasValidation(unit, "FINANCIAL")}
                id={`financial-${unit.id}`}
                onCheckedChange={(checked) =>
                  handleCheckboxChange(unit, "FINANCIAL", checked as boolean)
                }
              />
              <label
                htmlFor={`financial-${unit.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Financeiro
              </label>
            </div>
            <div className="flex items-center space-x-2 my-2">
              <Checkbox
                disabled
                checked={hasValidation(unit, "QUALITY")}
                id={`quality-${unit.id}`}
                onCheckedChange={(checked) =>
                  handleCheckboxChange(unit, "QUALITY", checked as boolean)
                }
              />
              <label
                htmlFor={`quality-${unit.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Qualidade
              </label>
            </div>
            <div className="flex items-center space-x-2 my-2">
              <Checkbox
                checked={hasValidation(unit, "RELATIONSHIP")}
                id={`relationship-${unit.id}`}
                onCheckedChange={(checked) =>
                  handleCheckboxChange(unit, "RELATIONSHIP", checked as boolean)
                }
              />
              <label
                htmlFor={`relationship-${unit.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Relacionamento
              </label>
            </div>
          </div>
        </Card>
      </div>
    ));
  };

  return (
    <div className="w-full p-10">
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold">Gerenciar recusas</h1>
          <p className="text-sm text-muted-foreground">
            Unidades com vistoria recusada (reagendamento)
          </p>
        </div>
        <Button
          onClick={handleExportPDF}
          disabled={filteredUnits.length === 0 || isGeneratingPDF}
          className="flex items-center gap-2 bg-azul-claro-vca text-white hover:bg-azul-vca"
        >
          <Download className="h-4 w-4" />
          {isGeneratingPDF ? "Gerando..." : "Exportar Relatório"}
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>Empreendimento</Label>
          <Select
            value={selectedEnterprise}
            onValueChange={handleEnterpriseChange}
            disabled={loading}
          >
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="SELECIONE O EMPREENDIMENTO" />
            </SelectTrigger>
            <SelectContent className="cursor-pointer">
              <SelectItem className="cursor-pointer" value="TODOS">
                TODOS
              </SelectItem>
              {enterprises.map((enterprise) => (
                <SelectItem
                  className="cursor-pointer"
                  key={enterprise.id}
                  value={enterprise.id}
                >
                  {enterprise.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="startDate">Data inicial</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

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

      {/* Botão de salvar alterações */}
      {Object.keys(modifiedUnits).length > 0 && (
        <div className="mt-4 flex justify-end">
          <Button onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving
              ? "Salvando..."
              : `Salvar alterações (${Object.keys(modifiedUnits).length})`}
          </Button>
        </div>
      )}

      {renderUnitCards()}
    </div>
  );
};

export default UnidadesComReagendamento;
