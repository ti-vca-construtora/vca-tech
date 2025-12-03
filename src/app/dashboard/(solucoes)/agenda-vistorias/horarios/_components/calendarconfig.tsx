"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useInspectionConfig } from "@/hooks/use-inspection-config";
import { useState } from "react";
import { toast } from "react-toastify";

export function CalendarConfig() {
  const { config, loading, updateConfig } = useInspectionConfig();
  const [minDays, setMinDays] = useState<number>(0);
  const [maxDays, setMaxDays] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  // Atualizar valores locais quando o config carregar
  useState(() => {
    if (config) {
      setMinDays(config.minDaysToSchedule);
      setMaxDays(config.maxDaysToSchedule);
    }
  });

  const handleSave = async () => {
    if (minDays < 0 || maxDays < 0) {
      toast.error("Os valores devem ser positivos");
      return;
    }

    if (minDays > maxDays) {
      toast.error("O prazo mínimo não pode ser maior que o máximo");
      return;
    }

    if (!config) {
      toast.error("Configuração não carregada");
      return;
    }

    setIsSaving(true);
    try {
      // Enviar TODAS as configurações, não apenas as alteradas
      await updateConfig({
        ...config,
        minDaysToSchedule: minDays,
        maxDaysToSchedule: maxDays,
      });
      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Prazo mínimo de agendamento (dias)
        </label>
        <Input
          type="number"
          value={minDays || config?.minDaysToSchedule || 0}
          onChange={(e) => setMinDays(Number(e.target.value))}
          min={0}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Prazo máximo de agendamento (dias)
        </label>
        <Input
          type="number"
          value={maxDays || config?.maxDaysToSchedule || 0}
          onChange={(e) => setMaxDays(Number(e.target.value))}
          min={0}
        />
      </div>
      <div className="flex justify-end">
        <Button
          variant="outline"
          className="bg-azul-claro-vca text-white hover:bg-azul-vca hover:text-white"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </div>
  );
}
