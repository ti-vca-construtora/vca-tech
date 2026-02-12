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
import { ChevronLeft, ChevronRight, FileText, User, Calculator, Eye } from "lucide-react";
import { useState, useMemo } from "react";
import { FormData } from "../page";

interface GeradorRPSFormProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  onGeneratePreview?: () => void;
}

export function GeradorRPSForm({ formData, setFormData, onGeneratePreview }: GeradorRPSFormProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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

  // Calcular impostos
  const parseMonetaryValue = (value: string): number => {
    const cleaned = value.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  };

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const taxCalculation = useMemo(() => {
    const valorLiquido = parseMonetaryValue(formData.valorServico);
    if (valorLiquido <= 0) return null;

    const valorBruto = valorLiquido / 0.89;
    const imposto = valorBruto - valorLiquido;

    return {
      valorLiquido,
      valorBruto,
      imposto
    };
  }, [formData.valorServico]);

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
    if (!formData.pis.trim()) errors.pis = "Informe o PIS";
    if (!formData.estado) errors.estado = "Selecione o estado";
    if (!formData.municipio.trim()) errors.municipio = "Informe o município";

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
          Gerador de RPS
        </CardTitle>
        
        {/* Indicador de progresso */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs sm:text-sm ${currentStep === 1 ? "font-semibold text-primary" : "text-muted-foreground"}`}>
              <User className="inline h-4 w-4 mr-1" />
              1. Dados do Prestador
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
          {/* Etapa 1: Dados do Prestador */}
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
                    PIS <span className="text-red-500">*</span>
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
                <Label htmlFor="valorServico">
                  Valor do Serviço (Líquido) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="valorServico"
                  value={formData.valorServico}
                  onChange={(e) => handleInputChange("valorServico", maskCurrency(e.target.value))}
                  placeholder="R$ 0,00"
                  className={fieldErrors.valorServico ? "border-red-500" : ""}
                />
                {fieldErrors.valorServico && (
                  <p className="text-xs text-red-500">{fieldErrors.valorServico}</p>
                )}
              </div>

              {/* Card de cálculo de impostos */}
              {taxCalculation && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-blue-900 font-semibold text-sm mb-2">
                    <Calculator className="h-4 w-4" />
                    Cálculo de Impostos (11%)
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Valor Bruto:</span>
                      <span className="font-semibold">{formatCurrency(taxCalculation.valorBruto)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">(-) Imposto Retido:</span>
                      <span className="font-semibold text-red-600">{formatCurrency(taxCalculation.imposto)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-blue-300">
                      <span className="text-gray-900 font-bold">Valor Líquido:</span>
                      <span className="font-bold text-green-600">{formatCurrency(taxCalculation.valorLiquido)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    * Cálculo: Valor Líquido / 0,89 = Valor Bruto
                  </p>
                </div>
              )}

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
                      dadosTerceiros: false,
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
                        <SelectItem value="EMAIL">E-mail</SelectItem>
                        <SelectItem value="TELEFONE">Telefone</SelectItem>
                        <SelectItem value="ALEATORIA">Chave Aleatória</SelectItem>
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
                onClick={onGeneratePreview} 
                className="ml-auto"
              >
                <Eye className="mr-2 h-4 w-4" />
                Gerar Preview
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
