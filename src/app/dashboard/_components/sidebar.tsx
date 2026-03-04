"use client";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Settings2, SquareTerminal } from "lucide-react";
import Image from "next/image";
import { MdOutlinePublic } from "react-icons/md";
import { deleteExpiredReservations } from "../(solucoes)/reserva-patinete/_components/deleteReservations";

import * as React from "react";

const data = {
  navMain: [
    {
      title: "Setores",
      url: "/dashboard/setores?title=Setores",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Administrativo",
          url: "/dashboard/setores/administrativo?title=Painel de Soluções - Administrativo",
        },
        {
          title: "Comercial",
          url: "/dashboard/setores/comercial?title=Painel de Soluções - Comercial",
        },
        {
          title: "Entregas",
          url: "/dashboard/setores/entregas?title=Painel de Soluções - Entregas",
        },
        {
          title: "Financeiro",
          url: "/dashboard/setores/financeiro?title=Painel de Soluções - Financeiro",
        },
        {
          title: "Obras",
          url: "/dashboard/setores/obras?title=Painel de Soluções - Obras",
        },
        {
          title: "Relacionamento",
          url: "/dashboard/setores/relacionamento?title=Painel de Soluções - Relacionamento",
        },
        {
          title: "SESMT",
          url: "/dashboard/setores/sesmt?title=Painel de Soluções - SESMT",
        },
      ],
    },
    {
      title: "Configurações",
      url: "/dashboard/settings",
      icon: Settings2,
      isActive: true,
      items: [
        {
          title: "Geral",
          url: "/dashboard/settings/general",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Público",
      url: "/dashboard/setores/publico?title=Painel de Soluções - Público",
      icon: MdOutlinePublic,
    },
  ],
};

export function DashboardSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  deleteExpiredReservations();
  return (
    <Sidebar
      collapsible="icon"
      className="border-r-0 bg-gradient-to-b from-slate-900 to-emerald-950"
      {...props}
    >
      <SidebarHeader className="relative p-4">
        <div className="flex w-full items-center justify-start gap-3 pr-8 text-left group-data-[collapsible=icon]:hidden">
          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-xl bg-white/10 p-1">
            <Image
              src="/assets/logo-vca.png"
              alt="Logo VCA"
              width={28}
              height={28}
              className="h-full w-full object-contain brightness-0 invert"
            />
          </div>
          <div className="group-data-[collapsible=icon]:hidden overflow-hidden">
            <h2 className="text-white font-semibold text-sm truncate">
              VCA Tech
            </h2>
            <p className="text-white/40 text-[11px] truncate">Soluções</p>
          </div>
        </div>
        <SidebarTrigger className="absolute right-3 top-3 z-10 text-white/50 hover:bg-white/[0.06] hover:text-white" />
      </SidebarHeader>
      <SidebarContent className="px-2">
        <NavProjects projects={data.projects} />
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter className="border-t border-white/[0.06] p-2">
        <NavUser />
      </SidebarFooter>
      <SidebarRail className="bg-white/[0.02] hover:bg-white/[0.04]" />
    </Sidebar>
  );
}
