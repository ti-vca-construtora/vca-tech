"use client";

import { RouteGuard } from "@/components/route-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SolicitarForm } from "./_components/solicitar-form";

export default function ContSolicEpiSolicitarPage() {
  return (
    <RouteGuard requiredArea="sesmt" requiredPermission="epi">
      <div className="w-full h-full flex flex-col gap-6 p-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Solicitar Equipamento</CardTitle>
          </CardHeader>
          <CardContent>
            <SolicitarForm />
          </CardContent>
        </Card>
      </div>
    </RouteGuard>
  );
}
