import { NextRequest, NextResponse } from 'next/server'

const upstreamUrl = 'https://workers-caixa-production.up.railway.app/simulador-caixa'

export async function POST(request: NextRequest) {
  try {
    const dados = await request.json()

    // Validação básica
    if (!dados.origemRecurso || !dados.cidade || !dados.valorAvaliacao) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    const upstreamResponse = await fetch(upstreamUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dados),
      cache: 'no-store',
    })

    const contentType = upstreamResponse.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      const result = await upstreamResponse.json()
      return NextResponse.json(result, { status: upstreamResponse.status })
    }

    const textResult = await upstreamResponse.text()
    return new NextResponse(textResult, {
      status: upstreamResponse.status,
      headers: {
        'Content-Type': upstreamResponse.headers.get('content-type') || 'text/plain',
      },
    })
  } catch (error) {
    console.error('Erro ao encaminhar simulação:', error)
    return NextResponse.json(
      { error: 'Erro ao processar requisição' },
      { status: 500 }
    )
  }
}

export function GET() {
  return NextResponse.json(
    { error: 'Consulta de status desativada neste ambiente' },
    { status: 410 }
  )
}
