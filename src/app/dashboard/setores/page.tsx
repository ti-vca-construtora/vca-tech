import Link from "next/link";
import { FaArchive, FaRegHandshake } from "react-icons/fa";
import { FaHelmetSafety } from "react-icons/fa6";
import { GrMoney } from "react-icons/gr";
import { IconType } from "react-icons/lib";
import {
    MdConstruction,
    MdHowToReg,
    MdOutlineRealEstateAgent,
} from "react-icons/md";


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
      className="group relative bg-white border border-slate-200/60 hover:border-emerald-200/80 text-slate-700 hover:text-emerald-700 transition-all duration-500 rounded-2xl p-4 sm:p-5 md:p-6 aspect-square w-full text-sm sm:text-base font-bold flex flex-col gap-3 items-center justify-center overflow-hidden hover:shadow-xl hover:shadow-emerald-100/50 hover:scale-[1.03]"
    >
      {/* Hover gradient bg */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/0 to-sky-50/0 group-hover:from-emerald-50/80 group-hover:to-sky-50/60 transition-all duration-500" />
      {/* Corner glow */}
      <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-gradient-to-br from-emerald-400/0 to-sky-400/0 rounded-full blur-xl group-hover:from-emerald-400/20 group-hover:to-sky-400/20 transition-all duration-500 group-hover:scale-150" />
      
      <div className="relative flex flex-col items-center gap-3">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 group-hover:from-emerald-100 group-hover:to-sky-100 flex items-center justify-center transition-all duration-500 group-hover:shadow-lg group-hover:shadow-emerald-200/30 group-hover:scale-110 group-hover:rotate-3">
          <Icon className="size-8 sm:size-10 text-slate-400 group-hover:text-emerald-600 transition-all duration-500" />
        </div>
        <span className="text-center text-sm sm:text-base relative">{title}</span>
      </div>
    </Link>
  );
}
