"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Loader2 } from "lucide-react";

type IpcDiEntry = {
  id: string;
  mes: number;
  ano: number;
  ipc: number;
  criadoEm: string;
};

export function IpcDiManager() {
  const [entries, setEntries] = useState<IpcDiEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    mesAno: "",
    ipc: "",
  });

  useEffect(() => {
    loadEntries();
  }, []);

  const getInitialData = (): IpcDiEntry[] => {
    const baseDate = new Date().toISOString();
    const data: Array<{ ano: number; mes: number; ipc: number }> = [
      // 2017
      { ano: 2017, mes: 11, ipc: 0.36 },
      { ano: 2017, mes: 12, ipc: 0.21 },
      // 2018
      { ano: 2018, mes: 1, ipc: 0.69 },
      { ano: 2018, mes: 2, ipc: 0.17 },
      { ano: 2018, mes: 3, ipc: 0.17 },
      { ano: 2018, mes: 4, ipc: 0.34 },
      { ano: 2018, mes: 5, ipc: 0.41 },
      { ano: 2018, mes: 6, ipc: 1.19 },
      { ano: 2018, mes: 7, ipc: 0.17 },
      { ano: 2018, mes: 8, ipc: 0.07 },
      { ano: 2018, mes: 9, ipc: 0.45 },
      { ano: 2018, mes: 10, ipc: 0.48 },
      { ano: 2018, mes: 11, ipc: -0.17 },
      { ano: 2018, mes: 12, ipc: 0.29 },
      // 2019
      { ano: 2019, mes: 1, ipc: 0.57 },
      { ano: 2019, mes: 2, ipc: 0.35 },
      { ano: 2019, mes: 3, ipc: 0.65 },
      { ano: 2019, mes: 4, ipc: 0.63 },
      { ano: 2019, mes: 5, ipc: 0.22 },
      { ano: 2019, mes: 6, ipc: -0.02 },
      { ano: 2019, mes: 7, ipc: 0.31 },
      { ano: 2019, mes: 8, ipc: 0.17 },
      { ano: 2019, mes: 9, ipc: 0.0 },
      { ano: 2019, mes: 10, ipc: -0.09 },
      { ano: 2019, mes: 11, ipc: 0.49 },
      { ano: 2019, mes: 12, ipc: 0.77 },
      // 2020
      { ano: 2020, mes: 1, ipc: 0.59 },
      { ano: 2020, mes: 2, ipc: -0.01 },
      { ano: 2020, mes: 3, ipc: 0.34 },
      { ano: 2020, mes: 4, ipc: -0.18 },
      { ano: 2020, mes: 5, ipc: -0.54 },
      { ano: 2020, mes: 6, ipc: 0.36 },
      { ano: 2020, mes: 7, ipc: 0.49 },
      { ano: 2020, mes: 8, ipc: 0.53 },
      { ano: 2020, mes: 9, ipc: 0.82 },
      { ano: 2020, mes: 10, ipc: 0.65 },
      { ano: 2020, mes: 11, ipc: 0.94 },
      { ano: 2020, mes: 12, ipc: 1.07 },
      // 2021
      { ano: 2021, mes: 1, ipc: 0.27 },
      { ano: 2021, mes: 2, ipc: 0.54 },
      { ano: 2021, mes: 3, ipc: 1.0 },
      { ano: 2021, mes: 4, ipc: 0.23 },
      { ano: 2021, mes: 5, ipc: 0.81 },
      { ano: 2021, mes: 6, ipc: 0.64 },
      { ano: 2021, mes: 7, ipc: 0.92 },
      { ano: 2021, mes: 8, ipc: 0.71 },
      { ano: 2021, mes: 9, ipc: 1.43 },
      { ano: 2021, mes: 10, ipc: 0.77 },
      { ano: 2021, mes: 11, ipc: 1.08 },
      { ano: 2021, mes: 12, ipc: 0.57 },
      // 2022
      { ano: 2022, mes: 1, ipc: 0.49 },
      { ano: 2022, mes: 2, ipc: 0.28 },
      { ano: 2022, mes: 3, ipc: 1.35 },
      { ano: 2022, mes: 4, ipc: 1.08 },
      { ano: 2022, mes: 5, ipc: 0.5 },
      { ano: 2022, mes: 6, ipc: 0.67 },
      { ano: 2022, mes: 7, ipc: -1.19 },
      { ano: 2022, mes: 8, ipc: -0.57 },
      { ano: 2022, mes: 9, ipc: 0.02 },
      { ano: 2022, mes: 10, ipc: 0.69 },
      { ano: 2022, mes: 11, ipc: 0.57 },
      { ano: 2022, mes: 12, ipc: 0.35 },
      // 2023
      { ano: 2023, mes: 1, ipc: 0.8 },
      { ano: 2023, mes: 2, ipc: 0.34 },
      { ano: 2023, mes: 3, ipc: 0.74 },
      { ano: 2023, mes: 4, ipc: 0.5 },
      { ano: 2023, mes: 5, ipc: 0.08 },
      { ano: 2023, mes: 6, ipc: -0.1 },
      { ano: 2023, mes: 7, ipc: 0.07 },
      { ano: 2023, mes: 8, ipc: -0.22 },
      { ano: 2023, mes: 9, ipc: 0.27 },
      { ano: 2023, mes: 10, ipc: 0.45 },
      { ano: 2023, mes: 11, ipc: 0.27 },
      { ano: 2023, mes: 12, ipc: 0.29 },
      // 2024
      { ano: 2024, mes: 1, ipc: 0.61 },
      { ano: 2024, mes: 2, ipc: 0.55 },
      { ano: 2024, mes: 3, ipc: 0.1 },
      { ano: 2024, mes: 4, ipc: 0.42 },
      { ano: 2024, mes: 5, ipc: 0.53 },
      { ano: 2024, mes: 6, ipc: 0.22 },
      { ano: 2024, mes: 7, ipc: 0.54 },
      { ano: 2024, mes: 8, ipc: -0.16 },
      { ano: 2024, mes: 9, ipc: 0.63 },
      { ano: 2024, mes: 10, ipc: 0.3 },
      { ano: 2024, mes: 11, ipc: -0.13 },
      { ano: 2024, mes: 12, ipc: 0.31 },
      // 2025
      { ano: 2025, mes: 1, ipc: 0.02 },
      { ano: 2025, mes: 2, ipc: 1.18 },
      { ano: 2025, mes: 3, ipc: 0.44 },
      { ano: 2025, mes: 4, ipc: 0.52 },
      { ano: 2025, mes: 5, ipc: 0.34 },
      { ano: 2025, mes: 6, ipc: 0.16 },
      { ano: 2025, mes: 7, ipc: 0.37 },
      { ano: 2025, mes: 8, ipc: -0.44 },
      { ano: 2025, mes: 9, ipc: 0.65 },
      { ano: 2025, mes: 10, ipc: 0.14 },
    ];

    return data.map((item, index) => ({
      id: `initial-${index}`,
      mes: item.mes,
      ano: item.ano,
      ipc: item.ipc,
      criadoEm: baseDate,
    }));
  };

  const loadEntries = () => {
    setIsLoading(true);
    const stored = localStorage.getItem("ipc-di-entries");

    if (stored) {
      setEntries(JSON.parse(stored));
    } else {
      // Carregar dados iniciais se não houver nada no localStorage
      const initialData = getInitialData();
      setEntries(initialData);
      localStorage.setItem("ipc-di-entries", JSON.stringify(initialData));
    }

    setIsLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const [ano, mes] = formData.mesAno.split("-").map(Number);

    // Verificar se já existe uma entrada para este mês/ano
    const exists = entries.some(
      (entry) => entry.mes === mes && entry.ano === ano
    );

    if (exists) {
      alert(
        `Já existe uma taxa IPC-DI cadastrada para ${getMesNome(mes)}/${ano}!`
      );
      return;
    }

    const newEntry: IpcDiEntry = {
      id: Date.now().toString(),
      mes,
      ano,
      ipc: parseFloat(formData.ipc),
      criadoEm: new Date().toISOString(),
    };

    const updatedEntries = [...entries, newEntry].sort((a, b) => {
      if (a.ano !== b.ano) return b.ano - a.ano;
      return b.mes - a.mes;
    });

    setEntries(updatedEntries);
    localStorage.setItem("ipc-di-entries", JSON.stringify(updatedEntries));

    alert(
      `Taxa IPC-DI de ${getMesNome(mes)}/${ano} (${formData.ipc}%) salva com sucesso!`
    );

    setFormData({ mesAno: "", ipc: "" });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta entrada?")) return;

    const updatedEntries = entries.filter((entry) => entry.id !== id);
    setEntries(updatedEntries);
    localStorage.setItem("ipc-di-entries", JSON.stringify(updatedEntries));
  };

  const getMesNome = (mes: number) => {
    const meses = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];
    return meses[mes - 1] || mes.toString();
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="w-full h-full flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Taxas IPC-DI (FGV)</CardTitle>
            <CardDescription>
              Gerenciar as taxas mensais de IPC-DI para cálculo de correção
            </CardDescription>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-azul-claro-vca hover:bg-azul-vca"
          >
            <Plus className="size-4 mr-2" />
            Nova Taxa
          </Button>
        </CardHeader>
        <CardContent>
          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="bg-neutral-50 p-4 rounded-lg mb-6 flex gap-4 items-end"
            >
              <div className="w-[180px]">
                <Label htmlFor="mesAno" className="text-sm font-medium">
                  Mês e Ano
                </Label>
                <Input
                  id="mesAno"
                  type="month"
                  required
                  value={formData.mesAno}
                  onChange={(e) =>
                    setFormData({ ...formData, mesAno: e.target.value })
                  }
                  min="2000-01"
                  max="2100-12"
                  className="cursor-pointer w-full h-10 text-sm font-medium hover:border-azul-claro-vca focus:border-azul-claro-vca focus:ring-2 focus:ring-azul-claro-vca/20 transition-all"
                  style={{
                    colorScheme: "light",
                  }}
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="ipc" className="text-sm font-medium">
                  IPC (%)
                </Label>
                <Input
                  id="ipc"
                  type="number"
                  step="0.01"
                  required
                  value={formData.ipc}
                  onChange={(e) =>
                    setFormData({ ...formData, ipc: e.target.value })
                  }
                  placeholder="0.00"
                  className="h-10 hover:border-azul-claro-vca focus:border-azul-claro-vca focus:ring-2 focus:ring-azul-claro-vca/20 transition-all"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="bg-verde-vca hover:bg-green-600"
                >
                  Salvar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="size-8 animate-spin text-azul-claro-vca" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              <p>Nenhuma taxa cadastrada ainda.</p>
              <p className="text-sm mt-2">
                Clique em &quot;Nova Taxa&quot; para adicionar.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mês</TableHead>
                  <TableHead>Ano</TableHead>
                  <TableHead>IPC (%)</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">
                      {getMesNome(entry.mes)}
                    </TableCell>
                    <TableCell>{entry.ano}</TableCell>
                    <TableCell>{entry.ipc.toFixed(2)}%</TableCell>
                    <TableCell className="text-sm text-neutral-500">
                      {formatDate(entry.criadoEm)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(entry.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
