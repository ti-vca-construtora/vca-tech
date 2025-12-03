"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type BreadcrumbItem = {
  label: string;
  onClick?: () => void;
};

type BreadcrumbContextType = {
  customBreadcrumb: BreadcrumbItem[] | null;
  setCustomBreadcrumb: (breadcrumb: BreadcrumbItem[]) => void;
  clearCustomBreadcrumb: () => void;
};

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(
  undefined,
);

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [customBreadcrumb, setCustomBreadcrumb] = useState<
    BreadcrumbItem[] | null
  >(null);

  const clearCustomBreadcrumb = () => {
    setCustomBreadcrumb(null);
  };

  return (
    <BreadcrumbContext.Provider
      value={{ customBreadcrumb, setCustomBreadcrumb, clearCustomBreadcrumb }}
    >
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumb() {
  const context = useContext(BreadcrumbContext);
  if (context === undefined) {
    throw new Error("useBreadcrumb must be used within a BreadcrumbProvider");
  }
  return context;
}
