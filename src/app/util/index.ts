import { contratos } from '@/data/contratos'
import { CalculoPorParcela } from '../dashboard/calculadora-juros/_components/visualizacao-calculo'
import * as xlsx from 'xlsx'

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

export const exportJsonToExcel = (json: CalculoPorParcela[]) => {
  const formattedArray = json.map((item) => {
    return {
      valorAnterior: formatarValor(item.valorAnterior),
      valorPresente: formatarValor(item.valorPresente),
      dataAPagar: formatarData(item.dataAPagar),
      dataVencimento: formatarData(item.dataVencimento),
      taxa: item.taxa || 'Sem taxa.',
    }
  })

  // Create a new workbook
  const workbook = xlsx.utils.book_new()

  // Convert JSON data to a worksheet
  const worksheet = xlsx.utils.json_to_sheet(formattedArray)

  // Append the worksheet to the workbook
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1')

  // Export the workbook as an Excel file
  xlsx.writeFile(workbook, `${Date.now()}-data.xlsx`)
}
