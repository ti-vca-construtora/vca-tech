/* eslint-disable @typescript-eslint/no-explicit-any */
import { contratos } from '@/data/contratos'
import * as xlsx from 'xlsx'
import { QrCodePix } from 'qrcode-pix'
import { IncomeByBillsApiResponse } from '@/app/api/avp/income-by-bills/route'
import { CurrentDebitBalanceApiResponse } from '@/app/api/avp/current-debit-balance/route'
import { FetchHandler } from '@/app/dashboard/calculadora-juros/_components/contratos-tabela'

export const formatarData = (dataISO: string) => {
  const [ano, mes, dia] = dataISO.split('-')
  return `${dia}/${mes}/${ano}`
}

export const formatarValor = (valor: number) => {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export const formatarCpfCnpj = (documento: string) => {
  const somenteNumeros = documento.replace(/\D/g, '') // Remove todos os caracteres não numéricos

  if (somenteNumeros.length <= 11) {
    // Formatar como CPF (###.###.###-##)
    return somenteNumeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  } else {
    // Formatar como CNPJ (##.###.###/####-##)
    return somenteNumeros.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      '$1.$2.$3/$4-$5',
    )
  }
}

export const calcularDiferencaDias = (
  dataInicial: string,
  dataFinal: string,
) => {
  const data1 = new Date(dataInicial)
  const data2 = new Date(dataFinal)

  const diferencaEmMilissegundos = Math.abs(Number(data2) - Number(data1))

  const diferencaEmDias = Math.ceil(
    diferencaEmMilissegundos / (1000 * 60 * 60 * 24),
  )

  return diferencaEmDias
}

export const formatarRota = (rota: string) => {
  return rota
    .split('-')
    .map((palavra) => palavra.charAt(0).toUpperCase() + palavra.slice(1))
    .join(' ')
}

export const buscaTaxaPorContrato = (contrato: string) => {
  return contratos.find((item) => item.contrato === contrato)
}

export const dias360 = (dataInicial: Date, dataFinal: Date) => {
  const [dia1, mes1, ano1] = [
    dataInicial.getDate(),
    dataInicial.getMonth() + 1,
    dataInicial.getFullYear(),
  ]
  const [dia2, mes2, ano2] = [
    dataFinal.getDate(),
    dataFinal.getMonth() + 1,
    dataFinal.getFullYear(),
  ]

  // Ajuste para o dia inicial
  let d1 = dia1
  if (d1 === 31 || (mes1 === 2 && (dia1 === 28 || dia1 === 29))) {
    d1 = 30 // Converte fevereiro e dias 31 para 30
  }

  // Ajuste para o dia final
  let d2 = dia2
  if (d2 === 31 || (mes2 === 2 && (dia2 === 28 || dia2 === 29))) {
    if (d1 === 30) {
      d2 = 30 // Alinha dia final a 30 se dia inicial for 30
    } else {
      d2 = 30 // Converte dias finais de fevereiro ou 31 para 30
    }
  }

  // Fórmula do método 30/360
  return (ano2 - ano1) * 360 + (mes2 - mes1) * 30 + (d2 - d1)
}

export const calcularTJM = (TJA: number) => {
  return Math.pow(1 + TJA, 1 / 12) - 1
}

export const calcularVPA = (TJM: number, MD: number, VPO: number) => {
  const VPA = VPO / Math.pow(1 + TJM, MD)
  return VPA
}

// Não está sendo utilizada
export const exportJsonToExcel = (json: any[], fileName: string) => {
  const workbook = xlsx.utils.book_new()

  const worksheet = xlsx.utils.json_to_sheet(json)

  xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1')

  xlsx.writeFile(workbook, `${fileName}.xlsx`)
}

export const importExcelToJson = (filePath: string): any[] => {
  // Lê o arquivo Excel
  const workbook = xlsx.readFile(filePath)

  // Verifica se a aba "dados" existe
  const sheetName = workbook.SheetNames.find(
    (name) => name.toLowerCase() === 'dados',
  )

  if (!sheetName) {
    throw new Error('A aba "dados" não foi encontrada no arquivo Excel.')
  }

  // Lê os dados da aba "dados"
  const worksheet = workbook.Sheets[sheetName]

  // Converte a planilha para JSON, usando a primeira linha como chaves dinâmicas
  const jsonData = xlsx.utils.sheet_to_json(worksheet, { defval: null })

  return jsonData
}

interface QrCodePixParameters {
  version: string
  key: string
  city: string
  name: string
  value?: number
  transactionId?: string
  message?: string
  cep?: string
  currency?: number // default: 986 ('R$')
  countryCode?: string // default: 'BR'
}

interface QrCodePixResponse {
  payload: () => string // payload for QrCode
  base64: (options?: any) => Promise<string> // QrCode image base64
}

export const generatePix = (
  pixArray: Omit<QrCodePixParameters, 'version'>[],
): QrCodePixResponse => {
  console.log(pixArray[0])
  const qrCodePix = QrCodePix({
    version: '01',
    key: pixArray[0].key, // or any PIX key
    name: pixArray[0].name,
    city: pixArray[0].city,
    transactionId: pixArray[0].transactionId?.replaceAll(' ', ''), // max 25 characters
    message: pixArray[0].transactionId?.replaceAll(' ', ''),
    cep: '45000000',
    value: pixArray[0].value || 0,
  })

  return qrCodePix
}

type ReceivableBills = {
  documentNumber: string
}

export const handleFetchReceivableBills: FetchHandler<
  IncomeByBillsApiResponse
> = async (
  customerId,
  contractNumber,
  origem,
  _document,
  _documentType,
  action,
) => {
  try {
    const data = await fetch(
      `/api/avp/receivable-bills?customerId=${customerId}&contractNumber=${contractNumber}&origem=${origem}`,
    )

    if (!data.ok) {
      throw new Error('Erro ao buscar contratos')
    }

    const parsed = await data.json()

    const filteredContratos = parsed.results.filter(
      (item: ReceivableBills) => item.documentNumber === contractNumber,
    )

    if (!filteredContratos.length) {
      throw new Error('Nenhum contrato correspondente encontrado')
    }

    const receivableBillId = filteredContratos[0].receivableBillId

    const billsData = await fetch(
      `/api/avp/income-by-bills?billId=${receivableBillId}&origem=${origem}`,
    )

    if (!billsData.ok) {
      throw new Error('Erro ao buscar parcelas')
    }

    const parsedBillsData: IncomeByBillsApiResponse = await billsData.json()

    if (action) action(parsedBillsData)
  } catch (error: any | unknown) {
    console.log(error.message)
  }
}

export const handleFetchCurrentDebitBalance: FetchHandler<
  CurrentDebitBalanceApiResponse
> = async (
  customerId,
  contractNumber,
  origem,
  document,
  documentType,
  action,
) => {
  try {
    const data = await fetch(
      `/api/avp/receivable-bills?customerId=${customerId}&contractNumber=${contractNumber}&origem=${origem}`,
    )

    if (!data.ok) {
      throw new Error('Erro ao buscar contratos')
    }

    const parsed = await data.json()

    const filteredContratos = parsed.results.filter(
      (item: ReceivableBills) => item.documentNumber === contractNumber,
    )

    if (!filteredContratos.length) {
      throw new Error('Nenhum contrato correspondente encontrado')
    }

    const receivableBillId = filteredContratos[0].receivableBillId

    const currentDebitBalance = await fetch(
      `/api/avp/current-debit-balance?billId=${receivableBillId}&origem=${origem}&document=${document}&documentType=${documentType}`,
    )

    if (!currentDebitBalance.ok) {
      throw new Error('Erro ao buscar parcelas')
    }

    const parsedCurrentDebitBalance: CurrentDebitBalanceApiResponse =
      await currentDebitBalance.json()

    if (action) action(parsedCurrentDebitBalance)
  } catch (error: any | unknown) {
    console.log(error.message)
  }
}
