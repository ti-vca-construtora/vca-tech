const vrfCriaSlot = async () => {
  const diasPrazo = 3 - 3
  const diasDuracao = 60

  const dataDeBuscaSlot = () => {
    const paramDate = new Date()
    paramDate.setHours(5, 0, 0, 0)
    paramDate.setDate(paramDate.getDate() + diasPrazo + diasDuracao - 1)
    const date = paramDate.toISOString()
    console.log(date)
    return { date }
  }

  const response = await fetch(
    `/api/vistorias/slots?fromDate=${dataDeBuscaSlot().date}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // eslint-disable-next-line prettier/prettier
    }
  )

  if (!response.ok) {
    console.error('Erro ao carregar slot')
    return
  }

  const data = await response.json()
  console.log(data)

  if (data.data.length === 0) {
    return false
  } else {
    return true
  }
}

export default vrfCriaSlot
