"use client";

import { RouteGuard } from "@/components/route-guard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, usePathname } from "next/navigation";
import { FileText, Settings } from "lucide-react";

export default function GeradorDACLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const currentTab = pathname.includes("/configuracoes") ? "configuracoes" : "gerar";

  const handleTabChange = (value: string) => {
    if (value === "gerar") {
      router.push("/dashboard/gerador-dac");
    } else if (value === "configuracoes") {
      router.push("/dashboard/gerador-dac/configuracoes");
    }
  };

  return (
    <RouteGuard requiredArea="financeiro" requiredPermission="gerador-dac">
      <div className="w-full h-full flex flex-col p-3 sm:p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Gerador de DAC
          </h1>
          <p className="text-sm text-gray-600">
            Gere documentos de arrecadação com validação de duplicidade
          </p>
        </div>

        <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="gerar" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Gerar DAC
            </TabsTrigger>
            <TabsTrigger value="configuracoes" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configurações
            </TabsTrigger>
          </TabsList>

          {children}
        </Tabs>
      </div>
    </RouteGuard>
  );
}
