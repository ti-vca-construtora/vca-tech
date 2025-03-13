'use client'
import * as React from 'react'
import { LayoutDashboard, SquareTerminal } from 'lucide-react'
import { NavMain } from '@/components/nav-main'
// import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { NavProjects } from '@/components/nav-projects'
// import { useUser } from '@/hooks/use-user'

const data = {
  navMain: [
    {
      title: 'Setores',
      url: '/dashboard/setores?title=Setores',
      icon: SquareTerminal,
      isActive: true,
      items: [
        // {
        //   title: 'Diretoria',
        //   url: '/dashboard/setores/diretoria?title=Painel de Soluções - Diretoria',
        // },
        {
          title: 'Financeiro',
          url: '/dashboard/setores/financeiro?title=Painel de Soluções - Financeiro',
        },
        {
          title: 'Relacionamento',
          url: '/dashboard/setores/relacionamento?title=Painel de Soluções - Relacionamento',
        },
      ],
    },
    // {
    //   title: 'Configurações',
    //   url: '/dashboard/settings',
    //   icon: Settings2,
    //   items: [
    //     {
    //       title: 'Geral',
    //       url: '/dashboard/settings/general',
    //     },
    //     {
    //       title: 'Conta',
    //       url: '/dashboard/settings/account',
    //     },
    //   ],
    // },
  ],
  projects: [
    {
      name: 'Dashboard',
      url: '/dashboard',
      icon: LayoutDashboard,
    },
  ],
}

export function DashboardSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  // const { user, logout } = useUser()

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
        {/* {user ? (
          <NavUser
            logout={logout}
            user={{ name: user.name || 'Sem nome', email: user.email }}
          />
        ) : (
          <Loader2 className="animate-spin duration-300 text-neutral-500" />
        )} */}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
