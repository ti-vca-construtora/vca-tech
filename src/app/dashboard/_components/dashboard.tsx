import { ChevronRight, Menu, Settings2, SquareTerminal } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Navigation } from "./navigation";

import LogoVcaTech from "../../../../public/assets/logo-vca-tech.png";
import LogoVca from "../../../../public/assets/logo-vca.png";

import { PageTitle } from "@/components/page-title";
import { SidebarProvider } from "@/components/ui/sidebar";
import Image from "next/image";
import { Suspense } from "react";
import { DashboardSidebar } from "./sidebar";

import { MdOutlinePublic } from "react-icons/md";

type DashboardProps = {
  children: React.ReactNode;
};

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
              <SheetContent side="left" className="w-[250px] p-4">
                <nav className="flex flex-col gap-6">
                  {/* Seção Principal */}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      Principal
                    </span>
                    <Link
                      href="/dashboard/setores/publico?title=Painel de Soluções - Público"
                      className="flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium hover:bg-muted"
                    >
                      <MdOutlinePublic className="h-4 w-4" />
                      Público
                    </Link>
                  </div>

                  {/* Seção Plataforma */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      Plataforma
                    </span>

                    {/* Dropdown Setores */}
                    <details className="group">
                      <summary className="flex cursor-pointer items-center justify-between rounded-md px-2 py-2 text-sm font-medium hover:bg-muted">
                        <div className="flex items-center gap-2">
                          <SquareTerminal className="h-4 w-4" />
                          Setores
                        </div>
                        <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                      </summary>
                      <div className="ml-4 mt-1 flex flex-col gap-1">
                        <Link
                          href="/dashboard/setores/financeiro?title=Painel de Soluções - Financeiro"
                          className="rounded-md px-2 py-1 text-sm hover:bg-muted"
                        >
                          Financeiro
                        </Link>
                        <Link
                          href="/dashboard/setores/relacionamento?title=Painel de Soluções - Relacionamento"
                          className="rounded-md px-2 py-1 text-sm hover:bg-muted"
                        >
                          Relacionamento
                        </Link>
                        <Link
                          href="/dashboard/setores/entregas?title=Painel de Soluções - Entregas"
                          className="rounded-md px-2 py-1 text-sm hover:bg-muted"
                        >
                          Entregas
                        </Link>
                        <Link
                          href="/dashboard/setores/obras?title=Painel de Soluções - Obras"
                          className="rounded-md px-2 py-1 text-sm hover:bg-muted"
                        >
                          Obras
                        </Link>
                                                                        <Link
                          href="/dashboard/setores/comercial?title=Painel de Soluções - Comercial"
                          className="rounded-md px-2 py-1 text-sm hover:bg-muted"
                        >
                          Comercial
                        </Link>
                                                                                                <Link
                          href="/dashboard/setores/sesmt?title=Painel de Soluções - SESMT"
                          className="rounded-md px-2 py-1 text-sm hover:bg-muted"
                        >
                          SESMT
                        </Link>
                      </div>
                    </details>

                    {/* Dropdown Configurações */}
                    <details className="group">
                      <summary className="flex cursor-pointer items-center justify-between rounded-md px-2 py-2 text-sm font-medium hover:bg-muted">
                        <div className="flex items-center gap-2">
                          <Settings2 className="h-4 w-4" />
                          Configurações
                        </div>
                        <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                      </summary>
                      <div className="ml-4 mt-1 flex flex-col gap-1">
                        <Link
                          href="/dashboard/settings/general"
                          className="rounded-md px-2 py-1 text-sm hover:bg-muted"
                        >
                          Geral
                        </Link>
                      </div>
                    </details>
                  </div>
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
              className="flex flex-1 items-center justify-center rounded-lg shadow-md bg-neutral-100 h-full"
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
  );
}
