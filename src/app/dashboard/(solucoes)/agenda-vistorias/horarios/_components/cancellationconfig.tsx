"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useInspectionConfig } from "@/hooks/use-inspection-config";
import { useState } from "react";
import { toast } from "react-toastify";

export function CancellationConfig() {
  const { config, loading, updateConfig } = useInspectionConfig();
  const [maxDaysToCancel, setMaxDaysToCancel] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  // Atualizar valor local quando o config carregar
  useState(() => {
    if (config) {
      setMaxDaysToCancel(config.maxDaysToCancel);
    }
  });

  const handleSave = async () => {
    if (maxDaysToCancel < 0) {
      toast.error("O valor deve ser positivo");
      return;
    }

    if (!config) {
      toast.error("Configuração não carregada");
      return;
    }

    setIsSaving(true);
    try {
      // Enviar TODAS as configurações, não apenas a alterada
      await updateConfig({
        ...config,
        maxDaysToCancel,
      });
      toast.success("Configuração salva com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar configuração");
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
          Prazo máximo para cancelamento (dias)
        </label>
        <Input
          type="number"
          value={maxDaysToCancel || config?.maxDaysToCancel || 0}
          onChange={(e) => setMaxDaysToCancel(Number(e.target.value))}
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
