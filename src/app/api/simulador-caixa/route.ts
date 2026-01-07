import { NextRequest, NextResponse } from 'next/server'
import { Queue } from 'bullmq'
import IORedis from 'ioredis'

// --- CONFIGURAÇÃO CORS ---
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Permite qualquer origem. Para produção, troque '*' pelo seu domínio (ex: 'https://tech.vcaconstrutora.com.br')
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Responde a requisições "preflight" do navegador (necessário para CORS)
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

const redisUrl = process.env.REDIS_URL

// Nota: não inicialize conexão Redis no import do módulo.
// Isso evita spam de logs/retries em dev quando o Redis não está rodando.
const redisConnection = redisUrl
const redisOptions = redisUrl
  ? {
      maxRetriesPerRequest: null,
      // Sem retry automático: se Redis estiver fora, falha uma vez e pronto.
      retryStrategy: () => null,
    }
  : null

let simuladorQueuePromise: Promise<Queue | null> | null = null
let redisErrorLogged = false

async function getSimuladorQueue() {
  if (simuladorQueuePromise) return simuladorQueuePromise

  simuladorQueuePromise = (async () => {
    if (!redisConnection) return null
    if (!redisUrl || !redisOptions) return null

    try {
      const queue = new Queue('simulador-caixa', {
        connection: new IORedis(redisUrl, redisOptions),
      })

      // Garante que conectou. Se não conectar, não fica tentando em loop.
      await queue.waitUntilReady()
      return queue
    } catch (error) {
      if (!redisErrorLogged) {
        redisErrorLogged = true
        console.warn('⚠️ [Redis] Não foi possível conectar. Verifique REDIS_URL e se o Redis está rodando.', error)
      }
      return null
    }
  })()

  return simuladorQueuePromise
}

export async function POST(request: NextRequest) {
  try {
    const dados = await request.json()

    // Validação básica
    if (!dados.origemRecurso || !dados.cidade || !dados.valorAvaliacao) {
      return NextResponse.json(
        { error: 'Dados incompletos' }, 
        { status: 400, headers: corsHeaders }
      )
    }

    const simuladorQueue = await getSimuladorQueue()
    if (!simuladorQueue) {
      return NextResponse.json(
        { error: 'Redis não conectado' }, 
        { status: 503, headers: corsHeaders }
      )
    }

    // Adicionar job à fila
    const job = await simuladorQueue.add('processar-simulacao', { dados }, {
      attempts: 1, 
      removeOnComplete: {
        age: 3600, // Remover após 1 hora
        count: 100, // Manter últimos 100
      },
      removeOnFail: {
        age: 7200, // Remover após 2 horas
      },
    })

    console.log(`[API] Job criado: ${job.id}`)

    // Aguarda o job finalizar e retorna o resultado direto
    const QueueEvents = await import('bullmq').then(m => m.QueueEvents)
    const events = new QueueEvents('simulador-caixa', { connection: new IORedis(redisUrl!, redisOptions!) })
    
    try {
      // Timeout de 120s para garantir que jobs demorados não quebrem
      const result = await job.waitUntilFinished(events, 120000)
      
      console.log(`[API] Job ${job.id} concluído com sucesso. Retornando resultado.`);
      
      return NextResponse.json(
        { status: 'completed', result },
        { status: 200, headers: corsHeaders }
      )
    } catch (err) {
      console.error(`[API] Erro esperando job ${job.id}:`, err);
      
      let errorMessage = 'Erro desconhecido';
      if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = (err as { message: string }).message;
      }

      // Se der timeout, retorna o ID para o front fazer polling
      if (errorMessage.includes('timed out')) {
        return NextResponse.json({ 
            status: 'pending', 
            jobId: job.id, 
            message: 'Processamento longo, mudando para modo assíncrono.' 
        }, { status: 200, headers: corsHeaders });
      }

      return NextResponse.json(
        { status: 'failed', error: errorMessage }, 
        { status: 500, headers: corsHeaders }
      )
    } finally {
      await events.close()
    }
  } catch (error) {
    console.error('Erro ao processar requisição POST:', error)
    return NextResponse.json(
      { error: 'Erro interno ao processar requisição' },
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

    const simuladorQueue = await getSimuladorQueue()
    if (!simuladorQueue) {
      return NextResponse.json(
        { error: 'Redis não conectado' }, 
        { status: 503, headers: corsHeaders }
      )
    }

    // Buscar job
    const job = await simuladorQueue.getJob(jobId)

    if (!job) {
      return NextResponse.json({ 
        status: 'not_found',
        error: 'Job não encontrado' 
      }, { status: 404, headers: corsHeaders })
    }

    const state = await job.getState()
    const progress = job.progress

    console.log(`[API] Job ${jobId} - Estado: ${state}, Progresso: ${progress}%`)

    if (state === 'completed') {
      const result = job.returnvalue
      return NextResponse.json({ 
        status: 'completed', 
        progress: 100,
        result 
      }, { status: 200, headers: corsHeaders })
    }

    if (state === 'failed') {
      return NextResponse.json({ 
        status: 'failed', 
        error: job.failedReason || 'Erro desconhecido',
        progress 
      }, { status: 200, headers: corsHeaders })
    }

    if (state === 'active') {
      return NextResponse.json({ 
        status: 'processing',
        progress: progress || 0
      }, { status: 200, headers: corsHeaders })
    }

    return NextResponse.json({ 
      status: 'pending',
      progress: 0
    }, { status: 200, headers: corsHeaders })

  } catch (error) {
    console.error('Erro ao verificar status GET:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar status' },
      { status: 500, headers: corsHeaders }
    )
  }
}