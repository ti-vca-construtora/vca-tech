"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  loadFuncoes,
  loadInventorySnapshots,
  InventorySnapshot,
} from "../../_lib/cont-solic-epi-storage";

type RequestFormProps = {
  snapshotId: string;
  onBack: () => void;
};

type FunctionRequest = {
  functionName: string;
  currentEmployees: number;
  projectedEmployees: number;
  epiNeeds: Array<{
    epi: string;
    monthlyFactor: number;
    currentNeed: number;
    projectedNeed: number;
    stock: number;
    shortage: number;
    manualAdjust: number;
    justification: string;
  }>;
};

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

export function RequestForm({ snapshotId, onBack }: RequestFormProps) {
  const { toast } = useToast();
  const [snapshot, setSnapshot] = useState<InventorySnapshot | null>(null);
  const [funcoes, setFuncoes] = useState<
    Array<{ id: string; name: string; items: Array<{ epi: string; intervalValue: number; intervalUnit: string }> }>
  >([]);

  const [functionRequests, setFunctionRequests] = useState<FunctionRequest[]>([]);
  const [projectedCounts, setProjectedCounts] = useState<Record<string, string>>({});

  useEffect(() => {
    const snaps = loadInventorySnapshots();
    const found = snaps.find((s) => s.id === snapshotId);
    if (!found) {
      toast({ title: "Snapshot não encontrado", variant: "destructive" });
      onBack();
      return;
    }
    setSnapshot(found);

    const funcs = loadFuncoes();
    setFuncoes(funcs);

    // inicializar projetados com valores efetivos
    const initial: Record<string, string> = {};
    for (const [k, v] of Object.entries(found.functionCounts)) {
      initial[k] = String(v);
    }
    setProjectedCounts(initial);
  }, [snapshotId, onBack, toast]);

  // calcular necessidades quando mudar projetados
  useEffect(() => {
    if (!snapshot) return;

    const requests: FunctionRequest[] = [];

    for (const func of funcoes) {
      const currentEmp = snapshot.functionCounts[func.name] || 0;
      const projectedEmp = parseInt(projectedCounts[func.name] || "0", 10);

      const epiNeeds = func.items.map((item) => {
        const factor = monthsFactor(item);
        const currentNeed = Math.ceil(currentEmp * factor);
        const projectedNeed = Math.ceil(projectedEmp * factor);
        const stock = snapshot.epiCounts[item.epi] || 0;
        const shortage = Math.max(0, projectedNeed - stock);

        return {
          epi: item.epi,
          monthlyFactor: factor,
          currentNeed,
          projectedNeed,
          stock,
          shortage,
          manualAdjust: 0,
          justification: "",
        };
      });

      requests.push({
        functionName: func.name,
        currentEmployees: currentEmp,
        projectedEmployees: projectedEmp,
        epiNeeds,
      });
    }

    setFunctionRequests(requests);
  }, [snapshot, funcoes, projectedCounts]);

  function updateProjected(funcName: string, value: string) {
    setProjectedCounts((prev) => ({ ...prev, [funcName]: value }));
  }

  function updateManualAdjust(funcName: string, epi: string, value: string) {
    setFunctionRequests((prev) =>
      prev.map((req) => {
        if (req.functionName !== funcName) return req;
        return {
          ...req,
          epiNeeds: req.epiNeeds.map((need) =>
            need.epi === epi ? { ...need, manualAdjust: parseInt(value || "0", 10) } : need
          ),
        };
      })
    );
  }

  function updateJustification(funcName: string, epi: string, value: string) {
    setFunctionRequests((prev) =>
      prev.map((req) => {
        if (req.functionName !== funcName) return req;
        return {
          ...req,
          epiNeeds: req.epiNeeds.map((need) =>
            need.epi === epi ? { ...need, justification: value } : need
          ),
        };
      })
    );
  }

  const totalRequests = useMemo(() => {
    const summary: Record<string, { shortage: number; adjusted: number }> = {};
    for (const req of functionRequests) {
      for (const need of req.epiNeeds) {
        if (!summary[need.epi]) {
          summary[need.epi] = { shortage: 0, adjusted: 0 };
        }
        summary[need.epi].shortage += need.shortage;
        summary[need.epi].adjusted += need.shortage + need.manualAdjust;
      }
    }
    return summary;
  }, [functionRequests]);

  function handleSubmitRequest() {
    // validar ajustes manuais (se > 0, precisa justificativa)
    for (const req of functionRequests) {
      for (const need of req.epiNeeds) {
        if (need.manualAdjust !== 0 && !need.justification.trim()) {
          toast({
            title: "Justificativa obrigatória",
            description: `Informe a justificativa para o ajuste manual de "${need.epi}" na função "${req.functionName}".`,
            variant: "destructive",
          });
          return;
        }
      }
    }

    // aqui você pode salvar a solicitação completa (localStorage ou API)
    toast({
      title: "Solicitação enviada com sucesso!",
      description: "A solicitação foi registrada e pode ser processada.",
    });

    onBack();
  }

  if (!snapshot) return <div>Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Formulário de Solicitação</h3>
          <p className="text-sm text-muted-foreground">
            Obra: {snapshot.obraName} — {snapshot.obraCity}/{snapshot.obraState}
          </p>
        </div>
        <Button variant="outline" onClick={onBack}>
          Voltar
        </Button>
      </div>

      <div className="border rounded-lg p-4 bg-muted/20">
        <h4 className="text-sm font-medium mb-4">
          Preencha os funcionários projetados e revise os cálculos
        </h4>

        {functionRequests.map((req) => (
          <div key={req.functionName} className="mb-6 border-b pb-4 last:border-b-0">
            <div className="grid gap-4 md:grid-cols-3 mb-4">
              <div>
                <Label className="font-semibold">{req.functionName}</Label>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Efetivos</Label>
                <div className="font-medium">{req.currentEmployees}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Projetados</Label>
                <Input
                  type="number"
                  min="0"
                  value={projectedCounts[req.functionName] || ""}
                  onChange={(e) => updateProjected(req.functionName, e.target.value)}
                />
              </div>
            </div>

            {req.epiNeeds.length > 0 && (
              <div className="pl-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>EPI</TableHead>
                      <TableHead className="w-[100px]">Fator/mês</TableHead>
                      <TableHead className="w-[100px]">Nec. Efetivos</TableHead>
                      <TableHead className="w-[100px]">Nec. Projetados</TableHead>
                      <TableHead className="w-[100px]">Estoque</TableHead>
                      <TableHead className="w-[100px]">Falta</TableHead>
                      <TableHead className="w-[120px]">Ajuste Manual</TableHead>
                      <TableHead>Justificativa</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {req.epiNeeds.map((need) => (
                      <TableRow key={need.epi}>
                        <TableCell className="font-medium">{need.epi}</TableCell>
                        <TableCell>{need.monthlyFactor.toFixed(2)}</TableCell>
                        <TableCell>{need.currentNeed}</TableCell>
                        <TableCell>{need.projectedNeed}</TableCell>
                        <TableCell>{need.stock}</TableCell>
                        <TableCell className={need.shortage > 0 ? "text-red-600 font-semibold" : ""}>
                          {need.shortage > 0 ? `+${need.shortage}` : "OK"}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={need.manualAdjust}
                            onChange={(e) =>
                              updateManualAdjust(req.functionName, need.epi, e.target.value)
                            }
                            placeholder="0"
                          />
                        </TableCell>
                        <TableCell>
                          <Textarea
                            value={need.justification}
                            onChange={(e) =>
                              updateJustification(req.functionName, need.epi, e.target.value)
                            }
                            placeholder="Justificativa (obrigatória se ajustar)"
                            rows={1}
                            className="min-h-[32px]"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border rounded-lg p-4 bg-muted/10">
        <h4 className="text-sm font-semibold mb-2">Resumo da Solicitação</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>EPI</TableHead>
              <TableHead className="w-[150px]">Falta Calculada</TableHead>
              <TableHead className="w-[150px]">Total c/ Ajustes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(totalRequests)
              .filter(([, v]) => v.adjusted > 0)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([epi, data]) => (
                <TableRow key={epi}>
                  <TableCell className="font-medium">{epi}</TableCell>
                  <TableCell>{data.shortage}</TableCell>
                  <TableCell className="font-semibold">{data.adjusted}</TableCell>
                </TableRow>
              ))}
            {Object.entries(totalRequests).filter(([, v]) => v.adjusted > 0).length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-muted-foreground">
                  Nenhum EPI faltando no momento.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onBack}>
          Cancelar
        </Button>
        <Button onClick={handleSubmitRequest}>Enviar Solicitação</Button>
      </div>
    </div>
  );
}
