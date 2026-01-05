"use client";

import { RouteGuard } from "@/components/route-guard";
import { SimuladorForm } from "./_components/simulador-form";

export default function SimuladorCaixaPage() {
  return (
    <RouteGuard requiredArea="comercial" requiredPermission="simulador-caixa">
      <div className="w-full h-full flex flex-col gap-6 p-6">
        <SimuladorForm />
      </div>
    </RouteGuard>
  );
}
