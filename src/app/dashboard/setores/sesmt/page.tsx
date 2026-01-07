"use client";

import React from "react";
import { MdSell } from "react-icons/md";

import { Solucoes, SolucoesCard } from "@/components/solucoes-card";

const solucoesData: Solucoes[] = [
  {
    titulo: "Contagem e Solicitação de EPIs",
    descricao: "Registro de contagem e solicitações de EPIs.",
    Icon: MdSell,
    href: "cont_solic_epi?title=Contagem e Solicitação de EPIs",
    area: "sesmt",
    permission: "epi",
  }
];

const Sesmt = () => {
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

export default Sesmt;
