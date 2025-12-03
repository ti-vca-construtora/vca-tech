"use client";

import { Solucoes, SolucoesCard } from "@/components/solucoes-card";
import { MdFireTruck } from "react-icons/md";

const solucoesData: Solucoes[] = [
  {
    titulo: "Controle de Cargas",
    descricao: "Controle de cargas nas obras durante a terraplanagem.",
    Icon: MdFireTruck,
    href: "controle-cargas?title=Controle de Cargas",
    area: "obras",
    permission: "controle-cargas",
  },
];

const Obras = () => {
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

export default Obras;
