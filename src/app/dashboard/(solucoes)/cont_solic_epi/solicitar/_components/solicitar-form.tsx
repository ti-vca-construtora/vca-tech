"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";

import {
  genId,
  InventorySnapshot,
  loadEpiItems,
  loadFuncoes,
  loadInventorySnapshots,
  loadObras,
  Obra,
  saveInventorySnapshots,
} from "../../_lib/cont-solic-epi-storage";
import { RequestForm } from "./request-form";

function monthsFactor(item: { intervalValue: number; intervalUnit: string }) {
  switch (item.intervalUnit) {
    case "DIA":
      return 30 / item.intervalValue;
    case "SEMANA":
      return 4 / item.intervalValue;
    case "ANO":
      return 1 / (item.intervalValue * 12);
    case "MES":
    default:
      return 1 / item.intervalValue;
  }
}

export function SolicitarForm() {
  const { toast } = useToast();
  const user = useUser();

  const [step, setStep] = useState<"snapshot" | "request">("snapshot");
  const [savedSnapshotId, setSavedSnapshotId] = useState<string | null>(null);

  const [obras, setObras] = useState<Obra[]>([]);
  const [selectedObraId, setSelectedObraId] = useState("");

  const [epiItems, setEpiItems] = useState<string[]>([]);
  const [funcoes, setFuncoes] = useState<
    Array<{ id: string; name: string; items: Array<{ epi: string; intervalValue: number; intervalUnit: string }> }>
  >([]);

  const [epiCounts, setEpiCounts] = useState<Record<string, string>>({});
  const [functionCounts, setFunctionCounts] = useState<Record<string, string>>({});

  useEffect(() => {
    setObras(loadObras());
    setEpiItems(loadEpiItems());
    setFuncoes(loadFuncoes());
  }, []);

  const selectedObra = useMemo(() => {
    return obras.find((o) => o.id === selectedObraId);
  }, [selectedObraId, obras]);

  function handleSaveSnapshot() {
    if (!selectedObra) {
      toast({
        title: "Selecione uma obra",
        variant: "destructive",
      });
      return;
    }

    const epiClean: Record<string, number> = {};
    for (const k of Object.keys(epiCounts)) {
      const val = parseInt(epiCounts[k] || "0", 10);
      if (Number.isFinite(val) && val > 0) {
        epiClean[k] = val;
      }
    }

    const funcClean: Record<string, number> = {};
    for (const k of Object.keys(functionCounts)) {
      const val = parseInt(functionCounts[k] || "0", 10);
      if (Number.isFinite(val) && val > 0) {
        funcClean[k] = val;
      }
    }

    const snapshot: InventorySnapshot = {
      id: genId(),
      obraId: selectedObra.id,
      obraName: selectedObra.name,
      obraState: selectedObra.state,
      obraCity: selectedObra.city,
      obraType: selectedObra.empreendimentoType,
      createdAt: new Date().toISOString(),
      createdBy: {
        id: user.user?.id,
        name: user.user?.name || undefined,
        email: user.user?.email || undefined,
      },
      epiCounts: epiClean,
      functionCounts: funcClean,
    };

    const all = loadInventorySnapshots();
    all.push(snapshot);
    saveInventorySnapshots(all);

    setSavedSnapshotId(snapshot.id);
    toast({ title: "Snapshot salvo com sucesso! Agora preencha a solicitação." });

    // mover para o formulário de solicitação
    setStep("request");
  }

  if (step === "request" && savedSnapshotId) {
    return <RequestForm snapshotId={savedSnapshotId} onBack={() => setStep("snapshot")} />;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Selecione a Obra</Label>
        <Select value={selectedObraId} onValueChange={setSelectedObraId}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            {obras.length === 0 ? (
              <div className="p-2 text-sm text-muted-foreground">
                Nenhuma obra cadastrada.
              </div>
            ) : (
              obras.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.name} ({o.city}/{o.state})
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {selectedObra && (
        <>
          <div className="border-t pt-4">
            <div className="text-sm font-medium mb-2">
              Contagem manual (estoque e funcionários)
            </div>
            <div className="text-xs text-muted-foreground mb-4">
              Preencha as quantidades de EPIs (estoque) e de funcionários por
              função.
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-2">
                <div className="text-sm font-semibold">EPIs (estoque)</div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="w-[140px]">Qtd</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {epiItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} className="text-muted-foreground">
                          Nenhum EPI cadastrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      epiItems.map((item) => (
                        <TableRow key={item}>
                          <TableCell>{item}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              value={epiCounts[item] || ""}
                              onChange={(e) =>
                                setEpiCounts((prev) => ({
                                  ...prev,
                                  [item]: e.target.value,
                                }))
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-semibold">
                  Funcionários (por função)
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Função</TableHead>
                      <TableHead className="w-[140px]">Qtd</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {funcoes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} className="text-muted-foreground">
                          Nenhuma função cadastrada.
                        </TableCell>
                      </TableRow>
                    ) : (
                      funcoes.map((func) => (
                        <TableRow key={func.id}>
                          <TableCell>{func.name}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              value={functionCounts[func.name] || ""}
                              onChange={(e) =>
                                setFunctionCounts((prev) => ({
                                  ...prev,
                                  [func.name]: e.target.value,
                                }))
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveSnapshot}>Salvar Snapshot</Button>
          </div>
        </>
      )}
    </div>
  );
}
