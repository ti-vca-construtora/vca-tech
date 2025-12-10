"use client";

import React from "react";
import { CiBank } from "react-icons/ci";

import { Solucoes, SolucoesCard } from "@/components/solucoes-card";

const solucoesData: Solucoes[] = [
  {
    titulo: "Simulador de Financiamento CAIXA",
    descricao:
      "Efetua a simulação do Financiamento Bancário do cliente.",
    Icon: CiBank,
    href: "simulador-financiamento-caixa?title=Simulador de Financiamento CAIXA",
    area: "controladoria",
    permission: "simulador-financiamento-caixa",
  },
];

const Comercial = () => {
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

export default Comercial;
