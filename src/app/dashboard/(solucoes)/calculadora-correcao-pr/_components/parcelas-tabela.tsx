"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import classNames from "classnames";
import { useState, useEffect } from "react";
import { Cliente } from "@/components/search-form";
import { Loader2Icon } from "lucide-react";
import { formatarData, formatarValor, getIndexRate, IndexType } from "@/util";
import { IncomeByBillsApiResponse } from "@/app/api/avp/income-by-bills/route";
import { ClienteInfo } from "@/components/cliente-info";
import { Contrato } from "./contratos-tabela";
import { CurrentDebitBalanceApiResponse } from "@/app/api/avp/current-debit-balance/route";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { VisualizacaoCalculo } from "./visualizacao-calculo";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { supabaseEpi } from "@/lib/supabase-epi";

type ParcelasTabelaProps = {
  cliente: Cliente;
  incomeByBills: IncomeByBillsApiResponse;
  currentDebitBalance: CurrentDebitBalanceApiResponse;
  contrato: Contrato;
};

export type ParcelaCurrentDebit = {
  installmentId: number;
  dueDate: string;
  installmentNumber: string;
  conditionType: string;
  originalValue: number;
  adjustedValue: number;
  indexerName: string;
  monetaryCorrectionValue: number;
  baseDateOfCorrection: string;
  currentBalance: number;
  receipts: {
    receiptId: number;
    receiptDate: string;
    receiptValue: number;
    monetaryCorrectionValue: number;
    receiptNetValue: number;
  }[];
};

export function ParcelasTabela({
  cliente,
  currentDebitBalance,
  contrato,
}: ParcelasTabelaProps) {
  const router = useRouter();
  const [parcelasSelecionadas, setParcelasSelecionadas] = useState<number[]>(
    []
  );
  const [dataReferencia, setDataReferencia] = useState<string>("");
  const [indiceSelecionado, setIndiceSelecionado] = useState<IndexType>("IPC-DI");
  const [mostrarCalculo, setMostrarCalculo] = useState(false);
  const [mostrarAlertaIpc, setMostrarAlertaIpc] = useState(false);
  const [mesesSemTaxa, setMesesSemTaxa] = useState<string[]>([]);
  const [parcelasDesconsiderar, setParcelasDesconsiderar] = useState<string[]>([]);
  const [isLoadingParcelas, setIsLoadingParcelas] = useState(true);
  const [isLoadingIndices, setIsLoadingIndices] = useState(true);

  // Carregar índices do Supabase para o localStorage (para que getIndexRate funcione)
  useEffect(() => {
    const loadIndexEntries = async () => {
      try {
        const { data, error } = await (supabaseEpi
          .from("index_entries") as any)
          .select("*");

        if (error) {
          console.error("Error loading index entries:", error);
        } else if (data) {
          // Armazenar no localStorage para que getIndexRate possa usar
          localStorage.setItem("index-entries", JSON.stringify(data));
          console.log(`✅ ${data.length} índices carregados do Supabase para cache local`);
        }
      } catch (error) {
        console.error("Error loading index entries:", error);
      } finally {
        setIsLoadingIndices(false);
      }
    };

    loadIndexEntries();
  }, []);

  // Buscar parcelas a desconsiderar do Supabase
  useEffect(() => {
    const loadParcelasDesconsiderar = async () => {
      try {
        const { data, error } = await (supabaseEpi
          .from("parcelas_desconsiderar") as any)
          .select("descricao");

        if (error) {
          console.error("Error loading parcelas desconsiderar:", error);
          setParcelasDesconsiderar([]);
        } else {
          const descricoes = (data || []).map((p: any) => p.descricao.toUpperCase());
          setParcelasDesconsiderar(descricoes);
          console.log("📋 Parcelas configuradas para desconsiderar:", descricoes);
        }
      } catch (error) {
        console.error("Error loading parcelas desconsiderar:", error);
        setParcelasDesconsiderar([]);
      } finally {
        setIsLoadingParcelas(false);
      }
    };

    loadParcelasDesconsiderar();
  }, []);

  // Extrair parcelas pagas do currentDebitBalance
  const parcelasPagas: ParcelaCurrentDebit[] =
    (currentDebitBalance.data[0]?.paidInstallments as unknown as ParcelaCurrentDebit[]) ||
    [];

  // Filtrar parcelas com receipts e até a data de referência
  const parcelasFiltradas = dataReferencia
    ? parcelasPagas.filter((parcela) => {
        if (!parcela.receipts || parcela.receipts.length === 0) return false;

        // Verificar se o tipo de parcela está na lista de desconsiderar
        if (
          parcela.conditionType &&
          parcelasDesconsiderar.includes(
            parcela.conditionType.trim().toUpperCase()
          )
        ) {
          console.log(
            `🚫 Parcela filtrada (tipo: ${parcela.conditionType}):`,
            parcela
          );
          return false;
        }

        const primeiroRecebimento = parcela.receipts[0];
        if (!primeiroRecebimento.receiptDate) return false;

        const [anoRef, mesRef] = dataReferencia.split("-").map(Number);
        const dataBaixaObj = new Date(primeiroRecebimento.receiptDate);
        const anoBaixa = dataBaixaObj.getFullYear();
        const mesBaixa = dataBaixaObj.getMonth() + 1;

        return anoBaixa < anoRef || (anoBaixa === anoRef && mesBaixa <= mesRef);
      })
    : [];

  // Alertar quando não houver parcelas na data de referência
  useEffect(() => {
    if (dataReferencia && parcelasFiltradas.length === 0) {
      const [ano, mes] = dataReferencia.split("-");
      const dataFormatada = new Date(`${ano}-${mes}-01`).toLocaleDateString(
        "pt-BR",
        {
          month: "long",
          year: "numeric",
        }
      );
      alert(
        `Não há parcelas pagas até ${dataFormatada}. Por favor, selecione outra data de referência.`
      );
    }
  }, [dataReferencia, parcelasFiltradas.length]);

  // Funções de seleção
  const handleSelectTodasParcelas = () => {
    if (parcelasSelecionadas.length === parcelasFiltradas.length) {
      setParcelasSelecionadas([]);
    } else {
      setParcelasSelecionadas(parcelasFiltradas.map((_, index) => index));
    }
  };

  const handleParcelasPorTipo = (tipo: string) => {
    const indices = parcelasFiltradas
      .map((parcela, index) => (parcela.conditionType === tipo ? index : -1))
      .filter((index) => index !== -1);
    setParcelasSelecionadas(indices);
  };

  const handleSelectParcela = (index: number) => {
    setParcelasSelecionadas((prev) => {
      const jaSelecionada = prev.includes(index);
      if (jaSelecionada) {
        return prev.filter((i) => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const isParcelaSelecionada = (index: number) =>
    parcelasSelecionadas.includes(index);

  // Extrair tipos únicos de condição
  const tiposDeParcela = Array.from(
    new Set(
      parcelasFiltradas
        .map((parcela) => parcela.conditionType)
        .filter((tipo): tipo is string => !!tipo)
    )
  );

  // Calcular total das parcelas selecionadas (valor bruto dos receipts)
  const calcularTotalSelecionadas = () => {
    return parcelasSelecionadas.reduce((total, index) => {
      const parcela = parcelasFiltradas[index];
      if (parcela?.receipts && parcela.receipts.length > 0) {
        return total + (parcela.receipts[0].receiptValue || 0);
      }
      return total;
    }, 0);
  };

  // Verificar se há meses sem taxa do índice cadastrada
  const verificarTaxasIpcFaltantes = () => {
    if (!dataReferencia || parcelasSelecionadas.length === 0) return [];

    const [anoRef, mesRef] = dataReferencia.split("-").map(Number);
    const mesesFaltantes: string[] = [];

    // Encontrar o mês mais antigo entre as parcelas selecionadas
    let mesInicio = mesRef;
    let anoInicio = anoRef;

    parcelasSelecionadas.forEach((index) => {
      const parcela = parcelasFiltradas[index];
      if (parcela.receipts && parcela.receipts.length > 0) {
        const dataBaixa = new Date(parcela.receipts[0].receiptDate);
        const anoBaixa = dataBaixa.getFullYear();
        const mesBaixa = dataBaixa.getMonth() + 1;

        if (
          anoBaixa < anoInicio ||
          (anoBaixa === anoInicio && mesBaixa < mesInicio)
        ) {
          anoInicio = anoBaixa;
          mesInicio = mesBaixa;
        }
      }
    });

    // Verificar cada mês do período
    let mesAtual = mesRef;
    let anoAtual = anoRef;

    const mesesNome = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];

    while (
      anoAtual > anoInicio ||
      (anoAtual === anoInicio && mesAtual >= mesInicio)
    ) {
      const taxaIndex = getIndexRate(mesAtual, anoAtual, indiceSelecionado);
      if (taxaIndex === null) {
        mesesFaltantes.push(`${mesesNome[mesAtual - 1]}/${anoAtual}`);
      }

      mesAtual--;
      if (mesAtual < 1) {
        mesAtual = 12;
        anoAtual--;
      }
    }

    return mesesFaltantes;
  };

  // Função para calcular
  const handleCalcular = () => {
    if (parcelasSelecionadas.length === 0) {
      alert("Selecione pelo menos uma parcela para calcular.");
      return;
    }

    // Verificar se há taxas faltantes
    const taxasFaltantes = verificarTaxasIpcFaltantes();
    if (taxasFaltantes.length > 0) {
      setMesesSemTaxa(taxasFaltantes);
      setMostrarAlertaIpc(true);
      return;
    }

    setMostrarCalculo(true);
  };

  // Prosseguir com cálculo mesmo com taxas faltantes
  const prosseguirComCalculo = () => {
    setMostrarAlertaIpc(false);
    setMostrarCalculo(true);
  };

  // Redirecionar para cadastro de IPC
  const irParaCadastroIpc = () => {
    setMostrarAlertaIpc(false);
    // Usar o callback de navegação se existir, caso contrário redirecionar
    if (typeof window !== "undefined") {
      const currentUrl = new URL(window.location.href);
      // Verificar se estamos na calculadora
      if (currentUrl.pathname.includes("calculadora-correcao-pr")) {
        // Disparar evento customizado para mudar view
        window.dispatchEvent(new CustomEvent("navigateToConfig"));
      } else {
        router.push("/dashboard/settings/ipc-di");
      }
    }
  };

  // Se estiver mostrando cálculo, renderizar componente de visualização
  if (mostrarCalculo) {
    const parcelasParaCalculo = parcelasSelecionadas.map(
      (index) => parcelasFiltradas[index]
    );
    return (
      <VisualizacaoCalculo
        cliente={cliente}
        contrato={contrato}
        dataReferencia={dataReferencia}
        indiceSelecionado={indiceSelecionado}
        parcelas={parcelasParaCalculo}
        onVoltar={() => setMostrarCalculo(false)}
      />
    );
  }

  // Se não houver data de referência, mostrar apenas o seletor
  if (!dataReferencia) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-6">
        <ClienteInfo cliente={cliente} contrato={contrato} />
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-base">
              Selecione a Data de Referência e Índice
            </CardTitle>
            <CardDescription className="text-xs">
              Escolha o mês, ano e índice de referência para calcular o valor acumulado. O
              cálculo será feito retroativamente a partir desta data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="indiceSelecionado"
                  className="text-sm font-medium text-azul-vca"
                >
                  Índice de Correção:
                </label>
                <select
                  id="indiceSelecionado"
                  value={indiceSelecionado}
                  onChange={(e) => setIndiceSelecionado(e.target.value as IndexType)}
                  className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-azul-claro-vca w-fit"
                >
                  <option value="IPC-DI">IPC-DI (FGV)</option>
                  <option value="IGP-M">IGP-M (FGV)</option>
                  <option value="IPCA">IPCA (IBGE)</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="dataReferencia"
                  className="text-sm font-medium text-azul-vca"
                >
                  Data de Referência:
                </label>
                <input
                  id="dataReferencia"
                  type="month"
                  value={dataReferencia}
                  onChange={(e) => setDataReferencia(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-azul-claro-vca w-fit"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mostrar loading enquanto carrega as parcelas a desconsiderar e os índices
  if (isLoadingParcelas || isLoadingIndices) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2Icon className="size-8 animate-spin text-azul-claro-vca" />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-6 text-xs">
      {parcelasPagas.length ? (
        <>
          <ClienteInfo cliente={cliente} contrato={contrato} />

          {/* Card de Data de Referência */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-base">
                Selecione a Data de Referência e Índice
              </CardTitle>
              <CardDescription className="text-xs">
                Escolha o mês, ano e índice de referência para calcular o valor acumulado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="indiceSelecionado"
                    className="text-sm font-medium text-azul-vca"
                  >
                    Índice de Correção:
                  </label>
                  <select
                    id="indiceSelecionado"
                    value={indiceSelecionado}
                    onChange={(e) => setIndiceSelecionado(e.target.value as IndexType)}
                    className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-azul-claro-vca w-fit"
                  >
                    <option value="IPC-DI">IPC-DI (FGV)</option>
                    <option value="IGP-M">IGP-M (FGV)</option>
                    <option value="IPCA">IPCA (IBGE)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="dataReferencia"
                    className="text-sm font-medium text-azul-vca"
                  >
                    Data de Referência:
                  </label>
                  <input
                    id="dataReferencia"
                    type="month"
                    value={dataReferencia}
                    onChange={(e) => setDataReferencia(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-azul-claro-vca w-fit"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card de Parcelas com Correção */}
          {parcelasFiltradas.length > 0 && (
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-base">
                  Parcelas com Correção {indiceSelecionado}
                </CardTitle>
                <CardDescription className="text-xs">
                  Parcelas pagas com cálculo automático de correção pelo {indiceSelecionado}.
                </CardDescription>
                {parcelasFiltradas.length > 0 && (
                  <div className="flex flex-row-reverse gap-3 mt-4">
                    <button
                      onClick={handleSelectTodasParcelas}
                      className="w-fit bg-azul-claro-vca font-semibold text-white rounded py-1 px-3"
                    >
                      {parcelasSelecionadas.length === parcelasFiltradas.length
                        ? "Desmarcar todas"
                        : "Selecionar todas"}
                    </button>
                    <select
                      defaultValue=""
                      onChange={(e) => handleParcelasPorTipo(e.target.value)}
                      className="w-fit bg-azul-claro-vca font-semibold text-white rounded py-1 px-3"
                    >
                      <option value="">Selecionar parcelas pelo tipo</option>
                      {tiposDeParcela.map((tipo, index) => (
                        <option key={index} value={tipo}>
                          {tipo}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {parcelasFiltradas.length > 0 ? (
                  <Table className="shadow-md p-2 rounded bg-white">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px] text-center">
                          SELECIONAR
                        </TableHead>
                        <TableHead className="w-[120px]">DT. VENCTO</TableHead>
                        <TableHead className="w-[180px]">
                          TIPO CONDIÇÃO
                        </TableHead>
                        <TableHead className="w-[120px]">DATA BAIXA</TableHead>
                        <TableHead className="w-[130px]">VALOR BAIXA</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parcelasFiltradas.map((parcela, index) => {
                        const primeiroRecebimento = parcela.receipts[0];
                        return (
                          <TableRow
                            key={index}
                            className={classNames(
                              index % 2 === 0 && "bg-neutral-100",
                              isParcelaSelecionada(index) && "bg-green-100"
                            )}
                          >
                            <TableCell className="text-center">
                              <Checkbox
                                checked={isParcelaSelecionada(index)}
                                onCheckedChange={() =>
                                  handleSelectParcela(index)
                                }
                              />
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatarData(parcela.dueDate)}
                            </TableCell>
                            <TableCell>
                              {parcela.conditionType || "-"}
                            </TableCell>
                            <TableCell>
                              {primeiroRecebimento?.receiptDate
                                ? formatarData(primeiroRecebimento.receiptDate)
                                : "-"}
                            </TableCell>
                            <TableCell>
                              {primeiroRecebimento?.receiptValue
                                ? `R$ ${formatarValor(primeiroRecebimento.receiptValue)}`
                                : "-"}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="size-full flex">
                    <span className="text-neutral-700">
                      Não há parcelas pagas até a data de referência
                      selecionada.
                    </span>
                  </div>
                )}
                <CardFooter className="mt-4 justify-between">
                  <span className="text-sm font-semibold">
                    Total: R$ {formatarValor(calcularTotalSelecionadas())}
                  </span>
                  <span className="text-sm text-gray-600">
                    {parcelasSelecionadas.length} de {parcelasFiltradas.length}{" "}
                    parcelas selecionadas
                  </span>
                </CardFooter>
                <CardFooter className="flex justify-center">
                  <button
                    onClick={handleCalcular}
                    disabled={parcelasSelecionadas.length === 0}
                    className="bg-azul-claro-vca font-semibold text-white rounded py-2 px-4 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    CALCULAR
                  </button>
                </CardFooter>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Loader2Icon className="animate-spin duration-1000 text-neutral-500" />
      )}

      {/* AlertDialog para avisar sobre taxas faltantes */}
      <AlertDialog open={mostrarAlertaIpc} onOpenChange={setMostrarAlertaIpc}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Taxas {indiceSelecionado} Não Cadastradas</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Os seguintes meses não possuem taxa {indiceSelecionado} cadastrada no
                sistema:
              </p>
              <ul className="list-disc list-inside ml-4 text-sm">
                {mesesSemTaxa.map((mes, index) => (
                  <li key={index}>{mes}</li>
                ))}
              </ul>
              <p className="mt-4">
                O cálculo será feito normalmente para os meses que possuem taxa
                cadastrada. Os meses sem taxa serão ignorados no cálculo do {indiceSelecionado}
                acumulado.
              </p>
              <p className="font-semibold">
                Deseja prosseguir com o cálculo ou cadastrar as taxas faltantes?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={irParaCadastroIpc}>
              Cadastrar Taxas
            </AlertDialogCancel>
            <AlertDialogAction onClick={prosseguirComCalculo}>
              Prosseguir Mesmo Assim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
