"use client";

import { usePermissions } from "@/hooks/use-permissions";
import Link from "next/link";
import { IconType } from "react-icons";

export type Solucoes = {
  titulo: string;
  descricao: string;
  href: string;
  Icon: IconType;
  area: string;
  permission: string;
};

export function SolucoesCard({
  titulo,
  descricao,
  Icon,
  href,
  area,
  permission,
}: Solucoes) {
  const { hasPermission } = usePermissions();

  const userHasAccess = hasPermission(area, permission);

  const cardContent = (
    <div className="w-[480px] h-28 shadow-md bg-neutral-50 transition-colors rounded flex items-center gap-3 p-2">
      <div className="text-6xl shadow-md rounded p-4">
        <Icon />
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-bold">{titulo}</span>
        <span className="text-xs">{descricao}</span>
        {!userHasAccess && (
          <span className="text-xs text-red-500">Sem permissão de acesso</span>
        )}
      </div>
    </div>
  );

  return userHasAccess ? (
    <Link
      href={`/dashboard/${href}`}
      className={`hover:text-verde-vca ${userHasAccess ? "text-azul-vca" : "text-gray-400"}`}
    >
      {cardContent}
    </Link>
  ) : (
    <div
      className="cursor-not-allowed opacity-50"
      title="Você não tem permissão para acessar"
    >
      {cardContent}
    </div>
  );
}
