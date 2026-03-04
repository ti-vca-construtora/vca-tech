"use client";

import { useBreadcrumb } from "@/providers/breadcrumb-provider";
import { formatarRota } from "@/util";
import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function Navigation() {
  const [formattedPathname, setFormattedPathname] = useState([""]);
  const pathname = usePathname();
  const router = useRouter();
  const { customBreadcrumb } = useBreadcrumb();

  const formatPathname = () => {
    const formatted = pathname.split("/");
    setFormattedPathname(formatted);
  };

  useEffect(() => {
    formatPathname();
  }, [pathname]);

  const handleClick = (itemPath: string) => {
    if (itemPath === pathname) {
      window.location.reload();
    } else {
      const previousPath = pathname.split("/").map((item, index, self) => {
        if (index < self.length - 1) {
          return item;
        }
        return "";
      });

      router.push(`${previousPath.join("/")}`);
    }
  };

  // Se houver breadcrumb customizado, exibir ele
  if (customBreadcrumb && customBreadcrumb.length > 0) {
    return (
      <nav className="flex items-center gap-1.5 w-full">
        {customBreadcrumb.map((item, index, self) => (
          <div key={index} className="flex items-center gap-1.5 text-sm">
            <button
              className={`transition-colors duration-200 ${
                index + 1 === self.length
                  ? "text-emerald-600 font-semibold"
                  : "text-slate-400 hover:text-slate-600"
              }`}
              onClick={() => item.onClick && item.onClick()}
            >
              {item.label}
            </button>
            {index + 1 !== self.length && (
              <svg
                className="w-3.5 h-3.5 text-slate-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
          </div>
        ))}
      </nav>
    );
  }

  return formattedPathname.length ? (
    <nav className="flex items-center gap-1.5 w-full">
      {formattedPathname.map((item, index, self) => {
        const itemPath = `/${formattedPathname.slice(1, index + 1).join("/")}`;
        return (
          <div key={index} className="flex items-center gap-1.5 text-sm">
            <button
              className={`transition-colors duration-200 ${
                index + 1 === self.length
                  ? "text-emerald-600 font-semibold"
                  : "text-slate-400 hover:text-slate-600"
              }`}
              onClick={() => handleClick(itemPath)}
            >
              {formatarRota(item)}
            </button>
            {index + 1 !== self.length && (
              <svg
                className="w-3.5 h-3.5 text-slate-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
          </div>
        );
      })}
    </nav>
  ) : (
    <nav className="flex items-center">
      <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
    </nav>
  );
}
