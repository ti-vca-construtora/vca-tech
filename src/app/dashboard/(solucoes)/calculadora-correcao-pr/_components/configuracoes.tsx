"use client";

import { useState } from "react";
import { TrendingUp, XCircle } from "lucide-react";
import { IpcDiManager } from "./ipc-di-manager";
import { ParcelasDesconsiderarManager } from "./parcelas-desconsiderar-manager";

type ConfigView = "menu" | "ipc-di" | "parcelas";

export function Configuracoes() {
  const [currentView, setCurrentView] = useState<ConfigView>("menu");

  if (currentView === "ipc-di") {
    return (
      <div className="w-full h-full flex flex-col gap-4">
        <button
          onClick={() => setCurrentView("menu")}
          className="w-fit text-azul-claro-vca hover:text-azul-vca font-semibold flex items-center gap-2"
        >
          ← Voltar para Configurações
        </button>
        <IpcDiManager />
      </div>
    );
  }

  if (currentView === "parcelas") {
    return (
      <div className="w-full h-full flex flex-col gap-4">
        <button
          onClick={() => setCurrentView("menu")}
          className="w-fit text-azul-claro-vca hover:text-azul-vca font-semibold flex items-center gap-2"
        >
          ← Voltar para Configurações
        </button>
        <ParcelasDesconsiderarManager />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-azul-vca">Configurações</h1>
      <div className="flex gap-6 w-full">
        <ConfigCard
          title="Índices"
          description="Gerenciar taxas mensais de índices"
          Icon={TrendingUp}
          onClick={() => setCurrentView("ipc-di")}
        />
        <ConfigCard
          title="Parcelas a Desconsiderar"
          description="Definir parcelas que não devem ser consideradas no cálculo"
          Icon={XCircle}
          onClick={() => setCurrentView("parcelas")}
        />
      </div>
    </div>
  );
}

type ConfigCardProps = {
  title: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
};

function ConfigCard({ title, description, Icon, onClick }: ConfigCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex-1 shadow-lg bg-white hover:bg-neutral-50 transition-all rounded-lg p-8 flex flex-col items-center justify-center gap-4 hover:shadow-xl hover:scale-105 duration-200"
    >
      <Icon className="size-20 text-verde-vca" />
      <h2 className="text-lg font-bold text-azul-vca">{title}</h2>
      <p className="text-sm text-neutral-600 text-center">{description}</p>
    </button>
  );
}
