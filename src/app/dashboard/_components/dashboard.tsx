import { ChevronRight, Menu, Settings2, SquareTerminal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Navigation } from "./navigation";

import { PageTitle } from "@/components/page-title";
import { SidebarProvider } from "@/components/ui/sidebar";
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
          {/* Header */}
          <header className="sticky top-0 z-50 flex h-16 items-center border-b border-slate-200/60 bg-white/80 backdrop-blur-xl lg:h-[64px]">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 md:hidden ml-2 hover:bg-slate-100 rounded-xl"
                >
                  <Menu className="h-5 w-5 text-slate-600" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[280px] p-0 bg-gradient-to-b from-slate-900 to-emerald-950 border-r-0"
              >
                <nav className="flex flex-col gap-6 p-6 pt-8">
                  {/* Mobile nav header */}
                  <div className="mb-4 flex items-center justify-start gap-3 text-left">
                    <div className="h-9 w-9 overflow-hidden rounded-xl bg-white/10 p-1">
                      <Image
                        src="/assets/logo-vca.png"
                        alt="Logo VCA"
                        width={28}
                        height={28}
                        className="h-full w-full object-contain brightness-0 invert"
                      />
                    </div>
                    <div>
                      <h2 className="text-white font-semibold text-sm">
                        VCA Tech
                      </h2>
                      <p className="text-white/40 text-xs">Soluções</p>
                    </div>
                  </div>

                  {/* Seção Principal */}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-white/40 uppercase tracking-wider px-2 mb-2">
                      Principal
                    </span>
                    <Link
                      href="/dashboard/setores/publico?title=Painel de Soluções - Público"
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 hover:text-white hover:bg-white/[0.06] transition-all duration-200"
                    >
                      <MdOutlinePublic className="h-4 w-4" />
                      Público
                    </Link>
                  </div>

                  {/* Seção Plataforma */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-medium text-white/40 uppercase tracking-wider px-2 mb-1">
                      Plataforma
                    </span>

                    {/* Dropdown Setores */}
                    <details className="group" open>
                      <summary className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 hover:text-white hover:bg-white/[0.06] transition-all duration-200">
                        <div className="flex items-center gap-3">
                          <SquareTerminal className="h-4 w-4" />
                          Setores
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200 group-open:rotate-90" />
                      </summary>
                      <div className="ml-5 mt-1 flex flex-col gap-0.5 border-l border-white/[0.06] pl-4">
                        {[
                          { name: "Administrativo", slug: "administrativo" },
                          { name: "Comercial", slug: "comercial" },
                          { name: "Entregas", slug: "entregas" },
                          { name: "Financeiro", slug: "financeiro" },
                          { name: "Obras", slug: "obras" },
                          { name: "Relacionamento", slug: "relacionamento" },
                          { name: "SESMT", slug: "sesmt" },
                        ].map((item) => (
                          <Link
                            key={item.slug}
                            href={`/dashboard/setores/${item.slug}?title=Painel de Soluções - ${item.name}`}
                            className="rounded-lg px-3 py-2 text-sm text-white/50 hover:text-white hover:bg-white/[0.04] transition-all duration-200"
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    </details>

                    {/* Dropdown Configurações */}
                    <details className="group">
                      <summary className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 hover:text-white hover:bg-white/[0.06] transition-all duration-200">
                        <div className="flex items-center gap-3">
                          <Settings2 className="h-4 w-4" />
                          Configurações
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200 group-open:rotate-90" />
                      </summary>
                      <div className="ml-5 mt-1 flex flex-col gap-0.5 border-l border-white/[0.06] pl-4">
                        <Link
                          href="/dashboard/settings/general"
                          className="rounded-lg px-3 py-2 text-sm text-white/50 hover:text-white hover:bg-white/[0.04] transition-all duration-200"
                        >
                          Geral
                        </Link>
                      </div>
                    </details>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
            <div className="w-full h-full flex-1 px-4 lg:px-6 flex items-center gap-6">
              <Navigation />
            </div>
          </header>

          {/* Main content */}
          <main className="flex flex-1 flex-col bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 gap-5 p-4 lg:p-6">
            <Suspense
              fallback={
                <div className="h-12 rounded-2xl bg-slate-100 animate-pulse" />
              }
            >
              <PageTitle />
            </Suspense>
            <div className="flex flex-1 items-start justify-center rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-sm shadow-slate-200/50 min-h-[400px] overflow-hidden">
              {children}
            </div>
            <div className="py-3 flex gap-2 items-center justify-end">
              <span className="text-xs text-slate-400">
                Desenvolvido por
              </span>
              <span className="text-xs font-bold text-emerald-600 tracking-wide">
                VCA Tech
              </span>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
