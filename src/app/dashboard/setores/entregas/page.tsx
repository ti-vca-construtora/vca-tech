"use client";

import React from "react";
import { PiCalendarCheckDuotone } from "react-icons/pi";

import { Solucoes, SolucoesCard } from "@/components/solucoes-card";

const solucoesData: Solucoes[] = [
  {
    titulo: "Agenda de Vistorias",
    descricao: "Configura e relaciona a agenda de vistorias do cliente.",
    Icon: PiCalendarCheckDuotone,
    href: "agenda-vistorias?title=Agenda de Vistorias",
    area: "entregas",
    permission: "agendamento-vistorias",
  },
];
// 8
const Entregas = () => {
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

export default Entregas;
