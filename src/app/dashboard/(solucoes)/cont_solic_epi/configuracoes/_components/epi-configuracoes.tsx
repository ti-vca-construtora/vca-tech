"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { FuncoesConfiguracoes } from "./funcoes-configuracoes";

const STORAGE_KEY = "vca-tech:sesmt:epi-items:v1";

const DEFAULT_EPI_ITEMS: string[] = [
  "ABAFADOR DE RUÍDO PARA ACOPLAR",
  "AVENTAL DE RASPA",
  "BOTA DE ADMINISTRATIVO",
  "BOTA DE BORRACHA",
  "BOTA DE COURO",
  "CALÇA DA FARDA DA EMPRESA",
  "CAMISA DA FARDA",
  "CAPACETE (DETALHE AMARELO)",
  "CAPACETE (DETALHE AZUL)",
  "CAPACETE (DETALHE BRANCO)",
  "CAPACETE (DETALHE CINZA)",
  "CAPACETE (DETALHE MARROM)",
  "CAPACETE (DETALHE VERDE)",
  "CAPACETE (DETALHE VERMELHO)",
  "CHAPÉU PESCADOR COM PROTEÇÃO DE OMBRO (TOUCA ÁRABE)",
  "FARDAMENTO ANTI-CHAMAS (AVENTAL COM MANGAS) - C.A. 35236",
  "FILTRO PARA MÁSCARA",
  "RESPIRADOR FACIAL 1/4  COM FILTRO",
  "JOELHEIRA DE PROTEÇÃO",
  "LENTE FILTRO DE LUZ PARA MÁSCARA DE SOLDA",
  "LUVA DE POLIÉSTER COM BANHO DE LÁTEX CORRUGADO SS1009 - SUPER SAFFETY / CA - 31895",
  "LUVA DE VAQUETA",
  "LUVA EM HELANCA PU",
  "LUVA LÁTEX - LARANJA REFORÇADA",
  "LUVA VULCANIZADA",
  "MACACÃO DE PROTEÇÃO AZUL",
  "MÁSCARA DESCARTÁVEL",
  "MASCARA SOLDA AUTOMÁTICA S/ REGULAGEM 3 A 11 V8",
  "ÓCULOS AMPLA VISÃO",
  "ÓCULOS DE PROTEÇÃO ESCURO",
  "ÓCULOS DE PROTEÇÃO TRANSPARENTE",
  "PERNEIRA DE COURO SINTÉTICO",
  "PROTETOR AURICULAR TAPA OUVIDOS (PLUG)",
  "PROTETOR AURICULAR TIPO CONCHA",
  "PROTETOR SOLAR",
];

function normalizeEpiName(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();
}

function loadEpiItems(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((v) => typeof v === "string")
      .map((v) => normalizeEpiName(v))
      .filter(Boolean);
  } catch {
    return [];
  }
}

function saveEpiItems(items: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function EpiConfiguracoes() {
  const { toast } = useToast();
  const [items, setItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState<string>("");

  useEffect(() => {
    const loaded = loadEpiItems();

    if (loaded.length === 0) {
      const seeded = [...DEFAULT_EPI_ITEMS].sort((a, b) => a.localeCompare(b));
      saveEpiItems(seeded);
      setItems(seeded);
      return;
    }

    const normalized = Array.from(new Set(loaded)).sort((a, b) =>
      a.localeCompare(b),
    );
    setItems(normalized);
  }, []);

  const canAdd = useMemo(() => {
    const normalized = normalizeEpiName(newItem);
    if (!normalized) return false;
    return !items.includes(normalized);
  }, [newItem, items]);

  const handleAdd = () => {
    const normalized = normalizeEpiName(newItem);

    if (!normalized) {
      toast({
        title: "Informe um nome",
        description: "Digite o nome do EPI antes de adicionar.",
        variant: "destructive",
      });
      return;
    }

    if (items.includes(normalized)) {
      toast({
        title: "EPI já cadastrado",
        description: "Esse item já existe na lista.",
        variant: "destructive",
      });
      return;
    }

    const next = [...items, normalized].sort((a, b) => a.localeCompare(b));
    setItems(next);
    saveEpiItems(next);
    setNewItem("");

    toast({
      title: "EPI adicionado",
      description: normalized,
    });
  };

  const handleRemove = (name: string) => {
    const next = items.filter((x) => x !== name);
    setItems(next);
    saveEpiItems(next);

    toast({
      title: "EPI removido",
      description: name,
    });
  };

  const handleReset = () => {
    const seeded = [...DEFAULT_EPI_ITEMS].sort((a, b) => a.localeCompare(b));
    setItems(seeded);
    saveEpiItems(seeded);

    toast({
      title: "Lista restaurada",
      description: "A lista base de EPIs foi restaurada.",
    });
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Configurações • Cadastro de EPIs</CardTitle>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">Restaurar lista base</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Restaurar lista base?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Isso vai substituir a lista atual pela lista padrão.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset}>
                    Restaurar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Input
                placeholder="Digite o nome do EPI"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAdd();
                }}
              />
              <Button onClick={handleAdd} disabled={!canAdd}>
                Adicionar
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Produtos adicionais não são calculados.
            </p>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>EPI</TableHead>
                  <TableHead className="w-[140px] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center">
                      Nenhum EPI cadastrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((name) => (
                    <TableRow key={name}>
                      <TableCell className="font-medium">{name}</TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              Remover
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remover EPI?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Confirma a remoção de: <strong>{name}</strong>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleRemove(name)}>
                                Remover
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <FuncoesConfiguracoes epiItems={items} />
    </div>
  );
}
