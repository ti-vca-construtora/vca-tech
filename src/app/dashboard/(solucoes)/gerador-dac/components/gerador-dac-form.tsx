"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FileText, Eye } from "lucide-react";
import { useState } from "react";
import { FormData } from "../page";

interface GeradorDACFormProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  onGeneratePreview?: () => void;
}

export function GeradorDACForm({ formData, setFormData, onGeneratePreview }: GeradorDACFormProps) {
  const { toast } = useToast();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Máscaras de formatação
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

  const maskCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    const numberValue = parseFloat(numericValue) / 100;
    
    if (isNaN(numberValue)) return "R$ 0,00";
    
    return numberValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  // Validações
  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.nomePessoa.trim())
      errors.nomePessoa = "Informe o nome da pessoa";
    if (!formData.cpfCnpjPessoa.trim()) 
      errors.cpfCnpjPessoa = "Informe o CPF ou CNPJ";
    if (!formData.valorLiquido.trim() || formData.valorLiquido === "R$ 0,00")
      errors.valorLiquido = "Informe o valor líquido";
    if (!formData.descricaoServico.trim())
      errors.descricaoServico = "Informe a descrição do serviço";
    if (!formData.nomeEmpresa.trim())
      errors.nomeEmpresa = "Informe o nome da empresa";
    if (!formData.cnpjEmpresa.trim())
      errors.cnpjEmpresa = "Informe o CNPJ da empresa";

    return errors;
  };

  const handleGeneratePreview = () => {
    const errors = validateForm();
    setFieldErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      toast({
        title: "Preencha todos os campos",
        description: "Todos os campos são obrigatórios para gerar o recibo",
        variant: "destructive",
      });
      return;
    }

    onGeneratePreview?.();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Gerador de Recibo (DAC)
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Dados do Recebedor */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase">
            Dados do Recebedor
          </h3>

          <div className="space-y-2">
            <Label htmlFor="nomePessoa">
              Nome da Pessoa <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nomePessoa"
              placeholder="Nome completo"
              value={formData.nomePessoa}
              onChange={(e) => {
                setFormData({ ...formData, nomePessoa: e.target.value });
                clearFieldError("nomePessoa");
              }}
              className={fieldErrors.nomePessoa ? "border-destructive" : ""}
            />
            {fieldErrors.nomePessoa && (
              <p className="text-xs text-destructive">{fieldErrors.nomePessoa}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpfCnpjPessoa">
              CPF ou CNPJ <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cpfCnpjPessoa"
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
              value={formData.cpfCnpjPessoa}
              onChange={(e) => {
                const masked = maskCPFCNPJ(e.target.value);
                setFormData({ ...formData, cpfCnpjPessoa: masked });
                clearFieldError("cpfCnpjPessoa");
              }}
              maxLength={18}
              className={fieldErrors.cpfCnpjPessoa ? "border-destructive" : ""}
            />
            {fieldErrors.cpfCnpjPessoa && (
              <p className="text-xs text-destructive">{fieldErrors.cpfCnpjPessoa}</p>
            )}
          </div>
        </div>

        {/* Dados do Pagamento */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase">
            Dados do Pagamento
          </h3>

          <div className="space-y-2">
            <Label htmlFor="valorLiquido">
              Valor Líquido <span className="text-destructive">*</span>
            </Label>
            <Input
              id="valorLiquido"
              placeholder="R$ 0,00"
              value={formData.valorLiquido}
              onChange={(e) => {
                const masked = maskCurrency(e.target.value);
                setFormData({ ...formData, valorLiquido: masked });
                clearFieldError("valorLiquido");
              }}
              className={fieldErrors.valorLiquido ? "border-destructive" : ""}
            />
            {fieldErrors.valorLiquido && (
              <p className="text-xs text-destructive">{fieldErrors.valorLiquido}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricaoServico">
              Descrição do Serviço <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="descricaoServico"
              placeholder="Descreva o serviço prestado"
              value={formData.descricaoServico}
              onChange={(e) => {
                setFormData({ ...formData, descricaoServico: e.target.value });
                clearFieldError("descricaoServico");
              }}
              rows={4}
              className={fieldErrors.descricaoServico ? "border-destructive" : ""}
            />
            {fieldErrors.descricaoServico && (
              <p className="text-xs text-destructive">{fieldErrors.descricaoServico}</p>
            )}
          </div>
        </div>

        {/* Dados da Empresa Pagadora */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase">
            Dados da Empresa Pagadora
          </h3>

          <div className="space-y-2">
            <Label htmlFor="nomeEmpresa">
              Nome da Empresa <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nomeEmpresa"
              placeholder="Razão social da empresa"
              value={formData.nomeEmpresa}
              onChange={(e) => {
                setFormData({ ...formData, nomeEmpresa: e.target.value });
                clearFieldError("nomeEmpresa");
              }}
              className={fieldErrors.nomeEmpresa ? "border-destructive" : ""}
            />
            {fieldErrors.nomeEmpresa && (
              <p className="text-xs text-destructive">{fieldErrors.nomeEmpresa}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cnpjEmpresa">
              CNPJ da Empresa <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cnpjEmpresa"
              placeholder="00.000.000/0000-00"
              value={formData.cnpjEmpresa}
              onChange={(e) => {
                const masked = maskCPFCNPJ(e.target.value);
                setFormData({ ...formData, cnpjEmpresa: masked });
                clearFieldError("cnpjEmpresa");
              }}
              maxLength={18}
              className={fieldErrors.cnpjEmpresa ? "border-destructive" : ""}
            />
            {fieldErrors.cnpjEmpresa && (
              <p className="text-xs text-destructive">{fieldErrors.cnpjEmpresa}</p>
            )}
          </div>
        </div>

        {/* Botão de Gerar Preview */}
        <Button
          onClick={handleGeneratePreview}
          className="w-full"
          size="lg"
        >
          <Eye className="mr-2 h-4 w-4" />
          Gerar Preview
        </Button>
      </CardContent>
    </Card>
  );
}
