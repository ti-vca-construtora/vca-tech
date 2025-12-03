/* eslint-disable prettier/prettier */
"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoaderCircle, Trash } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";

const optionsVca = {
  method: "GET",
  headers: {
    accept: "application/json",
    email: process.env.NEXT_PUBLIC_EMAIL_CV_API_VCA || "",
    token: process.env.NEXT_PUBLIC_TOKEN_CV_API_VCA || "",
  },
};

const optionsLotear = {
  method: "GET",
  headers: {
    accept: "application/json",
    email: process.env.NEXT_PUBLIC_EMAIL_CV_API_LOTEAR || "",
    token: process.env.NEXT_PUBLIC_TOKEN_CV_API_LOTEAR || "",
  },
};

const EditarEmpreendimento = () => {
  const idParam = useParams();
  const route = useRouter();

  const [empreendimentoNome, setEmpreendimentoNome] = useState("");
  const [isActive, setIsActive] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingUnits, setIsUpdatingUnits] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [currentUnitProcessing, setCurrentUnitProcessing] = useState("");
  const [totalUnitsToUpdate, setTotalUnitsToUpdate] = useState(0);
  const [processedUnits, setProcessedUnits] = useState(0);
  const [empreendimentoData, setEmpreendimentoData] = useState<{
    externalId: string;
    units: Array<{ id: string; externalId: string; customerName: string }>;
  } | null>(null);

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

  const errorNotifDelete = () => toast.error("Falha na exclusão.", toastConfig);

  const sucessNotifDelete = () =>
    toast.success("Exclusão realizada.", toastConfig);

  const errorNotifEdit = () => toast.error("Falha na edição.", toastConfig);

  const sucessNotifEdit = () =>
    toast.success("Empreendimento editado.", toastConfig);

  const sucessNotifUpdate = () =>
    toast.success("Unidades atualizadas.", toastConfig);

  const errorNotifUpdate = () =>
    toast.error("Falha na atualização das unidades.", toastConfig);

  const fetchCustomerFromCV = async (
    vendidaId: string,
    isVca: boolean,
  ): Promise<string> => {
    try {
      const baseUrl = isVca
        ? "https://vca.cvcrm.com.br"
        : "https://vcalotear.cvcrm.com.br";
      const options = isVca ? optionsVca : optionsLotear;

      const response = await fetch(
        `${baseUrl}/api/v1/comercial/reservas/${vendidaId}`,
        options,
      );

      if (!response.ok) {
        return "SEM CLIENTE";
      }

      const data = await response.json();
      const clientName = data[vendidaId]?.titular?.nome;

      return clientName && clientName.trim() !== ""
        ? clientName
        : "SEM CLIENTE";
    } catch (error) {
      console.error(
        `Erro ao buscar cliente para vendidaId ${vendidaId}:`,
        error,
      );
      return "SEM CLIENTE";
    }
  };

  const updateUnits = async () => {
    if (!empreendimentoData) {
      errorNotifUpdate();
      return;
    }

    setIsUpdatingUnits(true);
    setTotalUnitsToUpdate(empreendimentoData.units.length);
    setProcessedUnits(0);
    setUpdateProgress(0);
    setCurrentUnitProcessing("");

    console.log(
      `Iniciando atualização de ${empreendimentoData.units.length} unidades...`,
    );

    try {
      let updatedCount = 0;
      const totalUnits = empreendimentoData.units.length;

      for (let index = 0; index < empreendimentoData.units.length; index++) {
        const unit = empreendimentoData.units[index];

        // Atualizar progresso visual
        setCurrentUnitProcessing(`Unidade ${unit.externalId}`);
        setProcessedUnits(index + 1);
        setUpdateProgress(Math.round(((index + 1) / totalUnits) * 100));

        console.log(
          `Processando unidade ${unit.externalId} (ID: ${unit.id})... [${index + 1}/${totalUnits}]`,
        );

        try {
          // Buscar dados atuais da unidade no CV
          let unitDataFromCV = null;
          let isVcaSuccess = false;

          // Tentar VCA primeiro
          try {
            console.log(
              `Tentando buscar unidade ${unit.externalId} na API VCA...`,
            );
            const responseVca = await fetch(
              `https://vca.cvcrm.com.br/api/v1/cadastros/empreendimentos/${empreendimentoData.externalId}/unidades/${unit.externalId}`,
              optionsVca,
            );
            if (responseVca.ok) {
              unitDataFromCV = await responseVca.json();
              isVcaSuccess = true;
              console.log(
                `✅ Dados encontrados na API VCA para unidade ${unit.externalId}`,
              );
            } else {
              console.log(
                `❌ Falha na API VCA para unidade ${unit.externalId}: ${responseVca.status}`,
              );
            }
          } catch (e) {
            console.warn(
              `❌ Erro ao buscar na API VCA para unidade ${unit.externalId}, tentando Lotear...`,
            );
          }

          // Se VCA falhou, tentar Lotear
          if (!unitDataFromCV) {
            try {
              console.log(
                `Tentando buscar unidade ${unit.externalId} na API Lotear...`,
              );
              const responseLotear = await fetch(
                `https://vcalotear.cvcrm.com.br/api/v1/cadastros/empreendimentos/${empreendimentoData.externalId}/unidades/${unit.externalId}`,
                optionsLotear,
              );
              if (responseLotear.ok) {
                unitDataFromCV = await responseLotear.json();
                isVcaSuccess = false;
                console.log(
                  `✅ Dados encontrados na API Lotear para unidade ${unit.externalId}`,
                );
              } else {
                console.log(
                  `❌ Falha na API Lotear para unidade ${unit.externalId}: ${responseLotear.status}`,
                );
              }
            } catch (e) {
              console.error(
                `❌ Erro ao buscar na API Lotear para unidade ${unit.externalId}:`,
                e,
              );
              continue;
            }
          }

          if (!unitDataFromCV?.dados?.[0]) {
            console.warn(
              `⚠️ Dados da unidade ${unit.externalId} não encontrados em nenhuma API`,
            );
            continue;
          }

          const vendidaId = unitDataFromCV.dados[0].situacao?.vendida;
          let currentCustomerName = "SEM CLIENTE";

          console.log(
            `Unidade ${unit.externalId} - vendidaId: ${vendidaId || "não encontrado"}`,
          );

          if (vendidaId) {
            currentCustomerName = await fetchCustomerFromCV(
              vendidaId.toString(),
              isVcaSuccess,
            );
            console.log(
              `Cliente atual da unidade ${unit.externalId}: "${currentCustomerName}"`,
            );
          }

          console.log(
            `Comparando nomes - Atual no sistema: "${unit.customerName}" vs CV: "${currentCustomerName}"`,
          );

          // Comparar com o nome atual e atualizar se diferente
          if (currentCustomerName !== unit.customerName) {
            console.log(
              `🔄 Atualizando unidade ${unit.externalId}: "${unit.customerName}" -> "${currentCustomerName}"`,
            );

            const updateResponse = await fetch(
              `/api/vistorias/unidades?id=${unit.id}`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  customerName: currentCustomerName,
                }),
              },
            );

            if (updateResponse.ok) {
              updatedCount++;
              console.log(
                `✅ Unidade ${unit.externalId} atualizada com sucesso!`,
              );
            } else {
              console.error(
                `❌ Erro ao atualizar unidade ${unit.externalId}: ${updateResponse.status}`,
              );
            }
          } else {
            console.log(
              `✅ Unidade ${unit.externalId} já está com o nome correto, não precisa atualizar`,
            );
          }
        } catch (error) {
          console.error(
            `❌ Erro ao processar unidade ${unit.externalId}:`,
            error,
          );
        }
      }

      if (updatedCount > 0) {
        sucessNotifUpdate();
        console.log(`${updatedCount} unidades foram atualizadas`);
      } else {
        toast.info("Nenhuma unidade precisou ser atualizada", toastConfig);
      }
    } catch (error) {
      console.error("Erro geral na atualização das unidades:", error);
      errorNotifUpdate();
    } finally {
      setIsUpdatingUnits(false);
      setUpdateProgress(0);
      setCurrentUnitProcessing("");
      setProcessedUnits(0);
      setTotalUnitsToUpdate(0);
    }
  };

  const patchDevelopment = async () => {
    if (empreendimentoNome === "" || isActive === "") {
      window.alert("Campos obrigatórios não preenchidos!");
      return;
    }

    const booleanActive = isActive === "true";

    const response = await fetch(
      `/api/vistorias/empreendimentos?id=${idParam.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: empreendimentoNome.toUpperCase(),
          isActive: booleanActive,
        }),
        // eslint-disable-next-line prettier/prettier
      },
    );

    if (!response.ok) {
      console.error("Erro ao editar o empreendimento");
      errorNotifEdit();
      return;
    }

    const data = await response.json();
    console.log("Empreendimento editado:", data);
    sucessNotifEdit();
    setTimeout(() => {
      route.push("/dashboard/agenda-vistorias/empreendimentos");
    }, 3000);
  };

  const deleteDevelopment = async () => {
    const response = await fetch(
      `/api/vistorias/empreendimentos?id=${idParam.id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        // eslint-disable-next-line prettier/prettier
      },
    );

    if (!response.ok) {
      console.error("Erro ao excluir o empreendimento");
      errorNotifDelete();
      return;
    }

    const data = await response.json();
    console.log("Empreendimento excluído:", data);
    sucessNotifDelete();
    setTimeout(() => {
      route.push("/dashboard/agenda-vistorias/empreendimentos");
    }, 3000);
  };

  const handleName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmpreendimentoNome(e.target.value);
  };

  const getEmpreendimento = async () => {
    const response = await fetch(
      `/api/vistorias/empreendimentos?id=${idParam.id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // eslint-disable-next-line prettier/prettier
      },
    );

    if (!response.ok) {
      console.error("Erro ao carregar empreendimentos");
      return;
    }

    const data = await response.json();
    setEmpreendimentoNome(data.data.name);
    setIsActive(data.data.isActive ? "true" : "false");

    // Armazenar dados do empreendimento incluindo unidades
    setEmpreendimentoData({
      externalId: data.data.externalId,
      units: data.data.units || [],
    });
  };

  useEffect(() => {
    const componentRender = async () => {
      await getEmpreendimento();
      setIsLoading(false);
    };

    componentRender();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="flex flex-col items-start gap-6 w-full h-full p-6">
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
      <Card className="size-full p-8">
        {isLoading ? (
          <Card>
            <div className="flex w-full h-full justify-center items-center">
              <LoaderCircle className="flex animate-spin duration-700 self-center text-neutral-500" />
            </div>
          </Card>
        ) : (
          <>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="empreendimento">Empreendimento</Label>
              <Input
                value={empreendimentoNome}
                type="text"
                id="empreendimento"
                placeholder="Nome"
                onChange={handleName}
              />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5 mt-6">
              <Label htmlFor="status">Status</Label>
              <Select onValueChange={setIsActive} value={isActive}>
                <SelectTrigger id="status" className="w-[260px] cursor-pointer">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent className="cursor-pointer">
                  <SelectItem className="cursor-pointer" value="true">
                    Ativo
                  </SelectItem>
                  <SelectItem className="cursor-pointer" value="false">
                    Inativo
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid w-full items-center gap-1.5 mt-6">
              <Button
                onClick={updateUnits}
                disabled={isUpdatingUnits || !empreendimentoData}
                variant="outline"
                className="w-fit bg-blue-500 text-white hover:bg-blue-600 hover:text-white"
              >
                {isUpdatingUnits ? "Atualizando..." : "Atualizar unidades"}
              </Button>

              {/* Barra de progresso */}
              {isUpdatingUnits && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{currentUnitProcessing}</span>
                    <span>
                      {processedUnits}/{totalUnitsToUpdate} unidades
                    </span>
                  </div>
                  <Progress value={updateProgress} className="w-full" />
                  <div className="text-center text-sm text-gray-500">
                    {updateProgress}% concluído
                  </div>
                </div>
              )}
            </div>
            <div className="grid w-full items-center gap-1.5 mt-6">
              <Trash
                onClick={deleteDevelopment}
                className="bg-red-600 text-neutral-100 p-1 rounded cursor-pointer hover:scale-110 duration-100"
                width={30}
                height={30}
              />
            </div>
            <div className="w-full flex justify-end gap-2">
              <Link href="/dashboard/agenda-vistorias/empreendimentos">
                <Button variant="destructive">Cancelar</Button>
              </Link>
              <Button
                onClick={patchDevelopment}
                variant="default"
                className="bg-azul-claro-vca hover:bg-verde-vca"
              >
                Salvar
              </Button>
            </div>
          </>
        )}
      </Card>
    </section>
  );
};
export default EditarEmpreendimento;
