'use client'

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
import { useUser } from '@/hooks/use-user'

export function UserInfo() {
  const { logout, user } = useUser()

  return (
    <DropdownMenu>
      <div className="flex items-center gap-2">
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <CircleUser className="size-9 text-azul-vca" />
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <div className="flex flex-col justify-center">
          <DropdownMenuLabel className="text-xs h-fit p-0">
            {user && user.user}
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
