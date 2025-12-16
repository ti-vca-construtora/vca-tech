import { NextRequest, NextResponse } from 'next/server'
import { Queue } from 'bullmq'

// --- CONFIGURAÇÃO CORS CENTRALIZADA ---
// Função auxiliar para aplicar CORS em qualquer resposta
function cors(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, ngrok-skip-browser-warning')
  response.headers.set('Access-Control-Max-Age', '86400')
  return response
}

// 1. Lidar com Preflight (OPTIONS)
export async function OPTIONS() {
  return cors(NextResponse.json({}, { status: 200 }))
}

const redisConnection = {
  url: process.env.REDIS_URL,
  maxRetriesPerRequest: null,
}

console.log('🔍 [Redis Config]', {
  url: process.env.REDIS_URL ? 'URL Definida' : 'URL Indefinida',
})

// Só criar a fila se não estiver em build time
let simuladorQueue: Queue | null = null

try {
  simuladorQueue = new Queue('simulador-caixa', {
    connection: redisConnection,
  })
} catch (error) {
  console.warn('⚠️ [Redis] Não foi possível conectar (provavelmente build time):', error)
}

export async function POST(request: NextRequest) {
  try {
    // Tenta fazer o parse do JSON
    let dados;
    try {
      dados = await request.json()
    } catch (e) {
      return cors(NextResponse.json({ error: 'Body inválido, esperava JSON' }, { status: 400 }))
    }

    // Validação básica
    if (!dados.origemRecurso || !dados.cidade || !dados.valorAvaliacao) {
      return cors(NextResponse.json({ error: 'Dados incompletos' }, { status: 400 }))
    }

    if (!simuladorQueue) {
      return cors(NextResponse.json({ error: 'Redis não conectado' }, { status: 503 }))
    }

    // Adicionar job à fila
    const job = await simuladorQueue.add('processar-simulacao', { dados }, {
      attempts: 1, 
      removeOnComplete: { age: 3600, count: 100 },
      removeOnFail: { age: 7200 },
    })

    console.log(`[API] Job criado: ${job.id}`)

    // Aguarda o job finalizar e retorna o resultado direto
    const QueueEvents = await import('bullmq').then(m => m.QueueEvents)
    const events = new QueueEvents('simulador-caixa', { connection: redisConnection })
    
    try {
      // Timeout de 120s
      const result = await job.waitUntilFinished(events, 120000)
      
      console.log(`[API] Job ${job.id} concluído com sucesso.`);
      
      return cors(NextResponse.json({ status: 'completed', result }, { status: 200 }))
    } catch (err) {
      console.error(`[API] Erro esperando job ${job.id}:`, err);
      
      let errorMessage = 'Erro desconhecido';
      if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = (err as { message: string }).message;
      }

      // Se der timeout, retorna o ID para o front fazer polling
      if (errorMessage.includes('timed out')) {
        return cors(NextResponse.json({ 
            status: 'pending', 
            jobId: job.id, 
            message: 'Processamento longo, mudando para modo assíncrono.' 
        }, { status: 200 }));
      }

      return cors(NextResponse.json({ status: 'failed', error: errorMessage }, { status: 500 }))
    } finally {
      await events.close()
    }
  } catch (error) {
    console.error('Erro ao processar requisição POST:', error)
    return cors(NextResponse.json({ error: 'Erro interno ao processar requisição' }, { status: 500 }))
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return cors(NextResponse.json({ error: 'jobId não fornecido' }, { status: 400 }))
    }

    if (!simuladorQueue) {
      return cors(NextResponse.json({ error: 'Redis não conectado' }, { status: 503 }))
    }

    // Buscar job
    const job = await simuladorQueue.getJob(jobId)

    if (!job) {
      return cors(NextResponse.json({ status: 'not_found', error: 'Job não encontrado' }, { status: 404 }))
    }

    const state = await job.getState()
    const progress = job.progress

    console.log(`[API] Job ${jobId} - Estado: ${state}, Progresso: ${progress}%`)

    if (state === 'completed') {
      const result = job.returnvalue
      return cors(NextResponse.json({ status: 'completed', progress: 100, result }, { status: 200 }))
    }

    if (state === 'failed') {
      return cors(NextResponse.json({ 
        status: 'failed', 
        error: job.failedReason || 'Erro desconhecido',
        progress 
      }, { status: 200 }))
    }

    if (state === 'active') {
      return cors(NextResponse.json({ status: 'processing', progress: progress || 0 }, { status: 200 }))
    }

    return cors(NextResponse.json({ status: 'pending', progress: 0 }, { status: 200 }))

  } catch (error) {
    console.error('Erro ao verificar status GET:', error)
    return cors(NextResponse.json({ error: 'Erro ao verificar status' }, { status: 500 }))
  }
}