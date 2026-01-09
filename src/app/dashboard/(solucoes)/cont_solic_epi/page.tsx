"use client";

import { SolucoesCard } from "@/components/solucoes-card";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  FiBox,
  FiClipboard,
  FiSettings,
  FiShoppingCart,
} from "react-icons/fi";

export default function ContSolicEpiPage() {
  const router = useRouter();
  const { isLoading, hasPermission } = useAuthStore();

  const hasAccessEpi = hasPermission("sesmt", "epi");
  const hasAccessAdmSesmt = hasPermission("sesmt", "adm-sesmt");
  const hasAnyAccess = hasAccessEpi || hasAccessAdmSesmt;

  useEffect(() => {
    if (!isLoading && !hasAnyAccess) {
      router.push("/dashboard/unauthorized");
    }
  }, [isLoading, hasAnyAccess, router]);

  if (isLoading)
    return (
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-azul-claro-vca"></div>
    );

  if (!hasAnyAccess) return null;

  return (
    <div className="w-full h-full flex flex-col gap-6 p-6">
      <div className="flex flex-wrap gap-6">
              <SolucoesCard
          titulo="Solicitar Equipamento"
          descricao="Solicitação de EPIs"
          href="cont_solic_epi/solicitar"
          Icon={FiShoppingCart}
          area="sesmt"
          permission="epi"
        />
        <SolucoesCard
          titulo="Histórico"
          descricao="Histórico de Solicitações de EPIs"
          href="cont_solic_epi/estoque"
          Icon={FiBox}
          area="sesmt"
          permission="adm-sesmt"
        />
        <SolucoesCard
          titulo="Obras"
          descricao="Gestão de Obras para Solicitação de EPIs"
          href="cont_solic_epi/obras"
          Icon={FiClipboard}
          area="sesmt"
          permission="adm-sesmt"
        />
        <SolucoesCard
          titulo="Configurações"
          descricao="Cadastro e manutenção de EPIs"
          href="cont_solic_epi/configuracoes"
          Icon={FiSettings}
          area="sesmt"
          permission="adm-sesmt"
        />
      </div>
    </div>
  );
}
