"use client";

import { RouteGuard } from "@/components/route-guard";
import { ResultadosSimulacao } from "../_components/resultados-simulacao";

export default function ResultadosSimulacaoPage() {
  return (
    <RouteGuard requiredArea="comercial" requiredPermission="comercial">
      <div className="w-full h-full flex flex-col gap-6 p-6">
        <ResultadosSimulacao />
      </div>
    </RouteGuard>
  );
}
