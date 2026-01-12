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
  loadFuncoesAsync,
  loadInventorySnapshotsAsync,
  loadEpiItemsAsync,
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
    intervalMonths: number; // Intervalo de reposição em meses
    quantityPerEmployee: number; // Quantidade por funcionário projetado
    currentNeed: number; // Necessidade mensal para efetivos
    projectedNeed: number; // Necessidade para projetados
    totalNeed: number; // Total (efetivos + projetados)
    stock: number;
    shortage: number;
    manualAdjust: number;
    justification: string;
  }>;
};

export function RequestForm({ snapshotId, onBack }: RequestFormProps) {
  const { toast } = useToast();
  const [snapshot, setSnapshot] = useState<InventorySnapshot | null>(null);
  const [funcoes, setFuncoes] = useState<
    Array<{ id: string; name: string; items: Array<{ epi: string; intervalMonths: number; quantityPerEmployee: number }> }>
  >([]);
  const [availableEpis, setAvailableEpis] = useState<string[]>([]);

  const [functionRequests, setFunctionRequests] = useState<FunctionRequest[]>([]);
  const [projectedCounts, setProjectedCounts] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadData() {
      const [snaps, funcs, epis] = await Promise.all([
        loadInventorySnapshotsAsync(),
        loadFuncoesAsync(),
        loadEpiItemsAsync(),
      ]);
      
      const found = snaps.find((s) => s.id === snapshotId);
      if (!found) {
        toast({ title: "Snapshot não encontrado", variant: "destructive" });
        onBack();
        return;
      }
      setSnapshot(found);
      setAvailableEpis(epis);
      setFuncoes(funcs);

      // NÃO inicializar projetados - deixar vazio para o usuário preencher
      setProjectedCounts({});
    }
    loadData();
  }, [snapshotId, onBack, toast]);

  // calcular necessidades quando mudar projetados
  useEffect(() => {
    if (!snapshot || availableEpis.length === 0) return;

    const requests: FunctionRequest[] = [];

    for (const func of funcoes) {
      const currentEmp = snapshot.functionCounts[func.name] || 0;
      const projectedEmp = parseInt(projectedCounts[func.name] || "0", 10);

      // Filtrar apenas EPIs que ainda existem na lista cadastrada
      const epiNeeds = func.items
        .filter((item) => availableEpis.includes(item.epi))
        .map((item) => {
          // Lógica correta:
          // 1. Para efetivos (já trabalhando): calcular necessidade MENSAL baseada no intervalo
          //    - Taxa mensal = 1 / intervalo em meses
          //    - Necessidade mensal = funcionários × taxa mensal (arredondado para cima)
          //    - Ex: 10 func, intervalo 3 meses → 10 × (1/3) = 3.33 → 4 por mês
          // 2. Para projetados (novos): quantidade inteira para equipar
          //    - Necessidade = funcionários × quantidade unitária
          //    - Ex: 5 novos func, 1 unidade cada → 5 unidades
          // 3. Total = efetivos + projetados
          // 4. Falta = total - estoque
          
          const taxaMensal = item.intervalMonths > 0 ? 1 / item.intervalMonths : 0;
          const currentNeed = Math.ceil(currentEmp * taxaMensal); // Necessidade mensal para efetivos
          const projectedNeed = projectedEmp * item.quantityPerEmployee; // Quantidade para novos
          const totalNeed = currentNeed + projectedNeed;
          
          const stock = snapshot.epiCounts[item.epi] || 0;
          const shortage = Math.max(0, totalNeed - stock);

          return {
            epi: item.epi,
            intervalMonths: item.intervalMonths,
            quantityPerEmployee: item.quantityPerEmployee,
            currentNeed,
            projectedNeed,
            totalNeed,
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
  }, [snapshot, funcoes, projectedCounts, availableEpis]);

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
          <h3 className="text-lg font-semibold">Etapa 3: Solicitação de EPIs</h3>
          <p className="text-sm text-muted-foreground">
            Obra: {snapshot.obraName} — {snapshot.obraCity}/{snapshot.obraState}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Defina os funcionários projetados e revise as necessidades calculadas
          </p>
        </div>
        <Button variant="outline" onClick={onBack}>
          Voltar
        </Button>
      </div>

      <div className="border rounded-lg p-4 bg-muted/20">
        <div className="mb-4 space-y-1">
          <h4 className="text-sm font-semibold">Como funciona o cálculo:</h4>
          <p className="text-xs text-muted-foreground">
            • <strong>Efetivos</strong>: necessidade MENSAL baseada no intervalo de reposição (ex: intervalo 3 meses = 1/3 por mês)
          </p>
          <p className="text-xs text-muted-foreground">
            • <strong>Projetados</strong>: quantidade inteira para equipar os novos (ex: 5 novos = 5 unidades)
          </p>
          <p className="text-xs text-muted-foreground">
            • <strong>Total</strong>: Efetivos + Projetados
          </p>
          <p className="text-xs text-muted-foreground">
            • <strong>Falta</strong>: Total necessário - Estoque disponível
          </p>
        </div>

        {functionRequests
          .filter(req => req.epiNeeds.some(need => need.shortage > 0))
          .map((req) => (
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
                      <TableHead className="w-[110px] text-xs">Intervalo (meses)</TableHead>
                      <TableHead className="w-[90px] text-xs">Qtd/Func</TableHead>
                      <TableHead className="w-[90px]">Nec. Efetivos</TableHead>
                      <TableHead className="w-[90px]">Nec. Projetados</TableHead>
                      <TableHead className="w-[90px]">Total Mês</TableHead>
                      <TableHead className="w-[80px]">Estoque</TableHead>
                      <TableHead className="w-[70px]">Falta</TableHead>
                      <TableHead className="w-[110px]">Ajuste</TableHead>
                      <TableHead>Justificativa</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {req.epiNeeds.map((need) => (
                      <TableRow key={need.epi}>
                        <TableCell className="font-medium">{need.epi}</TableCell>
                        <TableCell className="text-muted-foreground">{need.intervalMonths} {need.intervalMonths === 1 ? 'mês' : 'meses'}</TableCell>
                        <TableCell className="text-muted-foreground">{need.quantityPerEmployee}</TableCell>
                        <TableCell>{need.currentNeed}</TableCell>
                        <TableCell className="font-semibold">{need.projectedNeed}</TableCell>
                        <TableCell className="font-semibold text-blue-600">{need.totalNeed}</TableCell>
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
