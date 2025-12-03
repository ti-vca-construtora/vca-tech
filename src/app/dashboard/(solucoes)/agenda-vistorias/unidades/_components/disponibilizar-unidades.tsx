/* eslint-disable prettier/prettier */
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/hooks/use-user";
import { Check, ChevronsUpDown, Lock, Unlock } from "lucide-react";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";

type ValidationType = "QUALITY" | "RELATIONSHIP" | "FINANCIAL";

type Unidade = {
  id: string;
  unit: string;
  block: string;
  customerName: string;
  externalId: string;
  isEnabled: boolean;
  validations: ValidationType[];
  developmentId: string;
  enterpriseName: string;
};

type Empreendimento = {
  id: string;
  name: string;
  isActive: boolean;
  units: Unidade[];
};

const DisponibilizarUnidades = () => {
  const { user } = useUser();
  const [enterprises, setEnterprises] = useState<Empreendimento[]>([]);
  const [selectedEnterprise, setSelectedEnterprise] = useState<string>("");
  const [selectedBlock, setSelectedBlock] = useState<string>("ALL");
  const [selectedCustomer, setSelectedCustomer] = useState<string>("ALL");
  const [openCustomerPopover, setOpenCustomerPopover] = useState(false);
  const [units, setUnits] = useState<Unidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    financial: false,
    quality: false,
    relationship: false,
  });
  const [selectedUnit, setSelectedUnit] = useState<string>("ALL");
  const [modifiedUnits, setModifiedUnits] = useState<
    Record<string, ValidationType[]>
  >({});
  const [isSaving, setIsSaving] = useState(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");

  // Mapear department do usuário para os tipos de validação permitidos
  const getAllowedValidations = (): ValidationType[] => {
    // Se admin está desbloqueado, liberar tudo
    if (isAdminUnlocked) {
      return ["FINANCIAL", "QUALITY", "RELATIONSHIP"];
    }

    if (!user?.department) return [];

    const departmentMap: Record<string, ValidationType[]> = {
      Financeiro: ["FINANCIAL"],
      Qualidade: ["QUALITY"],
      Entregas: ["RELATIONSHIP"],
    };

    return departmentMap[user.department] || [];
  };

  const allowedValidations = getAllowedValidations();

  // Verificar se o checkbox deve estar habilitado
  const isCheckboxEnabled = (validation: ValidationType): boolean => {
    if (isAdminUnlocked) return true;
    if (!user?.department) return false;
    return allowedValidations.includes(validation);
  };

  const handleAdminUnlock = () => {
    const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

    if (adminPassword === correctPassword) {
      setIsAdminUnlocked(true);
      setShowAdminDialog(false);
      setAdminPassword("");
      toast.success("Modo admin ativado! Todos os checkboxes liberados.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } else {
      toast.error("Senha incorreta!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      setAdminPassword("");
    }
  };

  const handleAdminLock = () => {
    setIsAdminUnlocked(false);
    toast.info("Modo admin desativado.", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  };

  const toastConfig = {
    position: "top-right" as const,
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
  };

  const errorNotifPatch = () =>
    toast.error("Falha na atualização.", toastConfig);

  const sucessNotifPatch = () =>
    toast.success("Atualização realizada.", toastConfig);

  const getEmpreendimentos = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "/api/vistorias/empreendimentos?page=1&pageSize=500&isActive=1",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Erro ao carregar empreendimentos ativos");
      }

      const data = await response.json();
      setEnterprises(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getUnitsByEnterprise = (enterpriseId: string) => {
    if (!enterpriseId) return [];

    const enterprise = enterprises.find((emp) => emp.id === enterpriseId);
    return (
      enterprise?.units?.map((u) => ({
        ...u,
        enterpriseName: enterprise.name,
      })) || []
    );
  };

  // Obter blocos únicos das unidades do empreendimento selecionado
  const getAvailableBlocks = () => {
    if (!selectedEnterprise) return [];
    const blocks = Array.from(new Set(units.map((u) => u.block)));
    return blocks.filter(Boolean).sort((a, b) => a.localeCompare(b));
  };

  // Obter unidades únicas do empreendimento selecionado
  const getAvailableUnits = () => {
    if (!selectedEnterprise) return [];
    return Array.from(units).sort((a, b) => a.unit.localeCompare(b.unit));
  };

  // Obter clientes únicos do empreendimento selecionado
  const getAvailableCustomers = () => {
    if (!selectedEnterprise) return [];
    const customers = Array.from(new Set(units.map((u) => u.customerName)));
    return customers.filter(Boolean).sort((a, b) => a.localeCompare(b));
  };

  useEffect(() => {
    getEmpreendimentos();
  }, []);

  useEffect(() => {
    if (enterprises.length > 0 && selectedEnterprise) {
      const units = getUnitsByEnterprise(selectedEnterprise);
      setUnits(units);
      setModifiedUnits({});
    } else {
      setUnits([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEnterprise, enterprises]);

  const handleEnterpriseChange = (value: string) => {
    setSelectedEnterprise(value);
    // Reset outros filtros quando mudar empreendimento
    setSelectedBlock("ALL");
    setSelectedUnit("ALL");
    setSelectedCustomer("ALL");
  };

  const hasValidation = (unit: Unidade, validation: ValidationType) => {
    if (modifiedUnits[unit.id]) {
      return modifiedUnits[unit.id].includes(validation);
    }
    return unit.validations.includes(validation);
  };

  const handleCheckboxChange = (
    unit: Unidade,
    validation: ValidationType,
    checked: boolean,
  ) => {
    setModifiedUnits((prev) => {
      const currentValidations = prev[unit.id] || unit.validations;
      const updatedValidations = checked
        ? [...currentValidations, validation]
        : currentValidations.filter((v) => v !== validation);

      // Se as validações voltarem ao estado original, remover do modifiedUnits
      const originalValidations = unit.validations;
      const isSameAsOriginal =
        updatedValidations.length === originalValidations.length &&
        updatedValidations.every((v) => originalValidations.includes(v));

      if (isSameAsOriginal) {
        const newModified = { ...prev };
        delete newModified[unit.id];
        return newModified;
      }

      return {
        ...prev,
        [unit.id]: updatedValidations,
      };
    });
  };

  const handleFilterChange = (type: keyof typeof filters, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      [type]: checked,
    }));
  };

  const handleSaveChanges = async () => {
    if (Object.keys(modifiedUnits).length === 0) return;

    console.log("🔵 [SAVE] Iniciando salvamento...");
    console.log("🔵 [SAVE] Unidades modificadas:", modifiedUnits);
    console.log(
      "🔵 [SAVE] Total de unidades a salvar:",
      Object.keys(modifiedUnits).length,
    );

    setIsSaving(true);
    try {
      for (const [unitId, validations] of Object.entries(modifiedUnits)) {
        console.log(`🟡 [SAVE] Salvando unidade ${unitId}`);
        console.log(
          `🟡 [SAVE] Validations para unidade ${unitId}:`,
          validations,
        );

        const response = await fetch(`/api/vistorias/unidades?id=${unitId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ validations }),
        });

        console.log(
          `🟢 [SAVE] Response status para ${unitId}:`,
          response.status,
        );

        if (!response.ok) {
          console.error(
            `🔴 [SAVE] Erro ao atualizar unidade ${unitId}:`,
            response.statusText,
          );
          errorNotifPatch();
          throw new Error(`Erro ao atualizar unidade ${unitId}`);
        }

        const responseData = await response.json();
        console.log(`🟢 [SAVE] Response data para ${unitId}:`, responseData);
      }

      console.log("🟢 [SAVE] Todas as unidades salvas com sucesso!");
      console.log("🟢 [SAVE] Atualizando estado local...");

      setUnits((prevUnits) =>
        prevUnits.map((unit) =>
          modifiedUnits[unit.id]
            ? { ...unit, validations: modifiedUnits[unit.id] }
            : unit,
        ),
      );

      setModifiedUnits({});
      console.log("🟢 [SAVE] Estado local atualizado!");
    } catch (error) {
      console.error("🔴 [SAVE] Erro ao salvar alterações:", error);
    } finally {
      setIsSaving(false);
    }
    sucessNotifPatch();
    console.log("🔵 [SAVE] Recarregando página em 3 segundos...");
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  };

  const filteredUnits = units
    .filter((unit) => {
      // Filtro de bloco
      if (
        selectedBlock &&
        selectedBlock !== "ALL" &&
        unit.block !== selectedBlock
      ) {
        return false;
      }

      // Filtro de unidade
      if (selectedUnit && selectedUnit !== "ALL" && unit.id !== selectedUnit) {
        return false;
      }

      // Filtro de cliente
      if (
        selectedCustomer &&
        selectedCustomer !== "ALL" &&
        unit.customerName !== selectedCustomer
      ) {
        return false;
      }

      const unitValidations = modifiedUnits[unit.id] || unit.validations;

      // Filtros de validação (checkboxes)
      if (!filters.financial && !filters.quality && !filters.relationship) {
        return true;
      }

      const matches = [];
      if (filters.financial)
        matches.push(unitValidations.includes("FINANCIAL"));
      if (filters.quality) matches.push(unitValidations.includes("QUALITY"));
      if (filters.relationship)
        matches.push(unitValidations.includes("RELATIONSHIP"));

      return matches.length > 0 && matches.every((m) => m);
    })
    .sort((a, b) => a.unit.localeCompare(b.unit)); // Ordenar por unidade alfabeticamente

  const renderUnitCards = () => {
    if (loading) {
      return <div className="text-center py-4">Carregando unidades...</div>;
    }

    if (filteredUnits.length === 0) {
      return <div className="text-center py-4">Nenhuma unidade encontrada</div>;
    }

    return filteredUnits.map((unit) => (
      <div key={unit.id} className="mt-4">
        <Card className="flex flex-row items-center justify-between">
          <CardHeader>
            <CardTitle>{unit.enterpriseName}</CardTitle>
            <CardDescription>
              {unit.unit} {unit.customerName && ` - ${unit.customerName}`}
            </CardDescription>
          </CardHeader>
          <div className="mr-6">
            <div className="flex items-center space-x-2 my-2">
              <Checkbox
                checked={hasValidation(unit, "FINANCIAL")}
                id={`financial-${unit.id}`}
                onCheckedChange={(checked) =>
                  handleCheckboxChange(unit, "FINANCIAL", checked as boolean)
                }
                disabled={!isCheckboxEnabled("FINANCIAL")}
              />
              <label
                htmlFor={`financial-${unit.id}`}
                className={`text-sm font-medium leading-none ${
                  !isCheckboxEnabled("FINANCIAL")
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
                }`}
              >
                Financeiro
              </label>
            </div>
            <div className="flex items-center space-x-2 my-2">
              <Checkbox
                checked={hasValidation(unit, "QUALITY")}
                id={`quality-${unit.id}`}
                onCheckedChange={(checked) =>
                  handleCheckboxChange(unit, "QUALITY", checked as boolean)
                }
                disabled={!isCheckboxEnabled("QUALITY")}
              />
              <label
                htmlFor={`quality-${unit.id}`}
                className={`text-sm font-medium leading-none ${
                  !isCheckboxEnabled("QUALITY")
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
                }`}
              >
                Qualidade
              </label>
            </div>
            <div className="flex items-center space-x-2 my-2">
              <Checkbox
                checked={hasValidation(unit, "RELATIONSHIP")}
                id={`relationship-${unit.id}`}
                onCheckedChange={(checked) =>
                  handleCheckboxChange(unit, "RELATIONSHIP", checked as boolean)
                }
                disabled={!isCheckboxEnabled("RELATIONSHIP")}
              />
              <label
                htmlFor={`relationship-${unit.id}`}
                className={`text-sm font-medium leading-none ${
                  !isCheckboxEnabled("RELATIONSHIP")
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
                }`}
              >
                Entregas
              </label>
            </div>
          </div>
        </Card>
      </div>
    ));
  };

  return (
    <div className="w-full">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="flex gap-2">
        {/* Filtro de Empreendimento */}
        <div className="flex-1 min-w-0">
          <h1 className="font-medium ml-1 mb-1 text-xs">Empreendimento:</h1>
          <Select
            value={selectedEnterprise}
            onValueChange={handleEnterpriseChange}
            disabled={loading}
          >
            <SelectTrigger className="bg-white w-full h-8 text-xs">
              <SelectValue placeholder="SELECIONE" className="truncate" />
            </SelectTrigger>
            <SelectContent className="cursor-pointer">
              {enterprises.map((enterprise) => (
                <SelectItem
                  className="cursor-pointer"
                  key={enterprise.id}
                  value={enterprise.id}
                >
                  {enterprise.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtro de Bloco */}
        <div className="flex-1 min-w-0">
          <h1 className="font-medium ml-1 mb-1 text-xs">Bloco:</h1>
          <Select
            value={selectedBlock}
            onValueChange={(value) => setSelectedBlock(value)}
            disabled={!selectedEnterprise}
          >
            <SelectTrigger className="bg-white w-full h-8 text-xs">
              <SelectValue placeholder="TODOS" className="truncate" />
            </SelectTrigger>
            <SelectContent className="cursor-pointer">
              <SelectItem className="cursor-pointer" value="ALL">
                TODOS OS BLOCOS
              </SelectItem>
              {getAvailableBlocks().map((block) => (
                <SelectItem
                  className="cursor-pointer"
                  key={block}
                  value={block}
                >
                  {block}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtro de Unidade */}
        <div className="flex-1 min-w-0">
          <h1 className="font-medium ml-1 mb-1 text-xs">Unidade:</h1>
          <Select
            value={selectedUnit}
            onValueChange={(value) => setSelectedUnit(value)}
            disabled={!selectedEnterprise}
          >
            <SelectTrigger className="bg-white w-full h-8 text-xs">
              <SelectValue placeholder="TODAS" className="truncate" />
            </SelectTrigger>
            <SelectContent className="cursor-pointer">
              <SelectItem className="cursor-pointer" value="ALL">
                TODAS AS UNIDADES
              </SelectItem>
              {getAvailableUnits().map((unit) => (
                <SelectItem
                  className="cursor-pointer"
                  key={unit.id}
                  value={unit.id}
                >
                  {unit.unit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtro de Cliente */}
        <div className="flex-1 min-w-0">
          <h1 className="font-medium ml-1 mb-1 text-xs">Cliente:</h1>
          <Popover
            open={openCustomerPopover}
            onOpenChange={setOpenCustomerPopover}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openCustomerPopover}
                className="w-full h-8 justify-between text-xs bg-white"
                disabled={!selectedEnterprise}
              >
                <span className="truncate">
                  {selectedCustomer === "ALL"
                    ? "TODOS"
                    : getAvailableCustomers().find(
                        (c) => c === selectedCustomer,
                      ) || "TODOS"}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput
                  placeholder="Buscar cliente..."
                  className="h-8 text-xs"
                />
                <CommandList>
                  <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="ALL"
                      onSelect={() => {
                        setSelectedCustomer("ALL");
                        setOpenCustomerPopover(false);
                      }}
                      className="text-xs"
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${
                          selectedCustomer === "ALL"
                            ? "opacity-100"
                            : "opacity-0"
                        }`}
                      />
                      TODOS OS CLIENTES
                    </CommandItem>
                    {getAvailableCustomers().map((customer) => (
                      <CommandItem
                        key={customer}
                        value={customer}
                        onSelect={() => {
                          setSelectedCustomer(customer);
                          setOpenCustomerPopover(false);
                        }}
                        className="text-xs"
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${
                            selectedCustomer === customer
                              ? "opacity-100"
                              : "opacity-0"
                          }`}
                        />
                        {customer}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Filtros de Validação */}
        <div className="w-32 min-w-0">
          <div className="flex items-center justify-between">
            <h2 className="font-medium mb-1 text-xs">Filtrar por:</h2>
            <button
              onClick={() => {
                if (isAdminUnlocked) {
                  handleAdminLock();
                } else {
                  setShowAdminDialog(true);
                }
              }}
              className="mb-1 text-xs hover:scale-110 transition-transform"
              title={
                isAdminUnlocked
                  ? "Modo Admin Ativado - Clique para desativar"
                  : "Desbloquear modo Admin"
              }
            >
              {isAdminUnlocked ? (
                <Unlock className="h-3 w-3 text-green-600" />
              ) : (
                <Lock className="h-3 w-3 text-gray-500" />
              )}
            </button>
          </div>
          <div className="flex items-center space-x-1 my-1.5">
            <Checkbox
              id="filter-financial"
              checked={filters.financial}
              onCheckedChange={(checked) =>
                handleFilterChange("financial", checked as boolean)
              }
            />
            <label
              htmlFor="filter-financial"
              className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Financeiro
            </label>
          </div>
          <div className="flex items-center space-x-1 my-1.5">
            <Checkbox
              id="filter-quality"
              checked={filters.quality}
              onCheckedChange={(checked) =>
                handleFilterChange("quality", checked as boolean)
              }
            />
            <label
              htmlFor="filter-quality"
              className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Qualidade
            </label>
          </div>
          <div className="flex items-center space-x-1 my-1.5">
            <Checkbox
              id="filter-relationship"
              checked={filters.relationship}
              onCheckedChange={(checked) =>
                handleFilterChange("relationship", checked as boolean)
              }
            />
            <label
              htmlFor="filter-relationship"
              className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Entregas
            </label>
          </div>
        </div>
      </div>

      {/* Botão de salvar alterações */}
      {Object.keys(modifiedUnits).length > 0 && (
        <div className="mt-4 flex justify-end">
          <Button onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving
              ? "Salvando..."
              : `Salvar alterações (${Object.keys(modifiedUnits).length})`}
          </Button>
        </div>
      )}

      {renderUnitCards()}

      {/* Dialog de senha admin */}
      <Dialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modo Administrador</DialogTitle>
            <DialogDescription>
              Digite a senha de administrador para desbloquear todos os
              checkboxes.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="admin-password" className="text-right text-sm">
                Senha:
              </label>
              <Input
                id="admin-password"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAdminUnlock();
                  }
                }}
                className="col-span-3"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAdminDialog(false);
                setAdminPassword("");
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleAdminUnlock}>Desbloquear</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DisponibilizarUnidades;
