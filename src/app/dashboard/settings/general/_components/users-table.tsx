"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore, User } from "@/store/auth-store";
import {
  Check,
  ChevronsUpDown,
  KeyRound,
  ChevronLeft,
  ChevronRight,
  Lock,
  Loader2,
  MoreHorizontalIcon,
  Search,
  ShieldCheck,
  X,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Lista de áreas da empresa. Idealmente, viria de uma API ou constante central.
const AREAS = [
  "comercial",
  "financeiro",
  "relacionamento",
  "entregas",
  "obras",
];

// Lista de permissões disponíveis, baseada nos `requiredPermission` dos `RouteGuard`.
// Permissões baseadas nas soluções fornecidas
const ALL_PERMISSIONS = [
  "calculadora-correcao-pr",
  "agendamento-vistorias",
  "avp",
  "controle-cargas",
  "gerador-pix",
];

// Helper component for managing permissions
function ManagePermissionsDialog({
  user,
  isOpen,
  onOpenChange,
}: {
  user: User | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const areaRef = useRef<HTMLDivElement>(null);
  const permissionsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { token } = useAuthStore();
  const [area, setArea] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openArea, setOpenArea] = useState(false);
  const [openPermissions, setOpenPermissions] = useState(false);
  const [userPermissions, setUserPermissions] = useState<any[]>([]);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (openArea && areaRef.current && !areaRef.current.contains(event.target as Node)) {
        setOpenArea(false);
      }
      if (openPermissions && permissionsRef.current && !permissionsRef.current.contains(event.target as Node)) {
        setOpenPermissions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openArea, openPermissions]);

  const fetchPermissions = async () => {
    if (!user) return;
    setIsLoadingPermissions(true);
    try {
      const response = await fetch(`https://api.suportevca.com.br/users/${user.id}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUserPermissions(data.data?.permissions || []);
      }
    } catch (error) {
      console.error("Erro ao buscar permissões:", error);
    } finally {
      setIsLoadingPermissions(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setArea("");
      setPermissions([]);
      setUserPermissions([]);
    } else if (user) {
      fetchPermissions();
    }
  }, [isOpen, user]);

  const handleDeletePermission = async (id: string) => {
    if (!user) return;
    try {
      const response = await fetch(`https://api.suportevca.com.br/permissions/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Falha ao remover permissão.");
      }

      toast({
        title: "Sucesso!",
        description: "Permissão removida com sucesso.",
      });
      fetchPermissions();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover a permissão.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);

    // Se nenhuma permissão for selecionada, usa a área como permissão
    const permissionsToSend = permissions.length > 0 ? permissions : area ? [area] : [];

    try {
      const response = await fetch("https://api.suportevca.com.br/permissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          area,
          permissions: permissionsToSend,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao definir permissões.");
      }

      toast({
        title: "Sucesso!",
        description: `Permissões para ${user.name} atualizadas.`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gerenciar Permissões para {user?.name}</DialogTitle>
          <DialogDescription>
            Defina a área e as permissões para o usuário.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Área - Combobox minimalista */}
          <div className="space-y-1" ref={areaRef}>
            <Label className="text-sm font-medium text-gray-700">Área</Label>
            <div className="relative">
              <button
                type="button"
                className={cn(
                  "w-full flex items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-primary/40",
                  area ? "font-semibold" : "text-gray-400 font-normal"
                )}
                onClick={() => setOpenArea((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={openArea}
              >
                {area ? AREAS.find((a) => a.toLowerCase() === area) : "Selecione uma área..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 text-gray-400" />
              </button>
              {openArea && (
                <ul
                  className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg max-h-48 overflow-auto animate-fade-in"
                  tabIndex={-1}
                  role="listbox"
                >
                  {AREAS.map((a) => (
                    <li
                      key={a}
                      className={cn(
                        "cursor-pointer px-4 py-2 text-sm hover:bg-primary/10 transition flex items-center gap-2",
                        area === a.toLowerCase() && "bg-primary/10 text-primary font-semibold"
                      )}
                      aria-selected={area === a.toLowerCase()}
                      onClick={() => {
                        setArea(a.toLowerCase() === area ? "" : a.toLowerCase());
                        setOpenArea(false);
                      }}
                    >
                      <Check className={cn("h-4 w-4", area === a.toLowerCase() ? "opacity-100 text-primary" : "opacity-0")}/>
                      {a}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Permissões - Combobox minimalista multi-select, apenas soluções */}
          <div className="space-y-1" ref={permissionsRef}>
            <Label className="text-sm font-medium text-gray-700">Permissões (Soluções)</Label>
            <div className="relative">
              <button
                type="button"
                className={cn(
                  "w-full flex min-h-10 items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-primary/40",
                  permissions.length ? "font-semibold" : "text-gray-400 font-normal"
                )}
                onClick={() => setOpenPermissions((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={openPermissions}
              >
                <div className="flex flex-wrap gap-1.5 items-center">
                  {permissions.length > 0 ? (
                    permissions.map((p) => (
                      <span
                        key={p}
                        className="inline-flex items-center rounded bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium mr-1"
                      >
                        {p}
                        <button
                          type="button"
                          aria-label={`Remover ${p}`}
                          className="ml-1 text-gray-400 hover:text-red-500 focus:outline-none"
                          tabIndex={-1}
                          onClick={e => {
                            e.stopPropagation();
                            setPermissions((prev) => prev.filter((item) => item !== p));
                          }}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400">Selecione as soluções...</span>
                  )}
                </div>
                <ChevronsUpDown className="ml-2 h-4 w-4 text-gray-400" />
              </button>
              {openPermissions && (
                <ul
                  className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg max-h-48 overflow-auto animate-fade-in"
                  tabIndex={-1}
                  role="listbox"
                >
                  {ALL_PERMISSIONS.map((p) => (
                    <li
                      key={p}
                      className={cn(
                        "cursor-pointer px-4 py-2 text-sm hover:bg-primary/10 transition flex items-center gap-2",
                        permissions.includes(p) && "bg-primary/10 text-primary font-semibold"
                      )}
                      aria-selected={permissions.includes(p)}
                      onClick={() => {
                        setPermissions((prev) =>
                          prev.includes(p)
                            ? prev.filter((item) => item !== p)
                            : [...prev, p]
                        );
                      }}
                    >
                      <Check className={cn("h-4 w-4", permissions.includes(p) ? "opacity-100 text-primary" : "opacity-0")}/>
                      {p}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Lista de Permissões Existentes */}
          <div className="pt-4 border-t">
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Permissões Atuais</Label>
            {isLoadingPermissions ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : userPermissions.length > 0 ? (
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                {userPermissions.map((perm: any) => (
                  <div key={perm.id} className="flex items-center justify-between p-2 rounded-md border bg-gray-50">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-sm capitalize">{perm.area}</span>
                      <div className="flex flex-wrap gap-1">
                        {perm.permissions.map((p: string) => (
                          <Badge key={p} variant="secondary" className="text-[10px] px-1 py-0 h-5">
                            {p}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-red-500"
                      onClick={() => handleDeletePermission(perm.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-2">
                Nenhuma permissão encontrada.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ChangePasswordDialog({
  user,
  isOpen,
  onOpenChange,
}: {
  user: User | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const { token } = useAuthStore();
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setPassword("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);

    try {
      const response = await fetch(`https://api.suportevca.com.br/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao alterar a senha.");
      }

      toast({
        title: "Sucesso!",
        description: `Senha de ${user.name} alterada com sucesso.`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Alterar Senha de {user?.name}</DialogTitle>
          <DialogDescription>
            Digite a nova senha para o usuário.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">Nova Senha</Label>
            <Input
              id="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite a nova senha"
              required
              minLength={6}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !password}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ResetPasswordDialog({
  user,
  isOpen,
  onOpenChange,
  onConfirm,
  newPassword,
  isLoading,
}: {
  user: User | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  newPassword: string;
  isLoading: boolean;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar Reset de Senha</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja resetar a senha de <strong>{user?.name}</strong>?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-2">A nova senha será:</p>
          <div className="bg-muted p-2 rounded-md font-mono text-center text-lg tracking-wider select-all">
            {newPassword}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Essa ação não pode ser desfeita. Certifique-se de copiar a senha antes de confirmar.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function UsersTable() {
  const { toast } = useToast();
  const { token } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("https://api.suportevca.com.br/users?page=1&pageSize=1000", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Falha ao buscar usuários");
        }
        const data = await response.json();
        // Assumindo que a API retorna um array de usuários ou um objeto com a propriedade data
        const usersList = Array.isArray(data) ? data : data.data || [];
        setUsers(usersList);
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar a lista de usuários.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchUsers();
  }, [toast, token]);

  // Lógica de filtro e paginação
  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.department?.toLowerCase().includes(searchLower) ||
      user.role?.toLowerCase().includes(searchLower)
    );
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const generateRandomPassword = (length = 10) => {
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
    let password = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  };

  const handleResetPasswordClick = (user: User) => {
    const newPassword = generateRandomPassword();
    setGeneratedPassword(newPassword);
    setSelectedUser(user);
    setIsResetPasswordDialogOpen(true);
  };

  const handleConfirmResetPassword = async () => {
    if (!selectedUser) return;
    setIsResetting(true);
    try {
      const response = await fetch(`https://api.suportevca.com.br/api/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ password: generatedPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao resetar a senha.");
      }

      toast({
        title: "Sucesso!",
        description: `Senha de ${selectedUser.name} resetada com sucesso.`,
      });
      setIsResetPasswordDialogOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  const openPermissionsDialog = (user: User) => {
    setSelectedUser(user);
    setIsPermissionsDialogOpen(true);
  };

  const openChangePasswordDialog = (user: User) => {
    setSelectedUser(user);
    setIsChangePasswordDialogOpen(true);
  };

  return (
    <>
      <div className="flex items-center justify-between py-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar usuários..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Table className="p-2 rounded bg-white">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[350px]">Nome</TableHead>
            <TableHead className="w-[350px]">E-mail</TableHead>
            <TableHead className="w-[350px]">Departamento</TableHead>
            <TableHead className="flex-grow">Cargo</TableHead>
            <TableHead className="w-16 text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoadingData ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                Carregando...
              </TableCell>
            </TableRow>
          ) : paginatedUsers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                Nenhum usuário encontrado.
              </TableCell>
            </TableRow>
          ) : (
            paginatedUsers.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.name || "Não cadastrado"}</TableCell>
              <TableCell>{item.email}</TableCell>
              <TableCell>{item.department || "Não cadastrado"}</TableCell>
              <TableCell>{item.role}</TableCell>
              <TableCell className="text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menu</span>
                      <MoreHorizontalIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={() => openPermissionsDialog(item)}
                    >
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      <span>Gerenciar Permissões</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => openChangePasswordDialog(item)}
                    >
                      <Lock className="mr-2 h-4 w-4" />
                      <span>Alterar Senha</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => handleResetPasswordClick(item)}
                    >
                      <KeyRound className="mr-2 h-4 w-4" />
                      <span>Resetar Senha</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          )))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Página {currentPage} de {totalPages || 1}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || isLoadingData}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || isLoadingData || totalPages === 0}
          >
            Próximo
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ManagePermissionsDialog
        user={selectedUser}
        isOpen={isPermissionsDialogOpen}
        onOpenChange={setIsPermissionsDialogOpen}
      />
      <ChangePasswordDialog
        user={selectedUser}
        isOpen={isChangePasswordDialogOpen}
        onOpenChange={setIsChangePasswordDialogOpen}
      />
      <ResetPasswordDialog
        user={selectedUser}
        isOpen={isResetPasswordDialogOpen}
        onOpenChange={setIsResetPasswordDialogOpen}
        onConfirm={handleConfirmResetPassword}
        newPassword={generatedPassword}
        isLoading={isResetting}
      />
    </>
  );
}
