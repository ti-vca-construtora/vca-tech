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
import { useEffect, useState } from "react";
import { User } from "@/store/auth-store";
import { RouteGuard } from "@/components/route-guard";

export default function Page() {
  const { getAllUsers, getToken, isLoading } = useUser();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      const token = getToken();

      if (!token) throw new Error("Não autenticado");

      const data = await getAllUsers(token, 1, 20);

      setUsers(data.data);
    };

    loadUsers();
  }, []);

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
            <UsersTable users={users} />
          </CardContent>
        </Card>
      </section>
    </RouteGuard>
  );
}
