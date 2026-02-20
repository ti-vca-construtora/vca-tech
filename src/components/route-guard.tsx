"use client";

import { memo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

export const RouteGuard = memo(
  ({
    children,
    requiredArea,
    requiredPermission,
    requiredRole,
  }: {
    children: React.ReactNode;
    requiredArea: string | string[];
    requiredPermission: string;
    requiredRole?: "MASTER" | "ADMIN" | undefined;
  }) => {
    const router = useRouter();
    const { user, isLoading, hasPermission, hasRequiredRole } = useAuthStore();

    useEffect(() => {
      if (!isLoading && !hasPermission(requiredArea, requiredPermission)) {
        router.push("/dashboard/unauthorized");
      }

      if (requiredRole && !isLoading && !hasRequiredRole(requiredRole)) {
        router.push("/dashboard/unauthorized");
      }
    }, [
      user,
      isLoading,
      router,
      requiredArea,
      requiredPermission,
      requiredRole,
    ]);

    if (isLoading)
      return (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-azul-claro-vca"></div>
      );

    if (!hasPermission(requiredArea, requiredPermission)) return null;

    return <>{children}</>;
  },
);

RouteGuard.displayName = "RouteGuard";
