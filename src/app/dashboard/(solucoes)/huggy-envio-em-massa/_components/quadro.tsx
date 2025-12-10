"use client";
import React, { useState } from "react";
import Tabela from "./tabela";
import { User } from "@/types/huggy-user";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getContact,
  postContact,
  putContact,
  putContactFlow,
  GetContactType,
} from "@/services/huggy";
import EstatisticasTabela, { StatisticsType } from "./estatisticas-tabela";
import { BiLoader } from "react-icons/bi";
import Variaveis from "./variaveis";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import * as XLSX from "xlsx";
import {
  normalizePhone,
  validatePhoneList,
  identifyForeignNumbers,
  PhoneValidationResult,
} from "@/lib/phone-validation";
import InvalidPhoneModal from "./invalid-phone-modal";

const UserSchema = z.object({
  nome: z.string().min(2, "Digite um nome válido"),
  telefone: z.string().min(1, "Digite um número de telefone"),
});

type UserFormType = z.infer<typeof UserSchema>;

const Quadro = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UserFormType>({
    resolver: zodResolver(UserSchema),
  });

  const [users, setUsers] = useState<User[]>([]);
  const [statistics, setStatistics] = useState<StatisticsType[]>([]);
  const [statisticsStatus, setStatisticsStatus] = useState<string>("");
  const [file, setFile] = useState<File>();
  const [status, setStatus] = useState<string>("");
  const [variables, setVariables] = useState<{
    uuid: string;
    flowId: string;
    variables: { chave: string; valor: string }[];
  }>({
    uuid: "dedae4f0-8275-4d9d-abb6-66af99730b73", // Cliente 1200 (fixo)
    flowId: "374659",
    variables: [],
  });
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [invalidPhones, setInvalidPhones] = useState<PhoneValidationResult[]>(
    []
  );
  const [showInvalidModal, setShowInvalidModal] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCreateUser = (data: UserFormType) => {
    const normalizedPhone = normalizePhone(data.telefone);

    // Verificar se o número já existe na lista
    const phoneExists = users.some((user) => user.telefone === normalizedPhone);

    if (phoneExists) {
      setStatus("❌ Este número já existe na lista!");
      setTimeout(() => setStatus(""), 3000);
      return;
    }

    const userData: User = {
      nome: data.nome,
      telefone: normalizedPhone,
    };
    setUsers((prev) => [...prev, userData]);
    reset();
    if (errors) {
      console.log(errors);
    }
  };

  const xlsxToUsers = (file: File): Promise<User[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const data = event.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          const formattedUsers: User[] = jsonData
            .map((row: unknown) => {
              const data = row as Record<string, unknown>;
              const nome = data.nome || data.Nome || data.NOME || "";
              const telefone =
                data.telefone || data.Telefone || data.TELEFONE || "";

              if (!nome || !telefone) return null;

              const normalizedPhone = normalizePhone(String(telefone));

              return {
                nome: String(nome).trim(),
                telefone: normalizedPhone,
              };
            })
            .filter((user): user is User => user !== null);

          resolve(formattedUsers);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error("Erro ao ler arquivo"));

      // Suporta tanto .xlsx quanto .csv
      if (file.name.endsWith(".csv")) {
        reader.readAsText(file, "UTF-8");
      } else {
        reader.readAsBinaryString(file);
      }
    });
  };

  const handleReadFile = async () => {
    if (!file) return;

    try {
      const importedUsers = await xlsxToUsers(file);

      // Remover duplicatas dentro do arquivo importado - manter apenas o primeiro de cada número
      const uniqueUsers = importedUsers.filter(
        (user, index, self) =>
          index === self.findIndex((u) => u.telefone === user.telefone)
      );

      const duplicatesInFileCount = importedUsers.length - uniqueUsers.length;

      // Remover números que já existem na lista atual
      const newUsers = uniqueUsers.filter(
        (importedUser) =>
          !users.some(
            (existingUser) => existingUser.telefone === importedUser.telefone
          )
      );

      const alreadyExistsCount = uniqueUsers.length - newUsers.length;

      // Construir mensagem informativa
      let statusMessage = "";
      if (duplicatesInFileCount > 0) {
        statusMessage += `${duplicatesInFileCount} duplicata(s) removida(s) do arquivo. `;
      }
      if (alreadyExistsCount > 0) {
        statusMessage += `${alreadyExistsCount} número(s) já existe(m) na lista e foi(ram) ignorado(s).`;
      }

      if (statusMessage) {
        console.log(statusMessage);
        setStatus(statusMessage);
        setTimeout(() => setStatus(""), 10000); // Limpa mensagem após 7 segundos
      }

      if (newUsers.length === 0) {
        setStatus(
          "Nenhum número novo para importar. Todos já existem na lista ou são duplicatas."
        );
        setTimeout(() => setStatus(""), 5000);
        return;
      }

      // Validar telefones
      const phones = newUsers.map((u) => u.telefone);
      const validationResults = validatePhoneList(phones);
      const invalidResults = identifyForeignNumbers(validationResults);

      if (invalidResults.length > 0) {
        // Mostrar modal com números inválidos
        setPendingUsers(newUsers);
        setInvalidPhones(invalidResults);
        setShowInvalidModal(true);
      } else {
        // Todos os números são válidos, adicionar diretamente
        setUsers((prev) => [...prev, ...newUsers]);
      }
    } catch (error) {
      console.error("Erro ao ler arquivo:", error);
      setStatus("Erro ao ler arquivo. Verifique se o formato está correto.");
    }
  };

  const handleConfirmImport = () => {
    setUsers((prev) => [...prev, ...pendingUsers]);
    setShowInvalidModal(false);
    setPendingUsers([]);
    setInvalidPhones([]);
  };

  const handleCancelImport = () => {
    setShowInvalidModal(false);
    setPendingUsers([]);
    setInvalidPhones([]);
    setFile(undefined);
  };

  const handleSend = async () => {
    const existingUsers: (GetContactType & { id: string })[] = [];
    const unexistingUsers: User[] = [];
    const statisticsArray: StatisticsType[] = [];

    try {
      setIsProcessing(true);
      setProgress(0);
      setStatistics([]);
      setStatisticsStatus("Gerando estatísticas...");

      setStatus("Verificando a existência dos usuários...");

      await Promise.all(
        users.map(async (user, index) => {
          const [userData] = await getContact(user.telefone);

          if (userData) {
            existingUsers.push(userData);
            statisticsArray.push({
              nome: userData.name,
              email: userData.email,
              telefone: userData.phone,
              exists: true,
              chatId: "",
              userId: userData.id,
              flowStatus: "",
            });
          } else {
            unexistingUsers.push(users[index]);
            statisticsArray.push({
              ...users[index],
              email: undefined,
              exists: false,
              chatId: "",
              userId: "",
              flowStatus: "",
            });
          }
        })
      );

      // Calcular total de operações para o progresso
      const totalOperations = unexistingUsers.length + (existingUsers.length * 2); // POST + PUT + PUT Flow
      let completedOperations = 0;

      if (unexistingUsers.length > 0) {
        setStatus("Criando usuários inexistentes...");

        // Criar usuários com delay de 500ms entre cada requisição
        for (let i = 0; i < unexistingUsers.length; i++) {
          const user = unexistingUsers[i];
          
          const createdUser = await postContact({
            ...user,
            email: "",
          });
          
          existingUsers.push(createdUser);
          const userToModify = statisticsArray.find(
            (user) => user.nome === createdUser.name
          );
          if (userToModify) {
            userToModify.userId = createdUser.id;
          }
          
          // Atualizar progresso
          completedOperations++;
          setProgress((completedOperations / totalOperations) * 100);
          
          // Aguardar 500ms antes do próximo POST (exceto no último)
          if (i < unexistingUsers.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }
      }

      setStatus("Alterando campos necessários para envio de flow...");

      // Atualizar usuários existentes SEQUENCIALMENTE com delay de 500ms
      for (let i = 0; i < existingUsers.length; i++) {
        const user = existingUsers[i];
        
        await putContact({
          name: user.name,
          phone: user.phone,
          email: user.email || "",
        }, user.id);
        
        // Atualizar progresso
        completedOperations++;
        setProgress((completedOperations / totalOperations) * 100);
        
        // Aguardar 500ms antes do próximo PUT (exceto no último)
        if (i < existingUsers.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      setStatus("Enviando flow...");

      // Enviar flow SEQUENCIALMENTE com delay de 500ms
      for (let i = 0; i < existingUsers.length; i++) {
        const user = existingUsers[i];
        
        const responseText = await putContactFlow(Number(user.id), {
          flowId: variables.flowId,
          uuid: variables.uuid,
          variables: variables.variables,
        });

        const userToModify = statisticsArray.find(
          (statisticsUser) => statisticsUser.userId === user.id
        );

        if (userToModify && responseText) {
          const parsed = JSON.parse(responseText);
          userToModify.flowStatus = parsed!.reason;
          userToModify.chatId = parsed!.chatID;
        }
        
        // Atualizar progresso
        completedOperations++;
        setProgress((completedOperations / totalOperations) * 100);
        
        // Aguardar 500ms antes do próximo flow (exceto no último)
        if (i < existingUsers.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      setStatisticsStatus("");
      setStatistics(statisticsArray);

      setStatus("Processo finalizado!");
      setIsProcessing(false);
    } catch (error) {
      setStatus("Algo deu errado. Segue a mensagem de erro: " + error);
      setIsProcessing(false);
    }
  };

  const handleExportToXLSX = () => {
    // Preparar dados para exportação
    const exportData = statistics.map((stat) => ({
      "ID do Usuário": stat.userId,
      Nome: stat.nome,
      Telefone: stat.telefone,
      Email: stat.email || "",
      "Já Existia": stat.exists ? "Sim" : "Não",
      "Status do Flow": stat.flowStatus,
      "ID do Chat": stat.chatId,
    }));

    // Criar workbook e worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Estatísticas");

    // Ajustar largura das colunas
    const maxWidth = 20;
    const colWidths = [
      { wch: maxWidth },
      { wch: maxWidth },
      { wch: 15 },
      { wch: maxWidth },
      { wch: 12 },
      { wch: maxWidth },
      { wch: maxWidth },
    ];
    worksheet["!cols"] = colWidths;

    // Baixar arquivo
    XLSX.writeFile(workbook, `${Date.now()}-statistics.xlsx`);
  };

  return (
    <div className="w-full flex flex-col gap-5">
      <Variaveis setVariables={setVariables} />
      <div className="bg-neutral-100 p-3 rounded-lg shadow flex flex-col gap-3">
        <Card className="flex flex-col gap-3">
          <CardHeader>
            <CardTitle>Adicionar lead:</CardTitle>
            <CardDescription>Adicione leads manualmente</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit(handleCreateUser)}
              className="w-full flex gap-2"
            >
              <Input
                {...register("nome")}
                className="w-full p-2 rounded"
                placeholder="Nome"
                type="text"
              />
              <Input
                {...register("telefone")}
                className="w-full p-2 rounded"
                placeholder="Telefone (com DDD)"
                type="text"
              />
              <Button className="w-fit" type="submit">
                Adicionar
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card className="flex flex-col gap-3">
          <CardHeader>
            <CardTitle>Importar planilha:</CardTitle>
            <CardDescription>
              Preencha e importe a planilha modelo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="flex flex-col gap-2">
              <li className="text-neutral-600 text-sm">
                {"• A planilha deve estar no formato .xlsx ou .csv."}
              </li>
              <li className="text-neutral-600 text-sm">
                {'• A planilha deve ter as colunas "nome" e "telefone".'}
              </li>
              <li className="text-neutral-600 text-sm">
                {
                  "• Os telefones serão automaticamente normalizados (símbolos e espaços removidos)."
                }
              </li>
              <li className="text-neutral-600 text-sm">
                {
                  "• Formato esperado após normalização: 13 dígitos, começando com 55 (Brasil), 3º dígito diferente de 0, 5º dígito igual a 9."
                }
              </li>
            </ol>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 self-center">
            <input
              className="self-center text-sm file:bg-blue-400 file:border-0 file:text-white file:p-2 file:m-5 file:rounded file:font-bold file:cursor-pointer cursor-pointer italic"
              accept=".xlsx,.csv"
              onChange={(e) => setFile(e.target.files![0])}
              type="file"
            />
            <Button className="w-fit self-center" onClick={handleReadFile}>
              Importar
            </Button>
          </CardFooter>
        </Card>
        <Card className="flex flex-col gap-1">
          <CardHeader>
            <CardTitle>Lista de leads:</CardTitle>
            <CardDescription>Leads que receberão o flow</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {users.length > 0 && (
              <Button onClick={() => setUsers([])} className="self-end w-fit">
                Limpar
              </Button>
            )}
            <Tabela setUsers={setUsers} users={users} />
          </CardContent>
        </Card>
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Parâmetros do Envio:</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="flex flex-col gap-2">
              <li className="text-neutral-600 text-sm">
                <p className="font-bold">
                  • Quantidade de Usuários:{" "}
                  <span className="font-normal">{users.length}</span>
                </p>
              </li>
              <li className="text-neutral-600 text-sm">
                <p className="font-bold">
                  • Flow ID:{" "}
                  <span className="font-normal">{variables.flowId}</span>
                </p>
              </li>
              <li className="text-neutral-600 text-sm">
                <p className="font-bold">
                  • UUID do Canal:{" "}
                  <span className="font-normal">{variables.uuid}</span>
                </p>
              </li>
            </ol>
          </CardContent>
          <CardFooter className="flex items-center justify-center">
            <Button
              disabled={users.length === 0}
              onClick={handleSend}
              className="w-fit"
            >
              Enviar
            </Button>
          </CardFooter>
        </Card>
        <div className="self-center w-full max-w-md">
          {isProcessing ? (
            <div className="flex flex-col gap-3 w-full">
              <div className="flex items-center justify-center gap-2">
                <p className="text-neutral-600 text-sm">{status}</p>
                <BiLoader className="animate-spin" />
              </div>
              <div className="w-full">
                <Progress value={progress} className="w-full" />
                <p className="text-xs text-neutral-500 text-center mt-1">
                  {Math.round(progress)}% concluído
                </p>
              </div>
            </div>
          ) : status.length > 0 ? (
            <p className="text-sm text-neutral-800 font-semibold text-center">{status}</p>
          ) : null}
        </div>
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Análise do último envio:</CardTitle>
          </CardHeader>
          <CardContent>
            {statistics.length > 0 ? (
              <EstatisticasTabela fn={handleExportToXLSX} users={statistics} />
            ) : statisticsStatus !== "" ? (
              <div className="flex items-center justify-center gap-2">
                <p className="text-neutral-600 text-sm">{statisticsStatus}</p>
                <BiLoader className="animate-spin" />
              </div>
            ) : (
              <p className="text-neutral-600 text-xs p-4">
                Faça um envio para obter as estatísicas.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      <InvalidPhoneModal
        isOpen={showInvalidModal}
        onClose={handleCancelImport}
        onConfirm={handleConfirmImport}
        invalidPhones={invalidPhones}
      />
    </div>
  );
};

export default Quadro;
