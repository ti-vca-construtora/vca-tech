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
import { supabaseEpi } from "@/lib/supabase-epi";

type IndexType = "IPC-DI" | "IGP-M" | "IPCA";

type IndexEntry = {
  id: string;
  mes: number;
  ano: number;
  valor: number;
  tipo: IndexType;
  created_at: string;
};

export function IpcDiManager() {
  const [entries, setEntries] = useState<IndexEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<IndexType>("IPC-DI");
  const [formData, setFormData] = useState({
    mesAno: "",
    valor: "",
    tipo: "IPC-DI" as IndexType,
  });

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabaseEpi
        .from("index_entries")
        .select("*")
        .order("ano", { ascending: false })
        .order("mes", { ascending: false });

      if (error) {
        console.error("Error loading entries:", error);
        alert("Erro ao carregar dados do Supabase.");
      } else {
        setEntries(data || []);
      }
    } catch (error) {
      console.error("Error loading entries:", error);
      alert("Erro ao carregar dados do Supabase.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const [ano, mes] = formData.mesAno.split("-").map(Number);

    // Verificar se já existe uma entrada para este mês/ano/tipo
    const exists = entries.some(
      (entry) => entry.mes === mes && entry.ano === ano && entry.tipo === formData.tipo
    );

    if (exists) {
      alert(
        `Já existe uma taxa ${formData.tipo} cadastrada para ${getMesNome(mes)}/${ano}!`
      );
      return;
    }

    try {
      const { data, error } = await supabaseEpi
        .from("index_entries")
        .insert([
          {
            mes,
            ano,
            valor: parseFloat(formData.valor),
            tipo: formData.tipo,
          },
        ])
        .select();

      if (error) {
        console.error("Error inserting entry:", error);
        alert("Erro ao salvar no Supabase.");
        return;
      }

      alert(
        `Taxa ${formData.tipo} de ${getMesNome(mes)}/${ano} (${formData.valor}%) salva com sucesso!`
      );

      setFormData({ mesAno: "", valor: "", tipo: "IPC-DI" });
      setShowForm(false);
      
      // Recarregar os dados
      loadEntries();
    } catch (error) {
      console.error("Error inserting entry:", error);
      alert("Erro ao salvar no Supabase.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta entrada?")) return;

    try {
      const { error } = await supabaseEpi
        .from("index_entries")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting entry:", error);
        alert("Erro ao excluir do Supabase.");
        return;
      }

      // Recarregar os dados
      loadEntries();
    } catch (error) {
      console.error("Error deleting entry:", error);
      alert("Erro ao excluir do Supabase.");
    }
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

  // Filtrar entries por tipo selecionado
  const filteredEntries = entries.filter((entry) => entry.tipo === selectedIndex);

  return (
    <div className="w-full h-full flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <CardTitle>Taxas de Correção Monetária</CardTitle>
              <select
                value={selectedIndex}
                onChange={(e) => setSelectedIndex(e.target.value as IndexType)}
                className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-azul-claro-vca"
              >
                <option value="IPC-DI">IPC-DI (FGV)</option>
                <option value="IGP-M">IGP-M (FGV)</option>
                <option value="IPCA">IPCA (IBGE)</option>
              </select>
            </div>
            <CardDescription>
              Gerenciar as taxas mensais de {selectedIndex} para cálculo de correção
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
              <div className="w-[150px]">
                <Label htmlFor="tipo" className="text-sm font-medium">
                  Índice
                </Label>
                <select
                  id="tipo"
                  value={formData.tipo}
                  onChange={(e) =>
                    setFormData({ ...formData, tipo: e.target.value as IndexType })
                  }
                  className="w-full h-10 border border-input rounded px-3 py-2 text-sm hover:border-azul-claro-vca focus:border-azul-claro-vca focus:ring-2 focus:ring-azul-claro-vca/20 transition-all"
                >
                  <option value="IPC-DI">IPC-DI</option>
                  <option value="IGP-M">IGP-M</option>
                  <option value="IPCA">IPCA</option>
                </select>
              </div>
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
                <Label htmlFor="valor" className="text-sm font-medium">
                  Taxa (%)
                </Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  required
                  value={formData.valor}
                  onChange={(e) =>
                    setFormData({ ...formData, valor: e.target.value })
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
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              <p>Nenhuma taxa {selectedIndex} cadastrada ainda.</p>
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
                  <TableHead>Taxa (%)</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">
                      {getMesNome(entry.mes)}
                    </TableCell>
                    <TableCell>{entry.ano}</TableCell>
                    <TableCell>{entry.valor.toFixed(2)}%</TableCell>
                    <TableCell className="text-sm text-neutral-500">
                      {formatDate(entry.created_at)}
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
