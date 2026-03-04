"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function PageTitle() {
  const searchParams = useSearchParams();
  const [pageTitle, setPageTitle] = useState<string | null>(null);

  useEffect(() => {
    const title = searchParams.get("title");
    setPageTitle(title);
  }, [searchParams]);

  return (
    <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm border border-slate-200/60 p-4 px-6 rounded-2xl shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-1 h-6 rounded-full bg-gradient-to-b from-emerald-500 to-sky-500" />
        <h1 className="text-lg font-semibold md:text-xl bg-gradient-to-r from-slate-800 to-emerald-700 bg-clip-text text-transparent">
          {pageTitle || "Painel de Soluções"}
        </h1>
      </div>
    </div>
  );
}
