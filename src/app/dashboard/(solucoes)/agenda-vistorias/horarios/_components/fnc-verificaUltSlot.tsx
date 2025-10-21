/* eslint-disable prettier/prettier */
import RetornaEmpAtivos from './fnc-empativos'

// Retorna a lista de empreendimentos que NÃO possuem slots até a data alvo
const vrfCriaSlot = async (): Promise<(string | number)[]> => {
  const diasPrazo = 3 - 3
  const diasDuracao = 60

  // data alvo: último dia que deveria existir slot
  const paramDate = new Date()
  paramDate.setHours(0, 0, 0, 0)
  paramDate.setDate(paramDate.getDate() + diasPrazo + diasDuracao - 1)
  const targetIso = paramDate.toISOString()

  // busca empreendimentos ativos
  const empreendimentos = (await RetornaEmpAtivos()) ?? []
  const faltantes: (string | number)[] = []

  // checa por empreendimento se há ao menos 1 slot a partir da data alvo
  for (const devId of empreendimentos) {
    const res = await fetch(
      `/api/vistorias/slots?fromDate=${targetIso}&developmentId=${devId}&page=1&pageSize=1`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    )

    if (!res.ok) {
      console.error('Erro ao verificar slots do empreendimento', devId)
      // Em caso de erro, considere como faltante para não bloquear criação
      faltantes.push(devId)
      continue
    }

    const data = await res.json()
    if (!data?.data || data.data.length === 0) {
      faltantes.push(devId)
    }
  }

  return faltantes
}

export default vrfCriaSlot
