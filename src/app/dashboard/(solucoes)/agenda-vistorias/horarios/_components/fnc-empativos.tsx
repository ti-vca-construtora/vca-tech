/* eslint-disable prettier/prettier */
const RetornaEmpAtivos = async () => {
  console.log('[EMPATIVOS] Buscando empreendimentos ativos...')
  const response = await fetch(
    '/api/vistorias/empreendimentos?page=1&pageSize=99&isActive=1',
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // eslint-disable-next-line prettier/prettier
    }
  )

  if (!response.ok) {
    console.error(
      '[EMPATIVOS] Erro ao carregar empreendimentos:',
      response.status,
      response.statusText
    )
    return
  }

  const data = await response.json()
  const empreendimentosAtivos = data.data.map((emp: { id: string }) => emp.id)
  console.log(
    '[EMPATIVOS] Empreendimentos ativos encontrados:',
    empreendimentosAtivos.length,
    empreendimentosAtivos
  )

  return empreendimentosAtivos
}

export default RetornaEmpAtivos
