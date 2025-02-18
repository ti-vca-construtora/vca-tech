import { Contrato } from '@/app/dashboard/calculadora-juros/_components/contratos-tabela'
import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL
const BASIC_HASH = process.env.NEXT_PUBLIC_HASH_BASIC
const LOTEAR_BASIC_HASH = process.env.NEXT_PUBLIC_HASH_BASIC_LOTEAR

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id não fornecido' }, { status: 400 })
    }

    const responseVca = await fetch(
      `${API_URL}vca/public/api/v1/sales-contracts?customerId=${id}&limit=200`,
      {
        method: 'GET',
        headers: {
          Authorization: `Basic ${BASIC_HASH}`,
          'Content-Type': 'application/json',
        },
      },
    )

    // Log da resposta original da API externa
    console.log('Resposta da API:', responseVca)

    if (!responseVca.ok) {
      throw new Error('Erro ao buscar dados da API externa')
    }

    const responseLotear = await fetch(
      `${API_URL}vcalotear/public/api/v1/sales-contracts?customerId=${id}&limit=200`,
      {
        method: 'GET',
        headers: {
          Authorization: `Basic ${LOTEAR_BASIC_HASH}`,
          'Content-Type': 'application/json',
        },
      },
    )

    // Log da resposta original da API externa
    console.log('Resposta da API:', responseLotear)

    if (!responseLotear.ok) {
      throw new Error('Erro ao buscar dados da API externa')
    }

    const dataVca = await responseVca.json()
    const dataLotear = await responseLotear.json()

    const contratosVca = dataVca.results.map((contrato: Contrato) => ({
      ...contrato,
      origem: 'vca',
    }))
    const contratosLotear = dataLotear.results.map((contrato: Contrato) => ({
      ...contrato,
      origem: 'vcalotear',
    }))

    return NextResponse.json({
      contratos: [...contratosLotear, ...contratosVca],
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any | unknown) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
