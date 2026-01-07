"use client";

import { RouteGuard } from "@/components/route-guard";

export default function ContSolicEpiPage() {
  return (
    <RouteGuard requiredArea="sesmt" requiredPermission="epi">
      <div className="w-full h-full flex flex-col gap-6 p-6">
        <ContSolicEpi />
      </div>
    </RouteGuard>
  );
}
