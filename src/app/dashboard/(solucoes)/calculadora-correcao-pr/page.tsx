"use client";

import { RouteGuard } from "@/components/route-guard";
import { useState, useEffect } from "react";
import { FormContainer } from "./_components/form-container";
import { Configuracoes } from "./_components/configuracoes";
import { Calculator, Settings } from "lucide-react";
import { useBreadcrumb } from "@/providers/breadcrumb-provider";

type PageView = "menu" | "calcular" | "configuracoes";

export default function CalculadoraCorrecaoPR() {
  const [currentView, setCurrentView] = useState<PageView>("menu");
  const { setCustomBreadcrumb, clearCustomBreadcrumb } = useBreadcrumb();

  useEffect(() => {
    // Listener para evento customizado de navegação
    const handleNavigateToConfig = () => {
      setCurrentView("configuracoes");
    };

    window.addEventListener("navigateToConfig", handleNavigateToConfig);

    return () => {
      window.removeEventListener("navigateToConfig", handleNavigateToConfig);
    };
  }, []);

  useEffect(() => {
    // Atualizar breadcrumb baseado na view atual
    const baseBreadcrumb = [
      { label: "Dashboard", onClick: undefined },
      {
        label: "Atualização de Valores Recebidos",
        onClick: () => setCurrentView("menu"),
      },
    ];

    if (currentView === "calcular") {
      setCustomBreadcrumb([
        ...baseBreadcrumb,
        { label: "Calcular", onClick: undefined },
      ]);
    } else if (currentView === "configuracoes") {
      setCustomBreadcrumb([
        ...baseBreadcrumb,
        { label: "Configurações", onClick: undefined },
      ]);
    } else {
      setCustomBreadcrumb(baseBreadcrumb);
    }

    // Limpar breadcrumb customizado quando componente desmontar
    return () => clearCustomBreadcrumb();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView]);

  return (
    <RouteGuard requiredArea="controladoria" requiredPermission="avp">
      <div className="w-full h-full flex flex-col p-6 gap-6">
        {currentView === "menu" ? (
          <>
            <div className="flex gap-6 w-full h-full">
              <MenuCard
                title="Calcular"
                description="Realizar cálculo de correção de parcelas"
                Icon={Calculator}
                onClick={() => setCurrentView("calcular")}
              />
              <MenuCard
                title="Configurações"
                description="Gerenciar taxas de índices mensais e parcelas a desconsiderar"
                Icon={Settings}
                onClick={() => setCurrentView("configuracoes")}
              />
            </div>
          </>
        ) : currentView === "calcular" ? (
          <div className="w-full h-full flex flex-col gap-4">
            <button
              onClick={() => setCurrentView("menu")}
              className="w-fit text-azul-claro-vca hover:text-azul-vca font-semibold flex items-center gap-2"
            >
              ← Voltar
            </button>
            <FormContainer />
          </div>
        ) : (
          <div className="w-full h-full flex flex-col gap-4">
            <button
              onClick={() => setCurrentView("menu")}
              className="w-fit text-azul-claro-vca hover:text-azul-vca font-semibold flex items-center gap-2"
            >
              ← Voltar
            </button>
            <Configuracoes />
          </div>
        )}
      </div>
    </RouteGuard>
  );
}

type MenuCardProps = {
  title: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
};

function MenuCard({ title, description, Icon, onClick }: MenuCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex-1 shadow-lg bg-white hover:bg-neutral-50 transition-all rounded-lg p-8 flex flex-col items-center justify-center gap-4 hover:shadow-xl hover:scale-105 duration-200"
    >
      <Icon className="size-24 text-azul-claro-vca" />
      <h2 className="text-xl font-bold text-azul-vca">{title}</h2>
      <p className="text-sm text-neutral-600 text-center">{description}</p>
    </button>
  );
}
