import { contratos } from '@/data/contratos'

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

export const calcularDiferencaDias = (
  dataInicial: string,
  dataFinal: string,
) => {
  const data1 = new Date(dataInicial)
  const data2 = new Date(dataFinal)

  // Calcula a diferença em milissegundos
  const diferencaEmMilissegundos = Math.abs(Number(data2) - Number(data1))

  // Converte a diferença para dias
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

export const calcularTJM = (TJA: number) => {
  return Math.pow(1 + TJA, 1 / 12) - 1
}

export const calcularVPA = (TJM: number, MD: number, VPO: number) => {
  console.log(TJM, MD, VPO)
  const VPA = VPO / Math.pow(1 + TJM, MD)
  return VPA - 1
}
