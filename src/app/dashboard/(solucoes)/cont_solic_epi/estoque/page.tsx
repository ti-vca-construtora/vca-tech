"use client";

import { RouteGuard } from "@/components/route-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HistoricoSolicitacoes } from "./_components/estoque-snapshots";

export default function ContSolicEpiEstoquePage() {
  return (
    <RouteGuard requiredArea="sesmt" requiredPermission="adm-sesmt">
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Solicitações</CardTitle>
        </CardHeader>
        <CardContent>
          <HistoricoSolicitacoes />
        </CardContent>
      </Card>
    </RouteGuard>
  );
}
