"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UsersTable } from "./_components/users-table";
import { useUser } from "@/hooks/use-user";
import { RouteGuard } from "@/components/route-guard";

export default function Page() {
  const { isLoading } = useUser();

  if (isLoading)
    return (
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-azul-claro-vca"></div>
    );

  return (
    <RouteGuard
      requiredArea="settings"
      requiredPermission="manage-users"
      requiredRole="MASTER"
    >
      <section className="flex flex-col items-start gap-6 w-full h-full p-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Usuários</CardTitle>
            <CardDescription>Gerenciamento geral de usuários</CardDescription>
          </CardHeader>
          <CardContent>
            <UsersTable />
          </CardContent>
        </Card>
      </section>
    </RouteGuard>
  );
}
