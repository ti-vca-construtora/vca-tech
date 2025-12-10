# Simulador Caixa Worker

Worker independente para automação do simulador de financiamento Caixa usando Playwright e BullMQ.

## Requisitos

- Docker + Docker Compose
- OU Node.js 18+ + Redis rodando

## Quick Start (Docker)

```bash
# Clone ou acesse a pasta worker
cd worker

# Start com Docker Compose (inclui Redis)
docker compose up -d --build

# Ver logs
docker logs -f vca-playwright-worker
```

## Quick Start (Local)

```bash
# Instalar dependências
npm install

# Setup Playwright
npm run setup

# Certifique-se que Redis está rodando (porta 6379)
# Então execute o worker
npm start
```

## Variáveis de Ambiente

```env
REDIS_HOST=localhost      # Host do Redis (padrão: localhost)
REDIS_PORT=6379          # Porta do Redis (padrão: 6379)
NODE_ENV=production      # Ambiente (development ou production)
```

## Estrutura

```
worker/
├── index.js              # Worker Playwright com lógica de automação
├── package.json          # Dependências (bullmq, playwright, ioredis)
├── Dockerfile            # Build da imagem Docker
├── docker-compose.yml    # Orquestração (Redis + Worker)
├── .gitignore           # Arquivos a ignorar no Git
└── README.md            # Este arquivo
```

## Como Funciona

1. **Redis**: Fila de jobs para processar requisições
2. **Worker**: Processa jobs da fila usando Playwright
3. **API**: Envia jobs para a fila via HTTP (em outro repositório)

## Escalabilidade

Você pode escalar aumentando `concurrency` em `index.js`:

```javascript
const worker = new Worker("simulador-caixa", processSimulacao, {
  concurrency: 2, // Aumentar esse número para processar mais jobs em paralelo
});
```

## Performance na EC2

Para testar em múltiplas instâncias:

1. Inicie um Redis central (porta 6379 acessível)
2. Defina `REDIS_HOST` para o IP/DNS do Redis
3. Faça `docker compose up -d` em cada EC2

Todas as instâncias compartilham a mesma fila de jobs.

## Monitoramento

Os logs mostram:

- Progresso de cada job (10%, 20%, ... 100%)
- Dados processados
- Erros padronizados

Exemplo:

```
📋 Processando job: job-123
📊 Progresso inicial: 0%
🌐 Navegando para o simulador...
✅ Job job-123 completado com sucesso
```

## Troubleshooting

**Worker não conecta ao Redis:**

- Verifique se Redis está rodando na porta 6379
- Confira `REDIS_HOST` e `REDIS_PORT`

**Playwright não encontra browser:**

- Execute `npm run setup` para instalar Chromium
- Em Docker, será feito automaticamente no build

**Fila não processa jobs:**

- Confira se worker está conectado (veja logs)
- Verifique se há jobs na fila
