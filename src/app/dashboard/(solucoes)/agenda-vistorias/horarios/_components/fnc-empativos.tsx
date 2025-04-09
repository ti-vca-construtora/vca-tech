const RetornaEmpAtivos = async () => {
  const response = await fetch(
    '/api/vistorias/empreendimentos?page=1&pageSize=20&isActive=1',
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // eslint-disable-next-line prettier/prettier
    }
  )

  if (!response.ok) {
    console.error('Erro ao carregar empreendimentos')
    return
  }

  const data = await response.json()
  const empreendimentosAtivos = data.data.map((emp: { id: string }) => emp.id)

  return empreendimentosAtivos
}

export default RetornaEmpAtivos
