import Link from "next/link";
import { GrMoney } from "react-icons/gr";
import { IconType } from "react-icons/lib";
import {
  MdConstruction,
  MdHowToReg,
  MdOutlineRealEstateAgent,
} from "react-icons/md";
import { FaArchive, FaRegHandshake } from "react-icons/fa";
import { FaHelmetSafety } from "react-icons/fa6";


type Setor = {
  title: string;
  href: string;
  Icon: IconType;
};

const setoresData: Setor[] = [
  {
    title: "Financeiro",
    href: "/dashboard/setores/financeiro?title=Painel de Soluções - Financeiro",
    Icon: GrMoney,
  },
  {
    title: "Relacionamento",
    href: "/dashboard/setores/relacionamento?title=Painel de Soluções - Relacionamento",
    Icon: MdOutlineRealEstateAgent,
  },
  {
    title: "Entregas",
    href: "/dashboard/setores/entregas?title=Painel de Soluções - Entregas",
    Icon: MdHowToReg,
  },
  {
    title: "Obras",
    href: "/dashboard/setores/obras?title=Painel de Soluções - Obras",
    Icon: MdConstruction,
  },
    {
    title: "Comercial",
    href: "/dashboard/setores/comercial?title=Painel de Soluções - Comercial",
    Icon: FaRegHandshake,
  },
      {
    title: "SESMT",
    href: "/dashboard/setores/sesmt?title=Painel de Soluções - SESMT",
    Icon: FaHelmetSafety,
  },
        {
    title: "Administrativo",
    href: "/dashboard/setores/administrativo?title=Painel de Soluções - Administrativo",
    Icon: FaArchive,
  },
];

export default function Setores() {
  return (
    <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6 w-full h-full p-3 sm:p-4 md:p-6">
      {setoresData.map((item, index) => (
        <SetorCard
          key={index}
          title={item.title}
          href={item.href}
          Icon={item.Icon}
        />
      ))}
    </section>
  );
}

function SetorCard({ title, href, Icon }: Setor) {
  return (
    <Link
      href={href}
      className="shadow-md bg-neutral-50 text-azul-vca hover:text-verde-vca transition-colors rounded-md p-3 sm:p-4 md:p-6 aspect-square w-full text-sm sm:text-base md:text-lg font-bold flex flex-col gap-2 sm:gap-3 items-center justify-center"
    >
      <Icon className="size-12 sm:size-16 md:size-20 lg:size-24" />
      <span className="text-center">{title}</span>
    </Link>
  );
}
