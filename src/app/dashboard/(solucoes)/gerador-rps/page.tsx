"use client";

import { RouteGuard } from "@/components/route-guard";
import { GeradorRPSForm } from "./components/gerador-rps-form";
import { PreviewPDF } from "./components/preview-pdf";
import { useState } from "react";

export interface FormData {
  // Etapa 1
  nomeRazaoSocial: string;
  cpf: string;
  dataNascimento: string;
  pis: string;
  estado: string;
  municipio: string;
  
  // Etapa 2
  descricaoServico: string;
  valorServico: string;
  formaPagamento: string;
  
  // Pagamento PIX
  tipoChavePix: string;
  chavePix: string;
  
  // Pagamento TED
  banco: string;
  tipoConta: string;
  agencia: string;
  conta: string;
  cpfCnpjConta: string;
  dadosTerceiros: boolean;
}

export default function GeradorRPSPage() {
  const [formData, setFormData] = useState<FormData>({
    nomeRazaoSocial: '',
    cpf: '',
    dataNascimento: '',
    pis: '',
    estado: '',
    municipio: '',
    descricaoServico: '',
    valorServico: '',
    formaPagamento: '',
    tipoChavePix: '',
    chavePix: '',
    banco: '',
    tipoConta: '',
    agencia: '',
    conta: '',
    cpfCnpjConta: '',
    dadosTerceiros: false
  });

  return (
    <RouteGuard requiredArea="administrativo" requiredPermission="gerador-rps">
      <div className="w-full h-full flex flex-col lg:flex-row gap-4 md:gap-6 p-3 sm:p-4 md:p-6">
        <div className="w-full lg:w-1/2">
          <GeradorRPSForm formData={formData} setFormData={setFormData} />
        </div>
        <div className="w-full lg:w-1/2">
          <PreviewPDF formData={formData} />
        </div>
      </div>
    </RouteGuard>
  );
}
