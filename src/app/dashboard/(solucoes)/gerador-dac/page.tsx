"use client";

import { GeradorDACForm } from "./components/gerador-dac-form";
import { PreviewPDF } from "./components/preview-pdf";
import { useState } from "react";

export interface FormData {
  // Etapa 1 - Dados do Recebedor
  nomeRazaoSocial: string;
  cpf: string;
  rg: string;
  dataNascimento: string;
  nomeMae: string;
  pis: string;
  estado: string;
  municipio: string;
  
  // Dados da Empresa Pagadora
  companyId: string;
  nomeEmpresa: string;
  cnpjEmpresa: string;
  
  // Etapa 2 - Dados do Serviço e Pagamento
  descricaoServico: string;
  valorLiquido: string;
  formaPagamento: string;
  
  // Pagamento PIX
  tipoChavePix: string;
  chavePix: string;
  
  // Pagamento Bancário
  banco: string;
  tipoConta: string;
  agencia: string;
  conta: string;
  cpfCnpjConta: string;
}

export default function GeradorDACPage() {
  const [formData, setFormData] = useState<FormData>({
    nomeRazaoSocial: '',
    cpf: '',
    rg: '',
    dataNascimento: '',
    nomeMae: '',
    pis: '',
    estado: '',
    municipio: '',
    companyId: '',
    nomeEmpresa: '',
    cnpjEmpresa: '',
    descricaoServico: '',
    valorLiquido: '',
    formaPagamento: '',
    tipoChavePix: '',
    chavePix: '',
    banco: '',
    tipoConta: '',
    agencia: '',
    conta: '',
    cpfCnpjConta: ''
  });

  const [triggerGenerate, setTriggerGenerate] = useState(false);
  const [cadastroRefreshKey, setCadastroRefreshKey] = useState(0);

  const handleGeneratePreview = () => {
    setTriggerGenerate(true);
  };

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-4 md:gap-6">
      <div className="w-full lg:w-1/2">
        <GeradorDACForm 
          formData={formData} 
          setFormData={setFormData}
          onGeneratePreview={handleGeneratePreview}
          cadastroRefreshKey={cadastroRefreshKey}
        />
      </div>
      <div className="w-full lg:w-1/2">
        <PreviewPDF 
          formData={formData}
          triggerGenerate={triggerGenerate}
          onGenerateComplete={() => setTriggerGenerate(false)}
          onCadastroSaved={() => setCadastroRefreshKey(k => k + 1)}
        />
      </div>
    </div>
  );
}
