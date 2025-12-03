"use client";

import { usePdf } from "@/hooks/use-pdf";
import { PiDownload } from "react-icons/pi";
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
        <div className="flex items-center justify-center gap-2 font-bold text-neutral-400  text-xs px-6">
          <span>Gerando PDF...</span>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-azul-claro-vca"></div>
        </div>
      ) : (
        <button
          onClick={async () => await handleDownloadPdf()}
          className="w-48 bg-azul-claro-vca text-white rounded flex gap-2 items-center justify-center font-bold py-1 px-3 self-end disabled:bg-gray-300"
        >
          Download PDF
          <PiDownload />
        </button>
      )}
    </div>
  );
}
