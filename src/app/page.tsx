"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/login");
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-sky-500" />
        <span className="text-white/60 text-sm font-medium tracking-wider">
          Carregando...
        </span>
      </div>
    </div>
  );
}
