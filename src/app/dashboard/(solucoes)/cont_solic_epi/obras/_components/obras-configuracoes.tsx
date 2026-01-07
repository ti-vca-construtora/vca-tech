"use client";

import { useEffect, useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useToast } from "@/hooks/use-toast";

import {
  genId,
  loadObras,
  Obra,
  ObraEmpreendimentoTipo,
  saveObras,
  normalizeText,
} from "../../_lib/cont-solic-epi-storage";

const DEFAULT_OBRAS: Array<Omit<Obra, "id">> = [
  {
    name: "Obra Exemplo - Incorporadora",
    state: "SP",
    city: "São Paulo",
    empreendimentoType: "INCORPORADORA",
  },
  {
    name: "Obra Exemplo - Loteamento",
    state: "MG",
    city: "Belo Horizonte",
    empreendimentoType: "LOTEAMENTO",
  },
];

export function ObrasConfiguracoes() {
  const { toast } = useToast();
  const [obras, setObras] = useState<Obra[]>([]);

  const [name, setName] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [type, setType] = useState<ObraEmpreendimentoTipo>("INCORPORADORA");

  useEffect(() => {
    const loaded = loadObras();
    if (loaded.length > 0) {
      setObras(loaded);
      return;
    }

    const seeded: Obra[] = DEFAULT_OBRAS.map((o) => ({ ...o, id: genId() }));
    setObras(seeded);
    saveObras(seeded);
  }, []);

  const sortedObras = useMemo(() => {
    return [...obras].sort((a, b) => a.name.localeCompare(b.name));
  }, [obras]);

  function persist(next: Obra[]) {
    setObras(next);
    saveObras(next);
  }

  function addObra() {
    const cleanName = normalizeText(name);
    const cleanState = normalizeText(state).toUpperCase();
    const cleanCity = normalizeText(city);

    if (!cleanName || !cleanState || !cleanCity) {
      toast({
        title: "Preencha os campos",
        description: "Informe Nome, UF e Cidade.",
        variant: "destructive",
      });
      return;
    }

    const next: Obra[] = [
      ...obras,
      {
        id: genId(),
        name: cleanName,
        state: cleanState,
        city: cleanCity,
        empreendimentoType: type,
      },
    ];
    persist(next);

    setName("");
    setState("");
    setCity("");
    setType("INCORPORADORA");

    toast({ title: "Obra cadastrada" });
  }

  function removeObra(id: string) {
    const next = obras.filter((o) => o.id !== id);
    persist(next);
    toast({ title: "Obra removida" });
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Cadastro de Obras</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2 md:col-span-2">
              <Label>Nome</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>UF</Label>
              <Input
                value={state}
                onChange={(e) => setState(e.target.value)}
                maxLength={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Cidade</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Tipo</Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as ObraEmpreendimentoTipo)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCORPORADORA">Incorporadora</SelectItem>
                  <SelectItem value="LOTEAMENTO">Loteamento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full" onClick={addObra}>
                Adicionar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Obras cadastradas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>UF</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="w-[120px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedObras.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    Nenhuma obra cadastrada.
                  </TableCell>
                </TableRow>
              ) : (
                sortedObras.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>{o.name}</TableCell>
                    <TableCell>{o.state}</TableCell>
                    <TableCell>{o.city}</TableCell>
                    <TableCell>
                      {o.empreendimentoType === "INCORPORADORA"
                        ? "Incorporadora"
                        : "Loteamento"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeObra(o.id)}
                      >
                        Remover
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
