"use client";

import React from "react";
import { CiCalculator1 } from "react-icons/ci";
import { PiPixLogo } from "react-icons/pi";
import { IoDocumentTextSharp } from "react-icons/io5";

import { Solucoes, SolucoesCard } from "@/components/solucoes-card";

const solucoesData: Solucoes[] = [
  {
    titulo: "Calculadora de Antecipação de Parcelas",
    descricao: "Efetua o cálculo de juros para antecipação de parcelas.",
    Icon: CiCalculator1,
    href: "calculadora-juros?title=AVP - Calculadora de Juros de Parcelas",
    area: "financeiro",
    permission: "avp",
  },
  {
    titulo: "Gerador de Pix",
    descricao: "Gera QR Codes individuais ou em massa identificáveis.",
    Icon: PiPixLogo,
    href: "gerador-pix?title=Gerador de Pix",
    area: "financeiro",
    permission: "gerador-pix",
  },
    {
    titulo: "Atualização de Valores Recebidos",
    descricao:
      "Efetua o cálculo de atualização de valores acumulados com índices.",
    Icon: CiCalculator1,
    href: "calculadora-correcao-pr?title=Atualização de Valores Recebidos",
    area: "financeiro",
    permission: "calculadora-correcao-pr",
  },
      {
    titulo: "Gerador de DAC",
    descricao:
      "Efetua a geração de um Documento a Classificar.",
    Icon: IoDocumentTextSharp,
    href: "gerador-dac?title=Gerador de DAC",
    area: "financeiro",
    permission: "gerador-dac",
  },  
];

const Financeiro = () => {
  return (
    <div className="flex flex-col gap-3 h-full w-full p-4">
      {solucoesData.map((item, index) => (
        <SolucoesCard
          titulo={item.titulo}
          descricao={item.descricao}
          Icon={item.Icon}
          key={index}
          href={item.href}
          area={item.area}
          permission={item.permission}
        />
      ))}
    </div>
  );
};

export default Financeiro;
