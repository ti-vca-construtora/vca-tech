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
