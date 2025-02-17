'use client'
import * as React from 'react'
import { LayoutDashboard, Loader2, SquareTerminal } from 'lucide-react'
import { NavMain } from '@/components/nav-main'
import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import Cookies from 'js-cookie'
import { NavProjects } from '@/components/nav-projects'

const data = {
  navMain: [
    {
      title: 'Setores',
      url: '/dashboard/setores?title=Setores',
      icon: SquareTerminal,
      isActive: true,
      items: [
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
  const [user, setUser] = React.useState({
    name: '',
    email: '',
  })

  function logout(): void {
    Cookies.remove('vca-tech-authorize')

    window.location.href = '/login'
  }

  function getUserFromCookie(): string | null {
    const payload = Cookies.get('vca-tech-authorize')

    if (!payload) {
      console.log('Cookie não encontrado.')
      return null
    }

    try {
      const { user } = JSON.parse(payload)
      if (user) {
        return user
      } else {
        console.log('Usuário não encontrado no payload do cookie.')
        return null
      }
    } catch (error) {
      console.error('Erro ao analisar o payload do cookie:', error)
      return null
    }
  }

  React.useEffect(() => {
    const user = getUserFromCookie()

    if (user) {
      setUser({ name: user, email: 'email@vcaconstrutora.com.br' })
    }
  }, [])

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
        {user ? (
          <NavUser logout={logout} user={user} />
        ) : (
          <Loader2 className="animation-spin duration-1000 text-neutral-500" />
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
