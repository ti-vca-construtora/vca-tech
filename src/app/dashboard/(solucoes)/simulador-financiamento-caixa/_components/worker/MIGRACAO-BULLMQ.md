# Migração para BullMQ - Sistema de Fila Robusto

## 🎯 O que mudou?

### Antes (Redis manual):
- ❌ Gerenciamento manual de filas
- ❌ Heartbeat manual
- ❌ Recuperação de crash complexa
- ❌ Sem retry automático
- ❌ Sem rate limiting
- ❌ Difícil de escalar

### Depois (BullMQ):
- ✅ Fila gerenciada automaticamente
- ✅ Heartbeat embutido
- ✅ Recuperação automática
- ✅ Retry com backoff exponencial
- ✅ Rate limiting integrado
- ✅ Concorrência configurável
- ✅ Dashboard web disponível

---

## 📦 Instalação

### 1. Instalar dependências

**Worker:**
```powershell
cd "src\app\dashboard\(solucoes)\simulador-financiamento-caixa\_components\worker"
npm install
```

**Next.js (projeto principal):**
```powershell
cd "C:\Users\carlosmauricio\OneDrive - VCA Construtora\Documentos\TECH\vca-tech"
npm install
```

---

## 🚀 Como usar

### 1. Parar o Redis antigo (se estiver rodando)

```powershell
cd "src\app\dashboard\(solucoes)\simulador-financiamento-caixa\_components\worker"
docker-compose down
```

### 2. Iniciar Redis com Docker

```powershell
docker-compose up -d redis
```

### 3. Substituir arquivos

**API:**
- Renomear: `route.ts` → `route-old.ts`
- Renomear: `route-bullmq.ts` → `route.ts`

**Worker:**
- Renomear: `index.js` → `index-old.js`
- Renomear: `index-bullmq.js` → `index.js`

### 4. Iniciar Worker

```powershell
cd "src\app\dashboard\(solucoes)\simulador-financiamento-caixa\_components\worker"
node index.js
```

### 5. Iniciar Next.js

```powershell
cd "C:\Users\carlosmauricio\OneDrive - VCA Construtora\Documentos\TECH\vca-tech"
npm run dev
```

---

## ✨ Funcionalidades BullMQ

### 1. **Retry Automático**
- Tenta até 3 vezes automaticamente
- Backoff exponencial (5s, 10s, 20s)
- Configura em `route.ts`:
```typescript
attempts: 3,
backoff: {
  type: 'exponential',
  delay: 5000,
}
```

### 2. **Concorrência**
- Processa 2 jobs simultaneamente
- Configura em `index.js`:
```javascript
concurrency: 2
```

### 3. **Rate Limiting**
- Máximo 10 jobs por minuto
- Protege contra sobrecarga
- Configura em `index.js`:
```javascript
limiter: {
  max: 10,
  duration: 60000,
}
```

### 4. **Progresso em Tempo Real**
- Atualizado durante processamento
- Veja no frontend:
```javascript
const { progress } = data // 0-100
```

### 5. **Limpeza Automática**
- Jobs completados: removidos após 1 hora
- Jobs falhados: removidos após 2 horas
- Mantém últimos 100 completados

---

## 🖥️ Dashboard (Opcional)

Instalar Bull Board para visualizar filas:

```powershell
npm install @bull-board/express @bull-board/api
```

Criar `dashboard.js`:
```javascript
const { createBullBoard } = require('@bull-board/api')
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter')
const { ExpressAdapter } = require('@bull-board/express')
const express = require('express')
const { Queue } = require('bullmq')

const serverAdapter = new ExpressAdapter()
const queue = new Queue('simulador-caixa', {
  connection: {
    host: 'localhost',
    port: 6379,
  },
})

createBullBoard({
  queues: [new BullMQAdapter(queue)],
  serverAdapter,
})

serverAdapter.setBasePath('/admin/queues')

const app = express()
app.use('/admin/queues', serverAdapter.getRouter())

app.listen(3001, () => {
  console.log('🎨 Dashboard disponível em http://localhost:3001/admin/queues')
})
```

Rodar:
```powershell
node dashboard.js
```

---

## 🔧 Troubleshooting

### Redis não conecta
```powershell
docker ps  # Verificar se Redis está rodando
docker logs worker-redis-1  # Ver logs do Redis
```

### Limpar fila
```javascript
const { Queue } = require('bullmq')
const queue = new Queue('simulador-caixa', {
  connection: { host: 'localhost', port: 6379 }
})

await queue.drain()  // Remove todos os jobs
await queue.clean(0, 1000, 'completed')  // Limpa completados
await queue.clean(0, 1000, 'failed')  // Limpa falhados
```

### Ver status da fila
```javascript
const counts = await queue.getJobCounts()
console.log(counts)
// { waiting: 5, active: 2, completed: 10, failed: 1 }
```

---

## 📊 Vantagens da Migração

| Recurso | Antes | Depois |
|---------|-------|--------|
| Retry | ❌ Manual | ✅ Automático |
| Progresso | ❌ Heartbeat manual | ✅ progress 0-100% |
| Recuperação | ❌ Complexa | ✅ Automática |
| Concorrência | ❌ Um por vez | ✅ 2 simultâneos |
| Rate limit | ❌ Não | ✅ 10/min |
| Dashboard | ❌ Não | ✅ Bull Board |
| Escalabilidade | ❌ Difícil | ✅ Fácil |

---

## 🎯 Próximos Passos

1. ✅ Instalar dependências
2. ✅ Substituir arquivos
3. ✅ Testar com 1 job
4. ✅ Testar com múltiplos jobs simultâneos
5. 📈 Ajustar concorrência conforme necessidade
6. 🎨 (Opcional) Instalar Bull Board
7. 🚀 Deploy em produção

---

## 💡 Dicas

- **Aumentar concorrência**: Altere `concurrency: 5` no worker
- **Aumentar timeout**: Altere timeout no processSimulacao
- **Ver logs**: Worker mostra progresso em tempo real
- **Monitorar**: Use Bull Board para visualizar
- **Escalar**: Execute múltiplos workers

---

## ❓ Suporte

Se encontrar problemas:
1. Verifique se Redis está rodando
2. Verifique logs do worker
3. Verifique console do browser (F12)
4. Use Bull Board para inspecionar filas
