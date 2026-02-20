"use client";

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Search, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface Empresa {
  id: string;
  external_id: number;
  name: string;
  cnpj: string;
  trade_name: string;
  created_at?: string;
  updated_at?: string;
}

interface CompanySelectorProps {
  value?: string;
  onChange: (empresa: Empresa | null) => void;
  disabled?: boolean;
  className?: string;
}

export function CompanySelector({ value, onChange, disabled, className }: CompanySelectorProps) {
  const [open, setOpen] = useState(false);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    async function fetchEmpresas() {
      try {
        const response = await fetch("/api/empresas");
        if (!response.ok) throw new Error("Erro ao buscar empresas");
        const data = await response.json();
        setEmpresas(data);
      } catch (error) {
        console.error("Erro ao buscar empresas:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchEmpresas();
  }, []);

  const selectedEmpresa = empresas.find((empresa) => empresa.id === value);

  const filteredEmpresas = empresas.filter((empresa) => {
    const search = searchValue.toLowerCase();
    return (
      empresa.trade_name.toLowerCase().includes(search) ||
      empresa.name.toLowerCase().includes(search) ||
      empresa.cnpj.includes(search)
    );
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled || loading}
          type="button"
        >
          <span className="flex items-center gap-2 truncate">
            <Building2 className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">
              {loading
                ? "Carregando empresas..."
                : selectedEmpresa
                ? selectedEmpresa.trade_name
                : "Selecione uma empresa..."}
            </span>
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[500px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Buscar por nome ou CNPJ..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>Nenhuma empresa encontrada.</CommandEmpty>
            <CommandGroup>
              {filteredEmpresas.map((empresa) => (
                <CommandItem
                  key={empresa.id}
                  value={empresa.id}
                  onSelect={() => {
                    onChange(empresa);
                    setOpen(false);
                    setSearchValue("");
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === empresa.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col flex-1">
                    <span className="font-medium">{empresa.trade_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {empresa.cnpj}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
