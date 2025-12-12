import { NextRequest, NextResponse } from 'next/server'
import { Queue } from 'bullmq'

const redisConnection = {
  url: process.env.REDIS_URL,
  maxRetriesPerRequest: null,
}

console.log('🔍 [Redis Config]', {
  url: process.env.REDIS_URL,
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
    const dados = await request.json()

    // Validação básica
    if (!dados.origemRecurso || !dados.cidade || !dados.valorAvaliacao) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    if (!simuladorQueue) {
      return NextResponse.json({ error: 'Redis não conectado' }, { status: 503 })
    }

    // Adicionar job à fila
    const job = await simuladorQueue.add('processar-simulacao', { dados }, {
      attempts: 1, // Apenas 1 tentativa - usuário decide se tenta novamente
      removeOnComplete: {
        age: 3600, // Remover após 1 hora
        count: 100, // Manter últimos 100
      },
      removeOnFail: {
        age: 7200, // Remover após 2 horas
      },
    })

    console.log(`[API] Job criado: ${job.id}`)

    return NextResponse.json({ 
      jobId: job.id, 
      status: 'pending' 
    })
  } catch (error) {
    console.error('Erro ao criar job:', error)
    return NextResponse.json(
      { error: 'Erro ao processar requisição' },
      { status: 500 }
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
        { status: 400 }
      )
    }

    if (!simuladorQueue) {
      return NextResponse.json({ error: 'Redis não conectado' }, { status: 503 })
    }

    // Buscar job
    const job = await simuladorQueue.getJob(jobId)

    if (!job) {
      return NextResponse.json({ 
        status: 'not_found',
        error: 'Job não encontrado' 
      })
    }

    const state = await job.getState()
    const progress = job.progress

    console.log(`[API] Job ${jobId} - Estado: ${state}, Progresso: ${progress}%`)

    // Estados possíveis: waiting, active, completed, failed, delayed
    if (state === 'completed') {
      const result = job.returnvalue
      return NextResponse.json({ 
        status: 'completed', 
        progress: 100,
        result 
      })
    }

    if (state === 'failed') {
      return NextResponse.json({ 
        status: 'failed', 
        error: job.failedReason || 'Erro desconhecido',
        progress 
      })
    }

    if (state === 'active') {
      return NextResponse.json({ 
        status: 'processing',
        progress: progress || 0
      })
    }

    // waiting, delayed, etc
    return NextResponse.json({ 
      status: 'pending',
      progress: 0
    })
  } catch (error) {
    console.error('Erro ao verificar status:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar status' },
      { status: 500 }
    )
  }
}
