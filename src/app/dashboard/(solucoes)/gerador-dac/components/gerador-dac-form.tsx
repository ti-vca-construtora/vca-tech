"use client";

import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, FileText, User, Eye, Search, UserPlus, RefreshCw, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormData } from "../page";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CompanySelector, Empresa } from "@/components/company-selector";

interface GeradorDACFormProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  onGeneratePreview?: () => void;
  cadastroRefreshKey?: number;
}

interface Cadastro {
  id: string;
  nome_razao_social: string;
  cpf: string;
  rg: string;
  data_nascimento: string | null;
  nome_mae: string;
  pis: string | null;
  estado: string;
  municipio: string;
}

export function GeradorDACForm({ formData, setFormData, onGeneratePreview, cadastroRefreshKey }: GeradorDACFormProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [cadastros, setCadastros] = useState<Cadastro[]>([]);
  const [loadingCadastros, setLoadingCadastros] = useState(false);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [syncLoading, setSyncLoading] = useState(false);
  const [selectedCadastroId, setSelectedCadastroId] = useState<string | null>(null);
  const [originalCadastroData, setOriginalCadastroData] = useState<Partial<FormData> | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updatingCadastro, setUpdatingCadastro] = useState(false);

  // Carregar cadastros ao montar o componente
  useEffect(() => {
    loadCadastros();
  }, []);

  // Recarregar cadastros quando um novo PDF for gerado com sucesso
  useEffect(() => {
    if (cadastroRefreshKey && cadastroRefreshKey > 0) {
      loadCadastros();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cadastroRefreshKey]);

  const loadCadastros = async () => {
    try {
      setLoadingCadastros(true);
      const response = await fetch("/api/gerador-dac/cadastros");
      if (response.ok) {
        const data = await response.json();
        setCadastros(data);
      }
    } catch (error) {
      console.error("Erro ao carregar cadastros:", error);
    } finally {
      setLoadingCadastros(false);
    }
  };

  // Sincronizar empresas do Sienge
  const handleSyncCompanies = async () => {
    setSyncLoading(true);
    try {
      const response = await fetch("/api/empresas/sync", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao sincronizar empresas");
      }

      toast({
        title: "Sincronização concluída",
        description: `${data.stats.total} empresas processadas. ${data.stats.inserted} inseridas, ${data.stats.updated} atualizadas.`,
      });

      // Recarregar a página para atualizar o selector
      window.location.reload();
    } catch (error) {
      toast({
        title: "Erro na sincronização",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setSyncLoading(false);
    }
  };

  const handleSelectCadastro = (cadastro: Cadastro) => {
    const snapshot: Partial<FormData> = {
      nomeRazaoSocial: cadastro.nome_razao_social,
      cpf: cadastro.cpf,
      rg: cadastro.rg,
      dataNascimento: cadastro.data_nascimento || "",
      nomeMae: cadastro.nome_mae,
      pis: cadastro.pis || "",
      estado: cadastro.estado,
      municipio: cadastro.municipio,
    };
    setFormData({ ...formData, ...snapshot });
    setSelectedCadastroId(cadastro.id);
    setOriginalCadastroData(snapshot);
    setOpenCombobox(false);
    setSearchValue("");
    toast({
      title: "Cadastro selecionado",
      description: `Dados de ${cadastro.nome_razao_social} preenchidos automaticamente`,
    });
  };

  const hasCadastroDataChanged = (): boolean => {
    if (!selectedCadastroId || !originalCadastroData) return false;
    const fields: (keyof FormData)[] = ["nomeRazaoSocial", "rg", "dataNascimento", "nomeMae", "pis", "estado", "municipio"];
    return fields.some((f) => formData[f] !== originalCadastroData[f]);
  };

  const handleUpdateCadastro = async (andAdvance: () => void) => {
    if (!selectedCadastroId) { andAdvance(); return; }
    setUpdatingCadastro(true);
    try {
      const response = await fetch("/api/gerador-dac/cadastros", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedCadastroId,
          nome_razao_social: formData.nomeRazaoSocial,
          rg: formData.rg,
          data_nascimento: formData.dataNascimento || null,
          nome_mae: formData.nomeMae,
          pis: formData.pis || null,
          estado: formData.estado,
          municipio: formData.municipio,
        }),
      });
      if (response.ok) {
        setOriginalCadastroData({
          nomeRazaoSocial: formData.nomeRazaoSocial,
          cpf: formData.cpf,
          rg: formData.rg,
          dataNascimento: formData.dataNascimento,
          nomeMae: formData.nomeMae,
          pis: formData.pis,
          estado: formData.estado,
          municipio: formData.municipio,
        });
        toast({ title: "Cadastro atualizado", description: "Os dados do cadastro foram atualizados com sucesso." });
        await loadCadastros();
      } else {
        toast({ title: "Erro ao atualizar", description: "Não foi possível atualizar o cadastro.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erro ao atualizar", description: "Erro de conexão ao atualizar o cadastro.", variant: "destructive" });
    } finally {
      setUpdatingCadastro(false);
      setShowUpdateModal(false);
      andAdvance();
    }
  };

  const filteredCadastros = cadastros.filter((cadastro) =>
    cadastro.nome_razao_social.toLowerCase().includes(searchValue.toLowerCase()) ||
    cadastro.cpf.includes(searchValue)
  );

  // Máscaras de formatação
  const maskCPF = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const maskPIS = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{5})(\d)/, "$1.$2")
      .replace(/(\d{2})(\d{1})/, "$1-$2")
      .replace(/(-\d{1})\d+?$/, "$1");
  };

  const maskRG = (value: string) => {
    return value.replace(/\D/g, "").slice(0, 15);
  };

  const maskCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    const numberValue = parseFloat(numericValue) / 100;
    
    if (isNaN(numberValue)) return "R$ 0,00";
    
    return numberValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const maskAgencia = (value: string) => {
    return value.replace(/\D/g, "").slice(0, 4);
  };

  const maskConta = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 5) return cleaned;
    return cleaned.slice(0, -1) + "-" + cleaned.slice(-1);
  };

  const maskCPFCNPJ = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    
    if (cleaned.length <= 11) {
      // CPF
      return cleaned
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})/, "$1-$2")
        .replace(/(-\d{2})\d+?$/, "$1");
    } else {
      // CNPJ
      return cleaned
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1/$2")
        .replace(/(\d{4})(\d{1,2})/, "$1-$2")
        .replace(/(-\d{2})\d+?$/, "$1");
    }
  };


  // Validações
  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateEtapa1 = () => {
    const errors: Record<string, string> = {};

    if (!formData.nomeRazaoSocial.trim())
      errors.nomeRazaoSocial = "Informe o nome/razão social";
    if (!formData.cpf.trim()) errors.cpf = "Informe o CPF";
    if (!formData.rg.trim()) errors.rg = "Informe o RG";
    if (!formData.nomeMae.trim()) errors.nomeMae = "Informe o nome da mãe";
    if (!formData.estado) errors.estado = "Selecione o estado";
    if (!formData.municipio.trim()) errors.municipio = "Informe o município";
    if (!formData.companyId.trim()) errors.companyId = "Selecione uma empresa";

    return errors;
  };

  const validateEtapa2 = () => {
    const errors: Record<string, string> = {};

    // Validar campos básicos da etapa 2
    if (!formData.descricaoServico.trim())
      errors.descricaoServico = "Informe a descrição do serviço";
    if (!formData.valorLiquido.trim() || formData.valorLiquido === "R$ 0,00")
      errors.valorLiquido = "Informe o valor líquido";
    if (!formData.formaPagamento)
      errors.formaPagamento = "Selecione a forma de pagamento";

    // Validar campos condicionais de PIX
    if (formData.formaPagamento === "PIX") {
      if (!formData.tipoChavePix)
        errors.tipoChavePix = "Selecione o tipo de chave PIX";
      if (!formData.chavePix.trim())
        errors.chavePix = "Informe a chave PIX";
    }

    // Validar campos condicionais de TED
    if (formData.formaPagamento === "TED") {
      if (!formData.banco)
        errors.banco = "Selecione o banco";
      if (!formData.tipoConta)
        errors.tipoConta = "Selecione o tipo de conta";
      if (!formData.agencia.trim())
        errors.agencia = "Informe a agência";
      if (!formData.conta.trim())
        errors.conta = "Informe a conta";
      if (!formData.cpfCnpjConta.trim())
        errors.cpfCnpjConta = "Informe o CPF/CNPJ da conta";
    }

    return errors;
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      const errors = validateEtapa1();
      setFieldErrors(errors);
      
      if (Object.keys(errors).length > 0) {
        toast({
          title: "Campos obrigatórios",
          description: "Preencha todos os campos destacados",
          variant: "destructive",
        });
        return;
      }

      if (hasCadastroDataChanged()) {
        setShowUpdateModal(true);
        return;
      }
      
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setFieldErrors({});
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
    clearFieldError(field);
    // Se o usuário alterar manualmente um campo pessoal, limpar o cadastro selecionado
    // para evitar PATCH indesejado em outro registro
    const personalFields: (keyof FormData)[] = ['nomeRazaoSocial', 'cpf', 'rg', 'dataNascimento', 'nomeMae', 'pis', 'estado', 'municipio'];
    if (personalFields.includes(field as keyof FormData)) {
      setSelectedCadastroId(null);
      setOriginalCadastroData(null);
    }
  };

  const estados = [
    { value: "AC", label: "Acre" },
    { value: "AL", label: "Alagoas" },
    { value: "AP", label: "Amapá" },
    { value: "AM", label: "Amazonas" },
    { value: "BA", label: "Bahia" },
    { value: "CE", label: "Ceará" },
    { value: "DF", label: "Distrito Federal" },
    { value: "ES", label: "Espírito Santo" },
    { value: "GO", label: "Goiás" },
    { value: "MA", label: "Maranhão" },
    { value: "MT", label: "Mato Grosso" },
    { value: "MS", label: "Mato Grosso do Sul" },
    { value: "MG", label: "Minas Gerais" },
    { value: "PA", label: "Pará" },
    { value: "PB", label: "Paraíba" },
    { value: "PR", label: "Paraná" },
    { value: "PE", label: "Pernambuco" },
    { value: "PI", label: "Piauí" },
    { value: "RJ", label: "Rio de Janeiro" },
    { value: "RN", label: "Rio Grande do Norte" },
    { value: "RS", label: "Rio Grande do Sul" },
    { value: "RO", label: "Rondônia" },
    { value: "RR", label: "Roraima" },
    { value: "SC", label: "Santa Catarina" },
    { value: "SP", label: "São Paulo" },
    { value: "SE", label: "Sergipe" },
    { value: "TO", label: "Tocantins" },
  ];

  const bancos = [
    { value: "001", label: "001 - Banco do Brasil" },
    { value: "237", label: "237 - Bradesco" },
    { value: "104", label: "104 - Caixa Econômica" },
    { value: "341", label: "341 - Itaú" },
    { value: "033", label: "033 - Santander" },
    { value: "356", label: "356 - Banco Real" },
    { value: "399", label: "399 - HSBC" },
    { value: "422", label: "422 - Banco Safra" },
    { value: "453", label: "453 - Banco Rural" },
    { value: "633", label: "633 - Banco Rendimento" },
    { value: "745", label: "745 - Citibank" },
  ];

  return (
    <Card className="w-full h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Gerador de Recibo (DAC)
        </CardTitle>
        
        {/* Indicador de progresso */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs sm:text-sm ${currentStep === 1 ? "font-semibold text-primary" : "text-muted-foreground"}`}>
              <User className="inline h-4 w-4 mr-1" />
              1. Dados do Recebedor
            </span>
            <span className={`text-xs sm:text-sm ${currentStep === 2 ? "font-semibold text-primary" : "text-muted-foreground"}`}>
              <FileText className="inline h-4 w-4 mr-1" />
              2. Serviço e Pagamento
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(currentStep / 2) * 100}%` }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form className="space-y-6">
          {/* Seleção de Cadastro Existente */}
          {currentStep === 1 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-blue-900 font-semibold text-sm">
                <UserPlus className="h-4 w-4" />
                Preencher com Cadastro Existente
              </div>
              <p className="text-xs text-blue-700">
                Selecione um cadastro previamente salvo para preencher automaticamente os dados
              </p>
              {loadingCadastros ? (
                <p className="text-xs text-blue-600 italic">Carregando cadastros...</p>
              ) : cadastros.length === 0 ? (
                <p className="text-xs text-blue-600 italic">
                  Nenhum cadastro salvo ainda. Preencha os dados e gere um Recibo para salvar automaticamente.
                </p>
              ) : (
                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCombobox}
                      className="w-full justify-between"
                      type="button"
                    >
                      <span className="flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        {searchValue || "Buscar por nome ou CPF..."}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput 
                        placeholder="Buscar cadastro..." 
                        value={searchValue}
                        onValueChange={setSearchValue}
                      />
                      <CommandList>
                        <CommandEmpty>Nenhum cadastro encontrado.</CommandEmpty>
                        <CommandGroup>
                          {filteredCadastros.map((cadastro) => (
                            <CommandItem
                              key={cadastro.id}
                              value={cadastro.id}
                              onSelect={() => handleSelectCadastro(cadastro)}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">{cadastro.nome_razao_social}</span>
                                <span className="text-xs text-gray-500">CPF: {cadastro.cpf}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          )}

          {/* Etapa 1: Dados do Recebedor */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nomeRazaoSocial">
                  Nome/Razão Social <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nomeRazaoSocial"
                  value={formData.nomeRazaoSocial}
                  onChange={(e) => handleInputChange("nomeRazaoSocial", e.target.value)}
                  placeholder="Digite o nome completo ou razão social"
                  className={fieldErrors.nomeRazaoSocial ? "border-red-500" : ""}
                />
                {fieldErrors.nomeRazaoSocial && (
                  <p className="text-xs text-red-500">{fieldErrors.nomeRazaoSocial}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpf">
                    CPF <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => handleInputChange("cpf", maskCPF(e.target.value))}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className={fieldErrors.cpf ? "border-red-500" : ""}
                  />
                  {fieldErrors.cpf && <p className="text-xs text-red-500">{fieldErrors.cpf}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rg">
                    RG <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="rg"
                    value={formData.rg}
                    onChange={(e) => handleInputChange("rg", maskRG(e.target.value))}
                    placeholder="Digite o RG"
                    maxLength={15}
                    className={fieldErrors.rg ? "border-red-500" : ""}
                  />
                  {fieldErrors.rg && <p className="text-xs text-red-500">{fieldErrors.rg}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nomeMae">
                    Nome da Mãe <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nomeMae"
                    value={formData.nomeMae}
                    onChange={(e) => handleInputChange("nomeMae", e.target.value)}
                    placeholder="Digite o nome completo da mãe"
                    className={fieldErrors.nomeMae ? "border-red-500" : ""}
                  />
                  {fieldErrors.nomeMae && <p className="text-xs text-red-500">{fieldErrors.nomeMae}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataNascimento">
                    Data de Nascimento
                  </Label>
                  <Input
                    id="dataNascimento"
                    type="date"
                    value={formData.dataNascimento}
                    onChange={(e) => handleInputChange("dataNascimento", e.target.value)}
                    style={{
                      direction: 'rtl',
                      textAlign: 'left',
                    } as React.CSSProperties}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pis">
                    PIS
                  </Label>
                  <Input
                    id="pis"
                    value={formData.pis}
                    onChange={(e) => handleInputChange("pis", maskPIS(e.target.value))}
                    placeholder="000.00000.00-0"
                    maxLength={14}
                    className={fieldErrors.pis ? "border-red-500" : ""}
                  />
                  {fieldErrors.pis && <p className="text-xs text-red-500">{fieldErrors.pis}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estado">
                    Estado <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.estado}
                    onValueChange={(value) => handleInputChange("estado", value)}
                  >
                    <SelectTrigger className={fieldErrors.estado ? "border-red-500" : ""}>
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {estados.map((estado) => (
                        <SelectItem key={estado.value} value={estado.value}>
                          {estado.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldErrors.estado && (
                    <p className="text-xs text-red-500">{fieldErrors.estado}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="municipio">
                    Município <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="municipio"
                    value={formData.municipio}
                    onChange={(e) => handleInputChange("municipio", e.target.value)}
                    placeholder="Digite o município"
                    className={fieldErrors.municipio ? "border-red-500" : ""}
                  />
                  {fieldErrors.municipio && (
                    <p className="text-xs text-red-500">{fieldErrors.municipio}</p>
                  )}
                </div>
              </div>

              {/* Empresa Pagadora */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase">
                      Empresa Pagadora
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Selecione a empresa do grupo VCA que realizará o pagamento
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSyncCompanies}
                    disabled={syncLoading}
                    className="shrink-0"
                  >
                    <RefreshCw className={`mr-2 h-3 w-3 ${syncLoading ? "animate-spin" : ""}`} />
                    {syncLoading ? "Sincronizando..." : "Atualizar"}
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">
                    Selecione a Empresa <span className="text-red-500">*</span>
                  </Label>
                  <CompanySelector
                    value={formData.companyId}
                    onChange={(empresa: Empresa | null) => {
                      if (empresa) {
                        setFormData({
                          ...formData,
                          companyId: empresa.id,
                          nomeEmpresa: empresa.name,
                          cnpjEmpresa: empresa.cnpj
                        });
                        clearFieldError("companyId");
                      } else {
                        setFormData({
                          ...formData,
                          companyId: '',
                          nomeEmpresa: '',
                          cnpjEmpresa: ''
                        });
                      }
                    }}
                  />
                  {fieldErrors.companyId && (
                    <p className="text-xs text-red-500">{fieldErrors.companyId}</p>
                  )}
                </div>

                {formData.companyId && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="nomeEmpresa">
                        Nome da Empresa
                      </Label>
                      <Input
                        id="nomeEmpresa"
                        value={formData.nomeEmpresa}
                        readOnly
                        disabled
                        className="bg-muted"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cnpjEmpresa">
                        CNPJ da Empresa
                      </Label>
                      <Input
                        id="cnpjEmpresa"
                        value={formData.cnpjEmpresa}
                        readOnly
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Etapa 2: Serviço e Pagamento */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="descricaoServico">
                  Descrição do Serviço <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="descricaoServico"
                  value={formData.descricaoServico}
                  onChange={(e) => handleInputChange("descricaoServico", e.target.value)}
                  placeholder="Descreva o serviço prestado"
                  rows={4}
                  className={fieldErrors.descricaoServico ? "border-red-500" : ""}
                />
                {fieldErrors.descricaoServico && (
                  <p className="text-xs text-red-500">{fieldErrors.descricaoServico}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="valorLiquido">
                  Valor Líquido <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="valorLiquido"
                  value={formData.valorLiquido}
                  onChange={(e) => handleInputChange("valorLiquido", maskCurrency(e.target.value))}
                  placeholder="R$ 0,00"
                  className={fieldErrors.valorLiquido ? "border-red-500" : ""}
                />
                {fieldErrors.valorLiquido && (
                  <p className="text-xs text-red-500">{fieldErrors.valorLiquido}</p>
                )}
              </div>


              <div className="space-y-2">
                <Label htmlFor="formaPagamento">
                  Forma de Pagamento <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.formaPagamento}
                  onValueChange={(value) => {
                    handleInputChange("formaPagamento", value);
                    // Limpar campos de pagamento ao mudar forma
                    setFormData({
                      ...formData,
                      formaPagamento: value,
                      tipoChavePix: "",
                      chavePix: "",
                      banco: "",
                      tipoConta: "",
                      agencia: "",
                      conta: "",
                      cpfCnpjConta: "",
                    });
                  }}
                >
                  <SelectTrigger className={fieldErrors.formaPagamento ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecione a forma de pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PIX">PIX</SelectItem>
                    <SelectItem value="TED">TED - Transferência Bancária</SelectItem>
                  </SelectContent>
                </Select>
                {fieldErrors.formaPagamento && (
                  <p className="text-xs text-red-500">{fieldErrors.formaPagamento}</p>
                )}
              </div>

              {/* Campos condicionais: PIX */}
              {formData.formaPagamento === "PIX" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="tipoChavePix">
                      Tipo de Chave PIX <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.tipoChavePix}
                      onValueChange={(value) => handleInputChange("tipoChavePix", value)}
                    >
                      <SelectTrigger className={fieldErrors.tipoChavePix ? "border-red-500" : ""}>
                        <SelectValue placeholder="Selecione o tipo de chave" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CPF">CPF</SelectItem>
                        <SelectItem value="CNPJ">CNPJ</SelectItem>
                        <SelectItem value="Email">E-mail</SelectItem>
                        <SelectItem value="Telefone">Telefone</SelectItem>
                        <SelectItem value="Chave Aleatória">Chave Aleatória</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldErrors.tipoChavePix && (
                      <p className="text-xs text-red-500">{fieldErrors.tipoChavePix}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="chavePix">
                      Chave PIX <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="chavePix"
                      value={formData.chavePix}
                      onChange={(e) => handleInputChange("chavePix", e.target.value)}
                      placeholder="Digite a chave PIX"
                      className={fieldErrors.chavePix ? "border-red-500" : ""}
                    />
                    {fieldErrors.chavePix && (
                      <p className="text-xs text-red-500">{fieldErrors.chavePix}</p>
                    )}
                  </div>
                </>
              )}

              {/* Campos condicionais: TED */}
              {formData.formaPagamento === "TED" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="banco">
                      Banco <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.banco}
                      onValueChange={(value) => handleInputChange("banco", value)}
                    >
                      <SelectTrigger className={fieldErrors.banco ? "border-red-500" : ""}>
                        <SelectValue placeholder="Selecione o banco" />
                      </SelectTrigger>
                      <SelectContent>
                        {bancos.map((banco) => (
                          <SelectItem key={banco.value} value={banco.value}>
                            {banco.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldErrors.banco && <p className="text-xs text-red-500">{fieldErrors.banco}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipoConta">
                      Tipo de Conta <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.tipoConta}
                      onValueChange={(value) => handleInputChange("tipoConta", value)}
                    >
                      <SelectTrigger className={fieldErrors.tipoConta ? "border-red-500" : ""}>
                        <SelectValue placeholder="Selecione o tipo de conta" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CORRENTE">Conta Corrente</SelectItem>
                        <SelectItem value="POUPANCA">Conta Poupança</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldErrors.tipoConta && (
                      <p className="text-xs text-red-500">{fieldErrors.tipoConta}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="agencia">
                        Agência <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="agencia"
                        value={formData.agencia}
                        onChange={(e) => handleInputChange("agencia", maskAgencia(e.target.value))}
                        placeholder="0000"
                        maxLength={4}
                        className={fieldErrors.agencia ? "border-red-500" : ""}
                      />
                      {fieldErrors.agencia && (
                        <p className="text-xs text-red-500">{fieldErrors.agencia}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="conta">
                        Conta <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="conta"
                        value={formData.conta}
                        onChange={(e) => handleInputChange("conta", maskConta(e.target.value))}
                        placeholder="00000-0"
                        maxLength={10}
                        className={fieldErrors.conta ? "border-red-500" : ""}
                      />
                      {fieldErrors.conta && (
                        <p className="text-xs text-red-500">{fieldErrors.conta}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cpfCnpjConta">
                      CPF/CNPJ da Conta <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="cpfCnpjConta"
                      value={formData.cpfCnpjConta}
                      onChange={(e) => handleInputChange("cpfCnpjConta", maskCPFCNPJ(e.target.value))}
                      placeholder="000.000.000-00 ou 00.000.000/0000-00"
                      maxLength={18}
                      className={fieldErrors.cpfCnpjConta ? "border-red-500" : ""}
                    />
                    {fieldErrors.cpfCnpjConta && (
                      <p className="text-xs text-red-500">{fieldErrors.cpfCnpjConta}</p>
                    )}
                  </div>

                </>
              )}
            </div>
          )}

          {/* Botões de navegação */}
          <div className="flex justify-between pt-4 border-t">
            {currentStep > 1 ? (
              <Button type="button" variant="outline" onClick={handlePrevStep}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 2 && (
              <Button type="button" onClick={handleNextStep} className="ml-auto">
                Próximo
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}

            {currentStep === 2 && (
              <Button 
                type="button" 
                onClick={() => {
                  const errors = validateEtapa2();
                  setFieldErrors(errors);
                  
                  if (Object.keys(errors).length > 0) {
                    toast({
                      title: "Campos obrigatórios",
                      description: "Preencha todos os campos destacados antes de gerar o preview",
                      variant: "destructive",
                    });
                    return;
                  }
                  
                  onGeneratePreview?.();
                }} 
                className="ml-auto"
              >
                <Eye className="mr-2 h-4 w-4" />
                Gerar Preview
              </Button>
            )}
          </div>
        </form>

        {/* Modal de confirmação de atualização de cadastro */}
        <Dialog open={showUpdateModal} onOpenChange={setShowUpdateModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Dados alterados
              </DialogTitle>
              <DialogDescription>
                Você alterou dados de um cadastro existente. Deseja atualizar o cadastro salvo com os novos dados?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowUpdateModal(false);
                  setCurrentStep(2);
                }}
                disabled={updatingCadastro}
              >
                Não, manter original
              </Button>
              <Button
                onClick={() => handleUpdateCadastro(() => setCurrentStep(2))}
                disabled={updatingCadastro}
              >
                {updatingCadastro ? "Atualizando..." : "Sim, atualizar cadastro"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
