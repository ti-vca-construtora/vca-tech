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
  Obra,
  loadObrasAsync,
  loadEpiItemsAsync,
  loadFuncoesAsync,
} from "../../_lib/cont-solic-epi-storage";
import { RequestForm } from "./request-form";

export function SolicitarForm() {
  const { toast } = useToast();
  const user = useUser();

  const [step, setStep] = useState<"epi-count" | "function-count-current" | "function-count-projected" | "result">("epi-count");

  const [obras, setObras] = useState<Obra[]>([]);
  const [selectedObraId, setSelectedObraId] = useState("");

  const [epiItems, setEpiItems] = useState<string[]>([]);
  const [funcoes, setFuncoes] = useState<
    Array<{ 
      id: string; 
      name: string; 
      items: Array<{ 
        epi: string; 
        intervalMonths: number; 
        quantityPerEmployee: number; 
      }> 
    }>
  >([]);

  const [epiCounts, setEpiCounts] = useState<Record<string, string>>({}); // Estoque manual
  const [currentFunctionCounts, setCurrentFunctionCounts] = useState<Record<string, string>>({}); // Efetivos
  const [projectedFunctionCounts, setProjectedFunctionCounts] = useState<Record<string, string>>({}); // Projetados
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [obrasData, epiData] = await Promise.all([
          loadObrasAsync(),
          loadEpiItemsAsync(),
        ]);
        setObras(obrasData);
        setEpiItems(epiData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as obras",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const selectedObra = useMemo(() => {
    return obras.find((o) => o.id === selectedObraId);
  }, [selectedObraId, obras]);

  // Carregar funções quando a obra é selecionada
  useEffect(() => {
    async function loadFuncoesForObra() {
      if (!selectedObra) {
        setFuncoes([]);
        return;
      }

      try {
        const funcoesData = await loadFuncoesAsync(selectedObra.empreendimentoType);
        setFuncoes(funcoesData);
      } catch (error) {
        console.error("Erro ao carregar funções:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as funções",
          variant: "destructive",
        });
      }
    }

    loadFuncoesForObra();
  }, [selectedObra]);

  function handleNextToFunctionCount() {
    if (!selectedObra) {
      toast({
        title: "Selecione uma obra",
        variant: "destructive",
      });
      return;
    }
    setStep("function-count-current");
  }

  function handleNextToProjectedCount() {
    if (!selectedObra) {
      toast({
        title: "Selecione uma obra",
        variant: "destructive",
      });
      return;
    }
    setStep("function-count-projected");
  }

  function handleSaveAndGoToResults() {
    if (!selectedObra) {
      toast({
        title: "Selecione uma obra",
        variant: "destructive",
      });
      return;
    }

    // Validar que pelo menos uma etapa foi preenchida
    const hasEpi = Object.values(epiCounts).some(v => v);
    const hasCurrent = Object.values(currentFunctionCounts).some(v => v);
    const hasProjected = Object.values(projectedFunctionCounts).some(v => v);

    if (!hasEpi && !hasCurrent && !hasProjected) {
      toast({
        title: "Preencha pelo menos um campo",
        description: "Informe estoque, efetivos ou projetados",
        variant: "destructive",
      });
      return;
    }

    // Criar objeto com todos os dados coletados
    const collectedData = {
      obraId: selectedObra.id,
      obraName: selectedObra.name,
      obraState: selectedObra.state,
      obraCity: selectedObra.city,
      obraType: selectedObra.empreendimentoType,
      epiCounts: epiCounts, // Estoque manual coletado
      currentFunctionCounts: currentFunctionCounts, // Efetivos coletados
      projectedFunctionCounts: projectedFunctionCounts, // Projetados coletados
      createdAt: new Date().toISOString(),
      createdBy: {
        id: user.user?.id,
        name: user.user?.name || undefined,
        email: user.user?.email || undefined,
      },
    };

    // Salvar em um estado temporário e ir para resultados
    setStep("result");
  }

  if (step === "result") {
    return <RequestForm 
      collectedData={{
        obraId: selectedObra?.id || "",
        obraName: selectedObra?.name || "",
        obraState: selectedObra?.state || "",
        obraCity: selectedObra?.city || "",
        obraType: selectedObra?.empreendimentoType || "INCORPORACAO",
        epiCounts: epiCounts,
        currentFunctionCounts: currentFunctionCounts,
        projectedFunctionCounts: projectedFunctionCounts,
        createdAt: new Date().toISOString(),
        createdBy: {
          id: user.user?.id,
          name: user.user?.name || undefined,
          email: user.user?.email || undefined,
        },
      }}
      onBack={() => setStep("function-count-projected")} 
    />;
  }

  if (step === "function-count-projected") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Etapa 3: Funcionários Projetados</h3>
            <p className="text-sm text-muted-foreground">
              Obra: {selectedObra?.name}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Informe quantos funcionários NOVOS serão contratados por função
            </p>
          </div>
          <Button variant="outline" onClick={() => setStep("function-count-current")}>
            Voltar
          </Button>
        </div>

        <div className="border rounded-lg p-4">
          <div className="text-sm font-semibold mb-4">
            Funcionários Projetados (Novos)
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Função</TableHead>
                <TableHead className="w-[150px]">Quantidade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {funcoes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-muted-foreground">
                    Nenhuma função cadastrada para este tipo de obra.
                  </TableCell>
                </TableRow>
              ) : (
                funcoes.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">{f.name}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        value={projectedFunctionCounts[f.name] || ""}
                        onChange={(e) =>
                          setProjectedFunctionCounts((prev) => ({ ...prev, [f.name]: e.target.value }))
                        }
                        placeholder="0"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={() => setStep("function-count-current")}
            disabled={isSaving}
          >
            Voltar
          </Button>
          <Button 
            onClick={handleSaveAndGoToResults}
            disabled={isSaving}
          >
            {isSaving ? "Salvando..." : "Calcular Necessidades"}
          </Button>
        </div>
      </div>
    );
  }

  if (step === "function-count-current") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Etapa 2: Funcionários Efetivos</h3>
            <p className="text-sm text-muted-foreground">
              Obra: {selectedObra?.name}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Informe quantos funcionários JÁ TRABALHAM em cada função
            </p>
          </div>
          <Button variant="outline" onClick={() => setStep("epi-count")}>
            Voltar
          </Button>
        </div>

        <div className="border rounded-lg p-4">
          <div className="text-sm font-semibold mb-4">
            Funcionários Efetivos (Atuais)
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Função</TableHead>
                <TableHead className="w-[150px]">Quantidade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {funcoes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-muted-foreground">
                    Nenhuma função cadastrada para este tipo de obra.
                  </TableCell>
                </TableRow>
              ) : (
                funcoes.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">{f.name}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        value={currentFunctionCounts[f.name] || ""}
                        onChange={(e) =>
                          setCurrentFunctionCounts((prev) => ({ ...prev, [f.name]: e.target.value }))
                        }
                        placeholder="0"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={() => setStep("epi-count")}
          >
            Voltar
          </Button>
          <Button 
            onClick={handleNextToProjectedCount}
          >
            Continuar para Projetados
          </Button>
        </div>
      </div>
    );
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
              Etapa 1: Contagem de Estoque Disponível
            </div>
            <div className="text-xs text-muted-foreground mb-4">
              Informe quanto de cada EPI está disponível na obra atualmente. Se não houver, deixe em 0 ou vazio.
            </div>

            <div className="space-y-2">
              <div className="mb-4">
                <div className="text-sm font-semibold">EPIs (estoque disponível)</div>
                <div className="mt-2">
                  <Input
                    placeholder="Pesquisar EPI..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
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
                    epiItems
                      .filter((i) => i.toLowerCase().includes(searchQuery.trim().toLowerCase()))
                      .map((item) => (
                      <TableRow key={item}>
                        <TableCell className="border border-gray-400 rounded-lg px-2 py-1">{item}</TableCell>
                        <TableCell className="border border-gray-400 rounded-lg">
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
          </div>

          <div className="flex justify-end">
            <Button onClick={handleNextToFunctionCount}>Próxima Etapa</Button>
          </div>
        </>
      )}
    </div>
  );
}
