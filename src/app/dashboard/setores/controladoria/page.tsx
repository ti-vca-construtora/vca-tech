"use client";

import React from "react";
import { CiCalculator1 } from "react-icons/ci";

import { Solucoes, SolucoesCard } from "@/components/solucoes-card";

const solucoesData: Solucoes[] = [
  {
    titulo: "Atualização de Valores Recebidos",
    descricao:
      "Efetua o cálculo de atualização de valores recebidos por IPC-DI.",
    Icon: CiCalculator1,
    href: "calculadora-correcao-pr?title=Atualização de Valores Recebidos",
    area: "controladoria",
    permission: "calculadora-correcao-pr",
  },
];

const Controladoria = () => {
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

export default Controladoria;
