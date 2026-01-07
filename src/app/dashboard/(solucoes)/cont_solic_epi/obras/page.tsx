"use client";

import { RouteGuard } from "@/components/route-guard";
import { ObrasConfiguracoes } from "./_components/obras-configuracoes";

export default function ContSolicEpiObrasPage() {
  return (
    <RouteGuard requiredArea="sesmt" requiredPermission="adm-sesmt">
      <div className="w-full h-full flex flex-col gap-6 p-6">
        <ObrasConfiguracoes />
      </div>
    </RouteGuard>
  );
}
