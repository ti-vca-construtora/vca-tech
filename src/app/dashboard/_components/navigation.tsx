"use client";

import { IoIosArrowForward } from "react-icons/io";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import classNames from "classnames";
import { Loader2 } from "lucide-react";
import { formatarRota } from "@/util";
import { useBreadcrumb } from "@/providers/breadcrumb-provider";

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
      // Recarrega a página atual
      window.location.reload();
    } else {
      // Vai para o caminho anterior
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
      <nav className="flex gap-1 w-full">
        {customBreadcrumb.map((item, index, self) => {
          return (
            <div key={index} className="flex gap-1 items-center text-sm">
              <button
                className={classNames(
                  "font-normal",
                  index + 1 === self.length
                    ? "text-azul-vca font-semibold"
                    : "text-azul-vca font-normal",
                )}
                onClick={() => item.onClick && item.onClick()}
              >
                {item.label}
              </button>
              {index + 1 === self.length || (
                <IoIosArrowForward className="text-azul-vca" />
              )}
            </div>
          );
        })}
      </nav>
    );
  }

  return formattedPathname.length ? (
    <nav className="flex gap-1 w-full">
      {formattedPathname.map((item, index, self) => {
        const itemPath = `/${formattedPathname.slice(1, index + 1).join("/")}`;
        return (
          <div key={index} className="flex gap-1 items-center text-sm">
            <button
              className={classNames(
                "font-normal",
                index + 1 === self.length
                  ? "text-azul-vca font-semibold"
                  : "text-azul-vca font-normal",
              )}
              onClick={() => handleClick(itemPath)}
            >
              {formatarRota(item)}
            </button>
            {index + 1 === self.length || (
              <IoIosArrowForward className="text-azul-vca" />
            )}
          </div>
        );
      })}
    </nav>
  ) : (
    <nav>
      <Loader2 className="animation-spin duration-1000" />
    </nav>
  );
}
