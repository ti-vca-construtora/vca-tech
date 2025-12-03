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

type ParcelaDesconsiderar = {
  id: string;
  descricao: string;
  criadoEm: string;
};

export function ParcelasDesconsiderarManager() {
  const [entries, setEntries] = useState<ParcelaDesconsiderar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    descricao: "",
  });

  useEffect(() => {
    loadEntries();
  }, []);

  const getInitialData = (): ParcelaDesconsiderar[] => {
    const baseDate = new Date().toISOString();
    const parcelas = [
      "Entrada",
      "Financiamento CEF",
      "Financiamento Outros Bancos",
      "FGTS Financiável",
      "Subsídio Financiável",
      "Parcela Única",
      "Permuta",
      "Morar Bem - PE",
    ];

    return parcelas.map((descricao, index) => ({
      id: `initial-${index}`,
      descricao: descricao,
      criadoEm: baseDate,
    }));
  };

  const loadEntries = () => {
    setIsLoading(true);
    const stored = localStorage.getItem("parcelas-desconsiderar");

    if (stored) {
      setEntries(JSON.parse(stored));
    } else {
      // Carregar dados iniciais se não houver nada no localStorage
      const initialData = getInitialData();
      setEntries(initialData);
      localStorage.setItem(
        "parcelas-desconsiderar",
        JSON.stringify(initialData)
      );
    }

    setIsLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Verificar se a descrição já existe
    const exists = entries.some(
      (entry) =>
        entry.descricao.toUpperCase() === formData.descricao.toUpperCase()
    );

    if (exists) {
      alert("Já existe uma parcela configurada com esta descrição!");
      return;
    }

    const newEntry: ParcelaDesconsiderar = {
      id: Date.now().toString(),
      descricao: formData.descricao,
      criadoEm: new Date().toISOString(),
    };

    const updatedEntries = [...entries, newEntry].sort((a, b) =>
      a.descricao.localeCompare(b.descricao)
    );

    setEntries(updatedEntries);
    localStorage.setItem(
      "parcelas-desconsiderar",
      JSON.stringify(updatedEntries)
    );

    alert(
      `Parcela "${formData.descricao}" adicionada com sucesso à lista de parcelas a desconsiderar!`
    );

    setFormData({ descricao: "" });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta parcela?")) return;

    const updatedEntries = entries.filter((entry) => entry.id !== id);
    setEntries(updatedEntries);
    localStorage.setItem(
      "parcelas-desconsiderar",
      JSON.stringify(updatedEntries)
    );
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
            <CardTitle>Parcelas a Desconsiderar</CardTitle>
            <CardDescription>
              Definir códigos de parcelas que devem ser excluídas do cálculo de
              correção
            </CardDescription>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-azul-claro-vca hover:bg-azul-vca"
          >
            <Plus className="size-4 mr-2" />
            Nova Parcela
          </Button>
        </CardHeader>
        <CardContent>
          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="bg-neutral-50 p-4 rounded-lg mb-6 flex gap-4 items-end"
            >
              <div className="flex-1">
                <Label htmlFor="descricao">Descrição da Parcela</Label>
                <Input
                  id="descricao"
                  type="text"
                  required
                  value={formData.descricao}
                  onChange={(e) =>
                    setFormData({ ...formData, descricao: e.target.value })
                  }
                  placeholder="Ex: Entrada, Financiamento, Parcela Única..."
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
              <p>Nenhuma parcela configurada para ser desconsiderada.</p>
              <p className="text-sm mt-2">
                Clique em &quot;Nova Parcela&quot; para adicionar.
              </p>
            </div>
          ) : (
            <div>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Parcelas atualmente desconsideradas:</strong>{" "}
                  {entries.map((e) => e.descricao).join(", ")}
                </p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-bold text-azul-vca">
                        {entry.descricao}
                      </TableCell>
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
