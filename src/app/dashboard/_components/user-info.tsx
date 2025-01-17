'use client'

import Cookies from 'js-cookie'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CircleUser } from 'lucide-react'

export function UserInfo() {
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

  const user = getUserFromCookie()

  return (
    <DropdownMenu>
      <div className="flex items-center gap-2">
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <CircleUser className="size-9" />
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <div className="flex flex-col justify-center">
          <DropdownMenuLabel className="text-xs h-fit p-0">
            {user}
          </DropdownMenuLabel>
          {/* <DropdownMenuLabel className="text-xs font-normal h-fit p-0">
            email@vcaconstrutora.com.br
          </DropdownMenuLabel> */}
        </div>
      </div>
      <DropdownMenuContent align="end">
        {/* <DropdownMenuLabel>Minha Conta</DropdownMenuLabel> */}
        {/* <DropdownMenuSeparator /> */}
        {/* <DropdownMenuItem>Configurações</DropdownMenuItem> */}
        <DropdownMenuItem>Suporte</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>Sair</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
