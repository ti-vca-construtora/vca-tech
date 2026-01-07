"use client";

import { RouteGuard } from "@/components/route-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EstoqueSnapshots } from "./_components/estoque-snapshots";

export default function ContSolicEpiEstoquePage() {
  return (
    <RouteGuard requiredArea="sesmt" requiredPermission="adm-sesmt">
      <Card>
        <CardHeader>
          <CardTitle>Estoque (Snapshots)</CardTitle>
        </CardHeader>
        <CardContent>
          <EstoqueSnapshots />
        </CardContent>
      </Card>
    </RouteGuard>
  );
}
