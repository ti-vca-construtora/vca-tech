"use client";

import { RouteGuard } from "@/components/route-guard";
import { ConfiguracoesSupabaseDemo } from "./_components/configuracoes-supabase-demo";

export default function ContSolicEpiConfiguracoesPage() {
  return (
    <RouteGuard requiredArea="sesmt" requiredPermission="adm-sesmt">
      <div className="w-full h-full flex flex-col gap-6 p-6">
        <ConfiguracoesSupabaseDemo />
      </div>
    </RouteGuard>
  );
}
