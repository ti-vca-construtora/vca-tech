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
    let workerUrl = process.env.NEXT_PUBLIC_CAIXA_URL || 'https://simulador-caixa.vcatech.cloud'
    
    // Garante que a URL tem protocolo https://
    if (!workerUrl.startsWith('http')) {
      workerUrl = `https://${workerUrl}`
    }
    
    const targetUrl = `${workerUrl}/api/simulador-caixa`
    console.log('🌐 Worker URL alvo:', targetUrl)

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erro do worker:', response.status, errorText)
      return NextResponse.json(
        {
          error: 'Erro ao processar simulação',
          workerStatus: response.status,
          workerBody: errorText,
          workerUrl: targetUrl,
        },
        { status: response.status, headers: corsHeaders }
      )
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
      {
        error: error instanceof Error ? error.message : 'Erro ao processar simulação',
        workerUrl: process.env.NEXT_PUBLIC_CAIXA_URL || 'https://simulador-caixa.vcatech.cloud',
      },
      { status: 502, headers: corsHeaders }
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
    let workerUrl = process.env.NEXT_PUBLIC_CAIXA_URL || 'https://simulador-caixa.vcatech.cloud'
    
    // Garante que a URL tem protocolo https://
    if (!workerUrl.startsWith('http')) {
      workerUrl = `https://${workerUrl}`
    }
    
    const targetUrl = `${workerUrl}/api/simulador-caixa?jobId=${jobId}`
    console.log('🌐 Worker URL alvo (status):', targetUrl)

    const response = await fetch(targetUrl)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erro do worker (status):', response.status, errorText)
      return NextResponse.json(
        {
          error: 'Erro ao consultar status',
          workerStatus: response.status,
          workerBody: errorText,
          workerUrl: targetUrl,
        },
        { status: response.status, headers: corsHeaders }
      )
    }

    const data = await response.json()

    console.log('✅ Status do job:', data)

    return NextResponse.json(data, {
      status: 200,
      headers: corsHeaders,
    })
  } catch (error) {
    console.error('❌ Erro ao verificar status:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Erro ao verificar status',
        workerUrl: process.env.NEXT_PUBLIC_CAIXA_URL || 'https://simulador-caixa.vcatech.cloud',
      },
      { status: 502, headers: corsHeaders }
    )
  }
}