import { useEffect, useState } from "react";

export interface InspectionConfig {
  id: string;
  minDaysToSchedule: number;
  maxDaysToSchedule: number;
  maxDaysToCancel: number;
  createdAt: string;
  updatedAt: string;
}

export function useInspectionConfig() {
  const [config, setConfig] = useState<InspectionConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/vistorias/inspection-config", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao buscar configurações");
      }

      const result = await response.json();
      setConfig(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      console.error("Erro ao buscar configurações:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (updates: Partial<InspectionConfig>) => {
    try {
      setLoading(true);
      setError(null);

      // Filtrar campos que não devem ser enviados no PATCH
      const cleanUpdates: Record<string, unknown> = {};
      const fieldsToExclude = [
        "id",
        "createdAt",
        "updatedAt",
        "defaultTimeSlots",
        "maxInspectionsPerSlot",
      ];

      Object.entries(updates).forEach(([key, value]) => {
        if (!fieldsToExclude.includes(key)) {
          cleanUpdates[key] = value;
        }
      });

      const response = await fetch("/api/vistorias/inspection-config", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanUpdates),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar configurações");
      }

      const result = await response.json();
      setConfig(result.data);
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      console.error("Erro ao atualizar configurações:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return {
    config,
    loading,
    error,
    refetch: fetchConfig,
    updateConfig,
  };
}
