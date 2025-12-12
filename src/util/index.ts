/* eslint-disable @typescript-eslint/no-explicit-any */
import { contratos } from "@/data/contratos";
import * as xlsx from "xlsx";
import { QrCodePix } from "qrcode-pix";
import {
  CurrentDebitBalanceApiResponse,
  CurrentDebitBalanceExternalApiResponse,
} from "@/app/api/avp/current-debit-balance/route";
import { IncomeByBillsApiResponse } from "@/app/api/avp/income-by-bills/route";
import { FetchHandler } from "@/app/dashboard/(solucoes)/calculadora-juros/_components/contratos-tabela";

export const formatarData = (dataISO: string) => {
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
};

export const formatarValor = (valor: number) => {
  if (valor === undefined || valor === null || isNaN(valor)) {
    return "0,00";
  }
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const formatarCpfCnpj = (documento: string) => {
  const somenteNumeros = documento.replace(/\D/g, ""); // Remove todos os caracteres não numéricos

  if (somenteNumeros.length <= 11) {
    // Formatar como CPF (###.###.###-##)
    return somenteNumeros.replace(
      /(\d{3})(\d{3})(\d{3})(\d{2})/,
      "$1.$2.$3-$4",
    );
  } else {
    // Formatar como CNPJ (##.###.###/####-##)
    return somenteNumeros.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5",
    );
  }
};

export const calcularDiferencaDias = (
  dataInicial: string,
  dataFinal: string,
) => {
  const data1 = new Date(dataInicial);
  const data2 = new Date(dataFinal);

  const diferencaEmMilissegundos = Math.abs(Number(data2) - Number(data1));

  const diferencaEmDias = Math.ceil(
    diferencaEmMilissegundos / (1000 * 60 * 60 * 24),
  );

  return diferencaEmDias;
};

export const formatarRota = (rota: string) => {
  // Mapeamento de rotas com nomes customizados
  const customNames: Record<string, string> = {
    "calculadora-correcao-pr": "Atualização de Valores Recebidos",
  };

  // Verifica se existe um nome customizado para a rota
  if (customNames[rota]) {
    return customNames[rota];
  }

  // Formatação padrão
  return rota
    .split("-")
    .map((palavra) => palavra.charAt(0).toUpperCase() + palavra.slice(1))
    .join(" ");
};

export const buscaTaxaPorContrato = (contrato: string) => {
  return contratos.find((item) => item.contrato === contrato);
};

export const dias360 = (dataInicial: Date, dataFinal: Date) => {
  const [dia1, mes1, ano1] = [
    dataInicial.getDate(),
    dataInicial.getMonth() + 1,
    dataInicial.getFullYear(),
  ];
  const [dia2, mes2, ano2] = [
    dataFinal.getDate(),
    dataFinal.getMonth() + 1,
    dataFinal.getFullYear(),
  ];

  // Ajuste para o dia inicial
  let d1 = dia1;
  if (d1 === 31 || (mes1 === 2 && (dia1 === 28 || dia1 === 29))) {
    d1 = 30; // Converte fevereiro e dias 31 para 30
  }

  // Ajuste para o dia final
  let d2 = dia2;
  if (d2 === 31 || (mes2 === 2 && (dia2 === 28 || dia2 === 29))) {
    if (d1 === 30) {
      d2 = 30; // Alinha dia final a 30 se dia inicial for 30
    } else {
      d2 = 30; // Converte dias finais de fevereiro ou 31 para 30
    }
  }

  // Fórmula do método 30/360
  return (ano2 - ano1) * 360 + (mes2 - mes1) * 30 + (d2 - d1);
};

export const calcularTJM = (TJA: number) => {
  return Math.pow(1 + TJA, 1 / 12) - 1;
};

/**
 * Normaliza uma string removendo acentos, espaços extras e convertendo para maiúsculas
 * Útil para comparações robustas de strings
 */
export const normalizeString = (str: string): string => {
  return str
    .trim()
    .normalize("NFD") // Decompõe caracteres acentuados
    .replace(/[\u0300-\u036f]/g, "") // Remove marcas diacríticas (acentos)
    .replace(/\s+/g, "") // Remove todos os espaços
    .toUpperCase();
};

/**
 * Verifica se uma string está contida em um array de strings, usando normalização
 */
export const isStringInArray = (
  str: string,
  array: string[] | readonly string[],
): boolean => {
  const normalizedStr = normalizeString(str);
  return array.some((item) => normalizeString(item) === normalizedStr);
};

/**
 * Tipos de índices de correção monetária disponíveis
 */
export type IndexType = "IPC-DI" | "IGP-M" | "IPCA";

/**
 * Busca a taxa de um índice específico para um mês/ano no localStorage
 * @param mes Mês (1-12)
 * @param ano Ano
 * @param indexType Tipo de índice (IPC-DI, IGP-M, IPCA)
 * @returns Taxa percentual ou null se não encontrada
 */
export const getIndexRate = (
  mes: number,
  ano: number,
  indexType: IndexType = "IPC-DI",
): number | null => {
  try {
    const stored = localStorage.getItem("index-entries");
    if (!stored) return null;

    const entries = JSON.parse(stored);
    const entry = entries.find(
      (e: { mes: number; ano: number; valor: number; tipo: IndexType }) =>
        e.mes === mes && e.ano === ano && e.tipo === indexType,
    );

    return entry ? entry.valor : null;
  } catch (error) {
    console.error(`Erro ao buscar taxa ${indexType}:`, error);
    return null;
  }
};

/**
 * Busca a taxa IPC-DI para um mês/ano específico no localStorage
 * @deprecated Use getIndexRate() para maior flexibilidade
 */
export const getIpcDiRate = (mes: number, ano: number): number | null => {
  return getIndexRate(mes, ano, "IPC-DI");
};

/**
 * Calcula o IPC acumulado entre duas datas
 * @param dataInicial Data inicial (data de baixa)
 * @param dataFinal Data final (data de vencimento)
 * @returns Percentual de IPC acumulado (ex: 19.73 para 19,73%)
 */
export const calcularIpcAcumulado = (
  dataInicial: string,
  dataFinal: string,
): number => {
  const inicio = new Date(dataInicial);
  const fim = new Date(dataFinal);

  if (inicio >= fim) {
    return 0;
  }

  let fatorAcumulado = 1;

  // Iterar mês a mês desde a data inicial até a final
  let dataAtual = new Date(inicio);
  const dataFim = new Date(fim);
  dataAtual.setDate(1); // Primeiro dia do mês

  while (dataAtual < dataFim) {
    const mes = dataAtual.getMonth() + 1; // getMonth() retorna 0-11
    const ano = dataAtual.getFullYear();

    const taxaIpc = getIpcDiRate(mes, ano);

    if (taxaIpc !== null) {
      // Converter percentual para decimal e aplicar
      fatorAcumulado *= 1 + taxaIpc / 100;
    }

    // Avançar para o próximo mês
    dataAtual = new Date(dataAtual.setMonth(dataAtual.getMonth() + 1));
  }

  // Retornar o percentual acumulado
  return (fatorAcumulado - 1) * 100;
};

/**
 * Calcula o valor atualizado aplicando o IPC acumulado
 * @param valorOriginal Valor original (valor de baixa)
 * @param ipcAcumulado IPC acumulado em percentual (ex: 19.73)
 * @returns Valor atualizado
 */
export const calcularValorAtualizado = (
  valorOriginal: number,
  ipcAcumulado: number,
): number => {
  return valorOriginal * (1 + ipcAcumulado / 100);
};

/**
 * Calcula o índice acumulado reverso (de trás para frente) a partir de uma data de referência
 * Fórmula: Índice Acum = (1 + Índice Acum do próximo mês) * (1 + Índice do mês atual) - 1
 * No mês de referência: Índice Acum = Índice do próprio mês
 * @param dataBaixa Data da baixa/pagamento da parcela
 * @param dataReferencia Data de referência no formato 'YYYY-MM' (ex: '2025-08')
 * @param indexType Tipo de índice a ser utilizado
 * @returns Percentual de índice acumulado (ex: 0.95 para 0,95%)
 */
export const calcularIndexAcumuladoReverso = (
  dataBaixa: string,
  dataReferencia: string,
  indexType: IndexType = "IPC-DI",
): number => {
  const dataBaixaObj = new Date(dataBaixa);
  const [anoRef, mesRef] = dataReferencia.split("-").map(Number);

  const mesBaixa = dataBaixaObj.getMonth() + 1; // getMonth() retorna 0-11
  const anoBaixa = dataBaixaObj.getFullYear();

  // Se a data de baixa é posterior à data de referência, retorna 0
  if (anoBaixa > anoRef || (anoBaixa === anoRef && mesBaixa > mesRef)) {
    return 0;
  }

  // Se é o mesmo mês, retorna o índice do próprio mês
  if (anoBaixa === anoRef && mesBaixa === mesRef) {
    const taxaIndex = getIndexRate(mesRef, anoRef, indexType);
    return taxaIndex !== null ? taxaIndex : 0;
  }

  // Inicializar com o índice do mês de referência (ponto de partida)
  // Se não houver taxa para o mês de referência, inicia com 0 mas continua o cálculo
  const indexMesReferencia = getIndexRate(mesRef, anoRef, indexType);
  let indexAcumulado = indexMesReferencia !== null ? indexMesReferencia : 0;

  // Começar do mês anterior ao de referência e ir até o mês da baixa
  let mesAtual = mesRef - 1;
  let anoAtual = anoRef;

  if (mesAtual < 1) {
    mesAtual = 12;
    anoAtual--;
  }

  while (
    anoAtual > anoBaixa ||
    (anoAtual === anoBaixa && mesAtual >= mesBaixa)
  ) {
    const taxaIndex = getIndexRate(mesAtual, anoAtual, indexType);

    if (taxaIndex !== null) {
      // Aplicar a fórmula: Índice Acum = (1 + Índice Acum próximo) * (1 + Índice atual) - 1
      indexAcumulado = (1 + indexAcumulado / 100) * (1 + taxaIndex / 100) - 1;
      indexAcumulado *= 100; // Converter de volta para percentual
    }
    // Se taxaIndex for null, apenas pula este mês sem aplicar correção

    // Voltar um mês
    mesAtual--;
    if (mesAtual < 1) {
      mesAtual = 12;
      anoAtual--;
    }
  }

  return indexAcumulado;
};

/**
 * Calcula o IPC acumulado reverso (de trás para frente) a partir de uma data de referência
 * @deprecated Use calcularIndexAcumuladoReverso() para maior flexibilidade
 */
export const calcularIpcAcumuladoReverso = (
  dataBaixa: string,
  dataReferencia: string,
): number => {
  return calcularIndexAcumuladoReverso(dataBaixa, dataReferencia, "IPC-DI");
};

export const calcularVPA = (TJM: number, MD: number, VPO: number) => {
  const VPA = VPO / Math.pow(1 + TJM, MD);
  return VPA;
};

// Não está sendo utilizada
export const exportJsonToExcel = (json: any[], fileName: string) => {
  const workbook = xlsx.utils.book_new();

  const worksheet = xlsx.utils.json_to_sheet(json);

  xlsx.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  xlsx.writeFile(workbook, `${fileName}.xlsx`);
};

export const importExcelToJson = (filePath: string): any[] => {
  // Lê o arquivo Excel
  const workbook = xlsx.readFile(filePath);

  // Verifica se a aba "dados" existe
  const sheetName = workbook.SheetNames.find(
    (name) => name.toLowerCase() === "dados",
  );

  if (!sheetName) {
    throw new Error('A aba "dados" não foi encontrada no arquivo Excel.');
  }

  // Lê os dados da aba "dados"
  const worksheet = workbook.Sheets[sheetName];

  // Converte a planilha para JSON, usando a primeira linha como chaves dinâmicas
  const jsonData = xlsx.utils.sheet_to_json(worksheet, { defval: null });

  return jsonData;
};

interface QrCodePixParameters {
  version: string;
  key: string;
  city: string;
  name: string;
  value?: number;
  transactionId?: string;
  message?: string;
  cep?: string;
  currency?: number; // default: 986 ('R$')
  countryCode?: string; // default: 'BR'
}

interface QrCodePixResponse {
  payload: () => string; // payload for QrCode
  base64: (options?: any) => Promise<string>; // QrCode image base64
}

export const generatePix = (
  pixArray: Omit<QrCodePixParameters, "version">[],
): QrCodePixResponse => {
  console.log(pixArray[0]);
  const qrCodePix = QrCodePix({
    version: "01",
    key: pixArray[0].key, // or any PIX key
    name: pixArray[0].name,
    city: pixArray[0].city,
    transactionId: pixArray[0].transactionId?.replaceAll(" ", ""), // max 25 characters
    message: pixArray[0].transactionId?.replaceAll(" ", ""),
    cep: "45000000",
    value: pixArray[0].value || 0,
  });

  return qrCodePix;
};

type ReceivableBills = {
  documentNumber: string;
};

export const handleFetchReceivableBills: FetchHandler<
  IncomeByBillsApiResponse
> = async (
  customerId,
  contractNumber,
  origem,
): Promise<IncomeByBillsApiResponse> => {
  try {
    const data = await fetch(
      `/api/avp/receivable-bills?customerId=${customerId}&contractNumber=${contractNumber}&origem=${origem}`,
    );

    if (!data.ok) {
      throw new Error("Erro ao buscar contratos");
    }

    const parsed = await data.json();

    const filteredContratos = parsed.results.filter(
      (item: ReceivableBills) => item.documentNumber === contractNumber,
    );

    if (!filteredContratos.length) {
      throw new Error("Nenhum contrato correspondente encontrado");
    }

    const receivableBillId = filteredContratos[0].receivableBillId;

    const billsData = await fetch(
      `/api/avp/income-by-bills?billId=${receivableBillId}&origem=${origem}`,
    );

    if (!billsData.ok) {
      throw new Error("Erro ao buscar parcelas");
    }

    if (!billsData.ok) {
      throw new Error("Erro ao buscar parcelas");
    }

    return (await billsData.json()) as IncomeByBillsApiResponse;
  } catch (error: any | unknown) {
    console.log(error instanceof Error ? error.message : "Erro desconhecido");
    return { data: [] };
  }
};

export const handleFetchCurrentDebitBalance: FetchHandler<
  CurrentDebitBalanceApiResponse
> = async (
  customerId,
  contractNumber,
  origem,
  document?,
  documentType?,
  correctionDate?,
): Promise<CurrentDebitBalanceApiResponse> => {
  try {
    const data = await fetch(
      `/api/avp/receivable-bills?customerId=${customerId}&contractNumber=${contractNumber}&origem=${origem}`,
    );

    if (!data.ok) {
      throw new Error("Erro ao buscar contratos");
    }

    const parsed = await data.json();

    const filteredContratos = parsed.results.filter(
      (item: ReceivableBills) => item.documentNumber === contractNumber,
    );

    if (!filteredContratos.length) {
      throw new Error("Nenhum contrato correspondente encontrado");
    }

    const receivableBillId = filteredContratos[0].receivableBillId;

    const currentDebitBalance = await fetch(
      `/api/avp/current-debit-balance?billId=${receivableBillId}&origem=${origem}&document=${document}&documentType=${documentType}&correctionDate=${correctionDate}`,
    );

    if (!currentDebitBalance.ok) {
      throw new Error("Erro ao buscar parcelas");
    }

    const currentDebitApiResponse: CurrentDebitBalanceExternalApiResponse =
      await currentDebitBalance.json();

    return {
      data: currentDebitApiResponse.results,
    };
  } catch (error: any | unknown) {
    console.log(error instanceof Error ? error.message : "Erro desconhecido");
    return { data: [] };
  }
};
