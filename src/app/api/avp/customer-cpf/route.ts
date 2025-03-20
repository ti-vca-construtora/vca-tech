import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL
const BASIC_HASH = process.env.NEXT_PUBLIC_HASH_BASIC
const LOTEAR_BASIC_HASH = process.env.NEXT_PUBLIC_HASH_BASIC_LOTEAR

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const documento = searchParams.get('documento')

    if (!documento) {
      return NextResponse.json(
        { error: 'Documento não fornecido' },
        { status: 400 },
      )
    }

    const documentType = documento.length === 11 ? 'cpf' : 'cnpj'

    const responseVca = await fetch(
      `${API_URL}vca/public/api/v1/customers?${documentType}=${documento}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Basic ${BASIC_HASH}`,
          'Content-Type': 'application/json',
        },
      },
    )

    if (!responseVca.ok) {
      throw new Error('Erro ao buscar dados da API externa')
    }

    const responseLotear = await fetch(
      `${API_URL}vcalotear/public/api/v1/customers?${documentType}=${documento}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Basic ${LOTEAR_BASIC_HASH}`,
          'Content-Type': 'application/json',
        },
      },
    )

    if (!responseLotear.ok) {
      throw new Error('Erro ao buscar dados da API externa')
    }

    const dataVca = await responseVca.json()
    const dataLotear = await responseLotear.json()

    return NextResponse.json({
      vca: {
        ...dataVca,
        origem: 'vca',
      },
      vcalotear: { ...dataLotear, origem: 'vcalotear' },
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any | unknown) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
