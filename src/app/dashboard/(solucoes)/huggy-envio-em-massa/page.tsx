"use client";

import { RouteGuard } from "@/components/route-guard";
import { HuggyEnvioEmMassa } from "./_components/huggy-envio-em-massa";

export default function HuggyEnvioEmMassaPage() {
  return (
    <RouteGuard requiredPermission="relacionamento">
      <div className="w-full h-full flex flex-col gap-6 p-6">
        <HuggyEnvioEmMassa />
      </div>
    </RouteGuard>
  );
}
