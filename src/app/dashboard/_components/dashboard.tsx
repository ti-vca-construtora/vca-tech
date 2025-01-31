import Link from 'next/link'
import { Home, Menu, Package2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Navigation } from './navigation'

import LogoVcaTech from '../../../../public/assets/logo-vca-tech.jpeg'
import LogoVca from '../../../../public/assets/logo-vca.png'

import Image from 'next/image'
import { DashboardSidebar } from './sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { PageTitle } from '@/components/page-title'
import { Suspense } from 'react'

type DashboardProps = {
  children: React.ReactNode
}

export function Dashboard({ children }: DashboardProps) {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <div className="grid min-h-screen w-full">
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
              </SheetContent>
            </Sheet>
            <div className="w-full h-full flex-1 px-4 lg:px-6 flex items-center justify-center gap-10 bg-white">
              <Image src={LogoVca} width={100} alt="Logo do VCA Tech" />
              <Navigation />
            </div>
          </header>
          <main className="flex flex-1 flex-col bg-white gap-4 p-4 lg:gap-6 lg:p-6">
            <Suspense fallback={<div>Carregando...</div>}>
              <PageTitle />
            </Suspense>
            <div
              className="flex flex-1 items-center justify-center rounded-lg shadow-md bg-neutral-100 h-full max-h-[690px]"
              x-chunk="dashboard-02-chunk-1"
            >
              {children}
            </div>
            <div className="h-12 p-4 rounded-lg flex gap-2 items-center justify-end">
              <span className="text-xs italic">Desenvolvido por: </span>
              <Image src={LogoVcaTech} width={100} alt="Logo do VCA Tech" />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
