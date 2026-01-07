import { NextRequest, NextResponse } from 'next/server'

// --- CONFIGURAÇÃO CORS ---
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
}

// Responde a requisições "preflight" do navegador (necessário para CORS)
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validação básica
    if (!body.origemRecurso || !body.cidade || !body.valorAvaliacao) {
      return NextResponse.json(
        { error: 'Dados incompletos' }, 
        { status: 400, headers: corsHeaders }
      )
    }

    console.log('📤 Redirecionando para worker:', body)

    // Envia direto para o worker via túnel Cloudflare
    const workerUrl = process.env.NEXT_PUBLIC_CAIXA_URL || 'https://simulador-caixa.vcatech.cloud'
    
    const response = await fetch(`${workerUrl}/api/simulador-caixa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erro do worker:', response.status, errorText)
      throw new Error(`Worker retornou status ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    
    console.log('✅ Resposta do worker:', data)

    return NextResponse.json(data, { 
      status: 200,
      headers: corsHeaders
    })
  } catch (error) {
    console.error('❌ Erro ao comunicar com worker:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao processar simulação' },
      { status: 500, headers: corsHeaders }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json(
        { error: 'jobId não fornecido' },
        { status: 400, headers: corsHeaders }
      )
    }

    console.log('📤 Consultando status do job:', jobId)

    // Consulta status no worker
    const workerUrl = process.env.NEXT_PUBLIC_CAIXA_URL || 'https://simulador-caixa.vcatech.cloud'
    
    const response = await fetch(`${workerUrl}/api/simulador-caixa?jobId=${jobId}`)

    if (!response.ok) {
      throw new Error(`Worker retornou status ${response.status}`)
    }

    const data = await response.json()

    console.log('✅ Status do job:', data)

    return NextResponse.json(data, { 
      status: 200,
      headers: corsHeaders
    })
  } catch (error) {
    console.error('❌ Erro ao verificar status:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar status' },
      { status: 500, headers: corsHeaders }
    )
  }
}