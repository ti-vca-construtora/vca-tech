import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL
const BASIC_HASH = process.env.NEXT_PUBLIC_HASH_BASIC

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const cpf = searchParams.get('cpf')

    if (!cpf) {
      return NextResponse.json({ error: 'CPF não fornecido' }, { status: 400 })
    }

    const documento = cpf.length === 11 ? 'cpf' : 'cnpj'

    const response = await fetch(
      `${API_URL}vca/public/api/v1/customers?${documento}=${cpf}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Basic ${BASIC_HASH}`,
          'Content-Type': 'application/json',
        },
      },
    )

    // Log da resposta original da API externa
    console.log('Resposta da API:', response)

    if (!response.ok) {
      throw new Error('Erro ao buscar dados da API externa')
    }

    const data = await response.json()
    return NextResponse.json(data)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any | unknown) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
