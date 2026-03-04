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
    <div className="group/card relative w-full max-w-[560px] rounded-2xl border border-slate-200/60 bg-white p-5 transition-all duration-500 hover:shadow-xl hover:shadow-emerald-100/60 hover:border-emerald-200/80 hover:scale-[1.02] overflow-hidden">
      {/* Hover gradient background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/0 via-transparent to-sky-50/0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
      {/* Subtle corner accent */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br from-emerald-400/10 to-sky-400/10 rounded-full blur-xl opacity-0 group-hover/card:opacity-100 transition-all duration-500 group-hover/card:scale-150" />
      
      <div className="relative flex items-center gap-4">
        <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-50 to-sky-50 border border-emerald-100/50 flex items-center justify-center transition-all duration-500 group-hover/card:from-emerald-100 group-hover/card:to-sky-100 group-hover/card:shadow-lg group-hover/card:shadow-emerald-200/40 group-hover/card:scale-110 group-hover/card:rotate-3">
          <Icon className="w-6 h-6 text-emerald-600 transition-all duration-500 group-hover/card:text-emerald-700" />
        </div>
        <div className="flex flex-col gap-1 min-w-0">
          <span className="font-semibold text-slate-800 text-sm truncate group-hover/card:text-emerald-800 transition-colors duration-300">
            {titulo}
          </span>
          <span className="text-xs text-slate-500 leading-relaxed line-clamp-2">
            {descricao}
          </span>
          {!userHasAccess && (
            <span className="inline-flex items-center gap-1 text-[11px] text-rose-500 font-medium mt-0.5">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              Sem permissão de acesso
            </span>
          )}
        </div>
        {userHasAccess && (
          <div className="flex-shrink-0 ml-auto">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center transition-all duration-300 group-hover/card:bg-emerald-100 group-hover/card:shadow-md group-hover/card:shadow-emerald-200/30">
              <svg
                className="w-4 h-4 text-emerald-400 transition-all duration-300 group-hover/card:text-emerald-600 group-hover/card:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return userHasAccess ? (
    <Link href={`/dashboard/${href}`} className="block">
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
