import Link from 'next/link'
import { Home, Menu, Package2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Navigation } from './navigation'
import { PiShareNetwork } from 'react-icons/pi'
import { IconType } from 'react-icons/lib'

import LogoVca from '../../../../public/assets/logo-vca.png'
import LogoVcaTech from '../../../../public/assets/logo-vca-tech.jpeg'
import Image from 'next/image'
import { UserInfo } from './user-info'

type DashboardProps = {
  children: React.ReactNode
}

type Aba = {
  text: string
  href: string
  icon: IconType
  className?: string
}

const abas: Aba[] = [
  {
    text: 'Setores',
    href: '/dashboard/setores',
    icon: PiShareNetwork,
  },
]

export function Dashboard({ children }: DashboardProps) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden bg-muted/40 md:block">
        <div className="flex h-full flex-col text-neutral-700 font-bold">
          <div className="flex items-center px-4 py-2 lg:h-[60px] bg-white">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Image width={90} src={LogoVca} alt="Logo da VCA Construtora" />
            </Link>
          </div>
          <div className="flex flex-col px-4 bg-white h-full py-6">
            <span className="text-azul-vca">Menu</span>
            <nav className="grid items-start text-sm font-medium text-azul-vca">
              {abas.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg py-2 transition-all hover:text-verde-vca font-semibold"
                >
                  <item.icon className="size-4" />
                  {item.text}
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-auto p-4 bg-white text-azul-vca">
            <UserInfo />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center border-b bg-muted/40 lg:h-[60px]">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <Link
                  href="#"
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  <Package2 className="h-6 w-6" />
                  <span className="sr-only">VCA Tech</span>
                </Link>
                <Link
                  href="#"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <Home className="h-5 w-5" />
                  Dashboard
                </Link>
              </nav>
              {/* <div className="mt-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="rounded-full"
                    >
                      <CircleUser className="h-5 w-5" />
                      <span className="sr-only">Toggle user menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Configurações</DropdownMenuItem>
                    <DropdownMenuItem>Suporte</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Sair</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div> */}
            </SheetContent>
          </Sheet>
          <div className="w-full h-full flex-1 px-4 lg:px-6 flex items-center justify-center bg-white">
            <Navigation />
          </div>
        </header>
        <main className="flex flex-1 flex-col bg-white gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex items-center shadow-md bg-neutral-100 p-4 rounded-lg">
            <h1 className="text-lg font-semibold md:text-xl text-azul-vca">
              Painel de Soluções
            </h1>
          </div>
          <div
            className="flex flex-1 items-center justify-center rounded-lg shadow-md bg-neutral-100 h-full max-h-[690px]"
            x-chunk="dashboard-02-chunk-1"
          >
            {children}
          </div>
          <div className="h-12 p-4 w-fullrounded-lg flex gap-2 items-center justify-end">
            <span className="text-xs italic">Desenvolvido por: </span>
            <Image src={LogoVcaTech} width={100} alt="Logo do VCA Tech" />
          </div>
        </main>
      </div>
    </div>
  )
}
