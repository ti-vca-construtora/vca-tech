"use client";

import { usePdf } from "@/hooks/use-pdf";
import React, { useState } from "react";

export function GeradorPdf<T extends object>({
  Component,
  props,
  fileName,
}: {
  Component: React.ComponentType<T>;
  props: T;
  fileName: string;
}) {
  const { generatePdf } = usePdf<T>({ Component, props, fileName });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleDownloadPdf = async () => {
    setIsLoading(true);
    await generatePdf();
    setIsLoading(false);
  };

  return (
    <div>
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 font-bold text-neutral-400 text-xs w-64">
          <span>Gerando PDF...</span>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-azul-escuro-vca"></div>
        </div>
      ) : (
        <button
          onClick={async () => await handleDownloadPdf()}
          className="w-32 bg-azul-claro-vca font-semibold text-white rounded py-2 px-2 text-sm hover:opacity-90 transition-opacity"
        >
          Exportar PDF
        </button>
      )}
    </div>
  );
}
