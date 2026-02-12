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
          title: "Financeiro",
          url: "/dashboard/setores/financeiro?title=Painel de Soluções - Financeiro",
        },
        {
          title: "Relacionamento",
          url: "/dashboard/setores/relacionamento?title=Painel de Soluções - Relacionamento",
        },
        {
          title: "Entregas",
          url: "/dashboard/setores/entregas?title=Painel de Soluções - Entregas",
        },
        {
          title: "Obras",
          url: "/dashboard/setores/obras?title=Painel de Soluções - Obras",
        },
                {
          title: "Comercial",
          url: "/dashboard/setores/comercial?title=Painel de Soluções - Comercial",
        },
                        {
          title: "SESMT",
          url: "/dashboard/setores/sesmt?title=Painel de Soluções - SESMT",
        },
                                {
          title: "Administrativo",
          url: "/dashboard/setores/administrativo?title=Painel de Soluções - Administrativo",
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
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={data.projects} />
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
