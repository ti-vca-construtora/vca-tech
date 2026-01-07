"use client";

import { RouteGuard } from "@/components/route-guard";
import { EpiConfiguracoes } from "./_components/epi-configuracoes";

export default function ContSolicEpiConfiguracoesPage() {
  return (
    <RouteGuard requiredArea="sesmt" requiredPermission="adm-sesmt">
      <div className="w-full h-full flex flex-col gap-6 p-6">
        <EpiConfiguracoes />
      </div>
    </RouteGuard>
  );
}
