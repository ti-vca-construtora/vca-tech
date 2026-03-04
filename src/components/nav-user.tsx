"use client";

import { LogOut, User2 } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useUser } from "@/hooks/use-user";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { memo, useMemo } from "react";

const NavUserContent = memo(() => {
  const { user, logout, isLoading } = useUser();

  const userDetails = useMemo(
    () => ({
      name: user?.name || "Usuário",
      email: user?.email || "Carregando...",
    }),
    [user?.name, user?.email],
  );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-white/[0.08] text-white/70 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all duration-200"
            >
              <Avatar className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-500 to-sky-600 flex items-center justify-center">
                <User2 className="w-4 h-4 text-white" />
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-white/90 text-[13px]">
                  {!isLoading ? userDetails.name : "Carregando..."}
                </span>
                <span className="truncate text-[11px] text-white/40">
                  {!isLoading ? userDetails.email : " "}
                </span>
              </div>
              <CaretSortIcon className="ml-auto size-4 text-white/30" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl border-slate-200/60 shadow-xl shadow-slate-200/50"
            side={"right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-3 px-3 py-3 text-left text-sm">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-sky-600 flex items-center justify-center">
                  <User2 className="w-4 h-4 text-white" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-slate-800">
                    {userDetails.name}
                  </span>
                  <span className="truncate text-xs text-slate-400">
                    {userDetails.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem
              onClick={logout}
              className="text-rose-600 focus:text-rose-600 focus:bg-rose-50 rounded-lg mx-1 my-0.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
});

NavUserContent.displayName = "NavUser";

export function NavUser() {
  return <NavUserContent />;
}
