"use client";

import { GeradorDACForm } from "./components/gerador-dac-form";
import { PreviewPDF } from "./components/preview-pdf";
import { useState } from "react";

export interface FormData {
  nomePessoa: string;
  cpfCnpjPessoa: string;
  valorLiquido: string;
  descricaoServico: string;
  nomeEmpresa: string;
  cnpjEmpresa: string;
}

export default function GeradorDACPage() {
  const [formData, setFormData] = useState<FormData>({
    nomePessoa: '',
    cpfCnpjPessoa: '',
    valorLiquido: '',
    descricaoServico: '',
    nomeEmpresa: '',
    cnpjEmpresa: ''
  });

  const [triggerGenerate, setTriggerGenerate] = useState(false);

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
        />
      </div>
      <div className="w-full lg:w-1/2">
        <PreviewPDF 
          formData={formData}
          triggerGenerate={triggerGenerate}
          onGenerateComplete={() => setTriggerGenerate(false)}
        />
      </div>
    </div>
  );
}
