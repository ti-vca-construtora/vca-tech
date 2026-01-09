"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  loadFuncoesAsync,
  loadEpiItemsAsync,
  saveFuncoesAsync,
  saveEpiItemsAsync,
  type FuncaoEpiConfig,
  type FuncaoEpiItem,
  normalizeText,
} from "../../_lib/cont-solic-epi-storage";
import { 
  RefreshCw, 
  Package, 
  Users, 
  FileText, 
  ChevronDown, 
  Plus, 
  Pencil, 
  Trash2,
  Search,
  Save
} from "lucide-react";
import { toast } from "sonner";

export function ConfiguracoesSupabaseDemo() {
  const [funcoes, setFuncoes] = useState<FuncaoEpiConfig[]>([]);
  const [epis, setEpis] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchEpi, setSearchEpi] = useState("");
  const [openFuncoes, setOpenFuncoes] = useState<Record<string, boolean>>({});
  
  // Estados para modais
  const [isAddEpiModalOpen, setIsAddEpiModalOpen] = useState(false);
  const [isAddEpiToFuncaoModalOpen, setIsAddEpiToFuncaoModalOpen] = useState(false);
  const [isEditEpiItemModalOpen, setIsEditEpiItemModalOpen] = useState(false);
  const [selectedFuncao, setSelectedFuncao] = useState<FuncaoEpiConfig | null>(null);
  const [selectedEpiItem, setSelectedEpiItem] = useState<{ funcao: FuncaoEpiConfig; item: FuncaoEpiItem; index: number } | null>(null);
  
  // Estados para formulários
  const [newEpiName, setNewEpiName] = useState("");
  const [newEpiToFuncao, setNewEpiToFuncao] = useState({
    epi: "",
    intervalMonths: 3,
    quantityPerEmployee: 1,
  });
  const [editEpiItem, setEditEpiItem] = useState({
    intervalMonths: 3,
    quantityPerEmployee: 1,
  });

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    try {
      setLoading(true);
      setError(null);
      
      const [funcoesData, episData] = await Promise.all([
        loadFuncoesAsync(),
        loadEpiItemsAsync(),
      ]);
      
      setFuncoes(funcoesData);
      setEpis(episData);
    } catch (err) {
      setError('Erro ao carregar dados do Supabase');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddNewEpi() {
    if (!newEpiName.trim()) {
      toast.error("Digite o nome do EPI");
      return;
    }

    const normalizedName = normalizeText(newEpiName);
    if (epis.includes(normalizedName)) {
      toast.error("Este EPI já está cadastrado");
      return;
    }

    try {
      const updatedEpis = [...epis, normalizedName].sort();
      const success = await saveEpiItemsAsync(updatedEpis);
      
      if (success) {
        setEpis(updatedEpis);
        setNewEpiName("");
        setIsAddEpiModalOpen(false);
        toast.success("EPI cadastrado com sucesso!");
      } else {
        toast.error("Erro ao cadastrar EPI");
      }
    } catch (error) {
      console.error("Erro ao adicionar EPI:", error);
      toast.error("Erro ao cadastrar EPI");
    }
  }

  async function handleAddEpiToFuncao() {
    if (!selectedFuncao || !newEpiToFuncao.epi) {
      toast.error("Preencha todos os campos");
      return;
    }

    const newItem: FuncaoEpiItem = {
      epi: newEpiToFuncao.epi,
      intervalMonths: newEpiToFuncao.intervalMonths,
      quantityPerEmployee: newEpiToFuncao.quantityPerEmployee,
    };

    const updatedFuncoes = funcoes.map(f => 
      f.id === selectedFuncao.id 
        ? { ...f, items: [...f.items, newItem] }
        : f
    );

    try {
      const success = await saveFuncoesAsync(updatedFuncoes);
      if (success) {
        setFuncoes(updatedFuncoes);
        setNewEpiToFuncao({ epi: "", intervalMonths: 3, quantityPerEmployee: 1 });
        setIsAddEpiToFuncaoModalOpen(false);
        toast.success("EPI adicionado à função!");
      } else {
        toast.error("Erro ao adicionar EPI");
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao adicionar EPI");
    }
  }

  async function handleEditEpiItem() {
    if (!selectedEpiItem) return;

    const { funcao, index } = selectedEpiItem;
    const updatedFuncoes = funcoes.map(f => {
      if (f.id === funcao.id) {
        const newItems = [...f.items];
        newItems[index] = {
          ...newItems[index],
          intervalMonths: editEpiItem.intervalMonths,
          quantityPerEmployee: editEpiItem.quantityPerEmployee,
        };
        return { ...f, items: newItems };
      }
      return f;
    });

    try {
      const success = await saveFuncoesAsync(updatedFuncoes);
      if (success) {
        setFuncoes(updatedFuncoes);
        setIsEditEpiItemModalOpen(false);
        toast.success("EPI atualizado!");
      } else {
        toast.error("Erro ao atualizar EPI");
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao atualizar EPI");
    }
  }

  async function handleRemoveEpiFromFuncao(funcao: FuncaoEpiConfig, itemIndex: number) {
    const updatedFuncoes = funcoes.map(f => 
      f.id === funcao.id 
        ? { ...f, items: f.items.filter((_, idx) => idx !== itemIndex) }
        : f
    );

    try {
      const success = await saveFuncoesAsync(updatedFuncoes);
      if (success) {
        setFuncoes(updatedFuncoes);
        toast.success("EPI removido da função");
      } else {
        toast.error("Erro ao remover EPI");
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao remover EPI");
    }
  }

  function toggleFuncao(funcaoId: string) {
    setOpenFuncoes(prev => ({ ...prev, [funcaoId]: !prev[funcaoId] }));
  }

  const filteredEpis = epis.filter(epi => 
    epi.toLowerCase().includes(searchEpi.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-2">Carregando dados do Supabase...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Erro ao Carregar</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={loadAllData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  const totalEpisNasFuncoes = funcoes.reduce((sum, f) => sum + f.items.length, 0);

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">EPIs Cadastrados</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{epis.length}</div>
            <p className="text-xs text-muted-foreground">
              Total de equipamentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funções</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{funcoes.length}</div>
            <p className="text-xs text-muted-foreground">
              Total de funções
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Relações</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEpisNasFuncoes}</div>
            <p className="text-xs text-muted-foreground">
              EPIs configurados por função
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Funções com EPIs - Collapsible */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Funções e EPIs Configurados</CardTitle>
              <CardDescription>
                Clique para expandir e gerenciar EPIs de cada função
              </CardDescription>
            </div>
            <Button onClick={loadAllData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {funcoes.map((funcao) => (
              <Collapsible
                key={funcao.id}
                open={openFuncoes[funcao.id]}
                onOpenChange={() => toggleFuncao(funcao.id)}
              >
                <div className="border rounded-lg">
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <ChevronDown 
                          className={`w-5 h-5 transition-transform ${openFuncoes[funcao.id] ? 'transform rotate-180' : ''}`} 
                        />
                        <h3 className="font-semibold">{funcao.name}</h3>
                      </div>
                      <Badge variant="secondary">{funcao.items.length} EPIs</Badge>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="border-t p-4 space-y-4">
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedFuncao(funcao);
                            setIsAddEpiToFuncaoModalOpen(true);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Adicionar EPI
                        </Button>
                      </div>
                      
                      {funcao.items.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">
                          Nenhum EPI configurado para esta função
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>EPI</TableHead>
                              <TableHead className="text-right">Intervalo Reposição</TableHead>
                              <TableHead className="text-right">Qtd por Funcionário</TableHead>
                              <TableHead className="w-[100px]">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {funcao.items.map((item, idx) => (
                              <TableRow key={idx}>
                                <TableCell className="font-medium">{item.epi}</TableCell>
                                <TableCell className="text-right">
                                  {item.intervalMonths} {item.intervalMonths === 1 ? 'mês' : 'meses'}
                                </TableCell>
                                <TableCell className="text-right">
                                  {item.quantityPerEmployee}
                                </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                          setSelectedEpiItem({ funcao, item, index: idx });
                                          setEditEpiItem({
                                            intervalMonths: item.intervalMonths,
                                            quantityPerEmployee: item.quantityPerEmployee,
                                          });
                                          setIsEditEpiItemModalOpen(true);
                                        }}
                                      >
                                        <Pencil className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleRemoveEpiFromFuncao(funcao, idx)}
                                      >
                                        <Trash2 className="w-4 h-4 text-destructive" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}

            {funcoes.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma função cadastrada ainda.</p>
                <p className="text-sm mt-2">
                  Execute o script de seed para popular o banco de dados.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de EPIs com Pesquisa */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Equipamentos Cadastrados</CardTitle>
              <CardDescription>
                {epis.length} EPIs disponíveis
              </CardDescription>
            </div>
            <Dialog open={isAddEpiModalOpen} onOpenChange={setIsAddEpiModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo EPI
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Novo EPI</DialogTitle>
                  <DialogDescription>
                    Cadastre um novo equipamento de proteção individual
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-epi-name">Nome do EPI</Label>
                    <Input
                      id="new-epi-name"
                      placeholder="Ex: CAPACETE (DETALHE AZUL)"
                      value={newEpiName}
                      onChange={(e) => setNewEpiName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddNewEpi();
                      }}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddEpiModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddNewEpi}>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar EPIs..."
              value={searchEpi}
              onChange={(e) => setSearchEpi(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {filteredEpis.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum EPI encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[400px] overflow-y-auto">
              {filteredEpis.map((epi, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 border rounded hover:bg-accent/50 transition-colors">
                  <Package className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm">{epi}</span>
                </div>
              ))}
            </div>
          )}
          
          <div className="text-xs text-muted-foreground text-center pt-2">
            Mostrando {filteredEpis.length} de {epis.length} EPIs
          </div>
        </CardContent>
      </Card>

      {/* Modal: Adicionar EPI à Função */}
      <Dialog open={isAddEpiToFuncaoModalOpen} onOpenChange={setIsAddEpiToFuncaoModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar EPI à {selectedFuncao?.name}</DialogTitle>
            <DialogDescription>
              Configure o EPI, intervalo efetivo e quantidade projetada
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="epi-select">EPI</Label>
              <Select value={newEpiToFuncao.epi} onValueChange={(value) => setNewEpiToFuncao(prev => ({ ...prev, epi: value }))}>
                <SelectTrigger id="epi-select">
                  <SelectValue placeholder="Selecione um EPI" />
                </SelectTrigger>
                <SelectContent>
                  {epis.map((epi) => (
                    <SelectItem key={epi} value={epi}>{epi}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="interval-months">Intervalo de Reposição (meses)</Label>
              <Input
                id="interval-months"
                type="number"
                step="0.01"
                min="0.1"
                value={newEpiToFuncao.intervalMonths}
                onChange={(e) => setNewEpiToFuncao(prev => ({ ...prev, intervalMonths: parseFloat(e.target.value) || 1 }))}
              />
              <p className="text-xs text-muted-foreground">
                Intervalo em meses para reposição de efetivos (ex: 3 = 1 EPI a cada 3 meses, 0.5 = 2 por mês)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity-per-employee">Quantidade por Funcionário Projetado</Label>
              <Input
                id="quantity-per-employee"
                type="number"
                min="1"
                value={newEpiToFuncao.quantityPerEmployee}
                onChange={(e) => setNewEpiToFuncao(prev => ({ ...prev, quantityPerEmployee: parseInt(e.target.value) || 1 }))}
              />
              <p className="text-xs text-muted-foreground">
                Quantidade necessária para cada novo funcionário (geralmente 1, mas pode ser 2 luvas, etc)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEpiToFuncaoModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddEpiToFuncao}>
              <Save className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Editar EPI da Função */}
      <Dialog open={isEditEpiItemModalOpen} onOpenChange={setIsEditEpiItemModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar {selectedEpiItem?.item.epi}</DialogTitle>
            <DialogDescription>
              Atualize o intervalo efetivo e quantidade projetada
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-interval-months">Intervalo de Reposição (meses)</Label>
              <Input
                id="edit-interval-months"
                type="number"
                step="0.01"
                min="0.1"
                value={editEpiItem.intervalMonths}
                onChange={(e) => setEditEpiItem(prev => ({ ...prev, intervalMonths: parseFloat(e.target.value) || 1 }))}
              />
              <p className="text-xs text-muted-foreground">
                Intervalo em meses para reposição de efetivos (ex: 3 = 1 EPI a cada 3 meses, 0.364 ≈ 2.75 por mês)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-quantity-per-employee">Quantidade por Funcionário Projetado</Label>
              <Input
                id="edit-quantity-per-employee"
                type="number"
                min="1"
                value={editEpiItem.quantityPerEmployee}
                onChange={(e) => setEditEpiItem(prev => ({ ...prev, quantityPerEmployee: parseInt(e.target.value) || 1 }))}
              />
              <p className="text-xs text-muted-foreground">
                Quantidade necessária para cada novo funcionário
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditEpiItemModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditEpiItem}>
              <Save className="w-4 h-4 mr-2" />
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
