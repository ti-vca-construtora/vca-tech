"use client";

import React from "react";
import { IoDocumentTextSharp } from "react-icons/io5";

import { Solucoes, SolucoesCard } from "@/components/solucoes-card";

const solucoesData: Solucoes[] = [
  {
    titulo: "Gerador de RPS",
    descricao:
      "Efetua a geração de um Recibo de Pagamento de Serviços para PF",
    Icon: IoDocumentTextSharp,
    href: "gerador-rps",
    area: "administrativo",
    permission: "gerador-rps",
  },
        {
    titulo: "Gerador de DAC",
    descricao:
      "Efetua a geração de um Documento a Classificar.",
    Icon: IoDocumentTextSharp,
    href: "gerador-dac?title=Gerador de DAC",
    area: "administrativo",
    permission: "gerador-dac",
  },  
];

const Administrativo = () => {
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

export default Administrativo;
