import { NextRequest, NextResponse } from 'next/server';
import Redis from 'ioredis';
import { nanoid } from 'nanoid';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
});

const QUEUE_NAME = 'simulador-financiamento:jobs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar dados recebidos
    if (!body.dados) {
      return NextResponse.json(
        { error: 'Dados não fornecidos' },
        { status: 400 }
      );
    }

    // Criar job com ID único
    const jobId = nanoid();
    const job = {
      id: jobId,
      dados: body.dados,
      createdAt: new Date().toISOString(),
    };

    // Adicionar job na fila do Redis
    await redis.rpush(QUEUE_NAME, JSON.stringify(job));

    console.log(`✅ Job criado na fila: ${jobId}`);

    return NextResponse.json({
      success: true,
      jobId,
      message: 'Automação adicionada à fila de processamento',
    });
  } catch (error) {
    console.error('❌ Erro ao criar job:', error);
    return NextResponse.json(
      { error: 'Erro ao criar job na fila' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'JobId não fornecido' },
        { status: 400 }
      );
    }

    // Buscar resultado do job no Redis
    const resultString = await redis.get(`simulador-financiamento:result:${jobId}`);

    if (!resultString) {
      return NextResponse.json({
        jobId,
        status: 'processing',
        message: 'Job ainda está sendo processado',
      });
    }

    const result = JSON.parse(resultString);
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Erro ao buscar resultado:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar resultado do job' },
      { status: 500 }
    );
  }
}
