# Automação Playwright - Simulador Financiamento Caixa

## 🏗️ Arquitetura

```
Webapp (Next.js) → API Route (/api/simulador-caixa) → BullMQ (Redis) → Worker (Playwright)
                                                                              ↓
                                                                      Resultado retornado
```

## 🚀 Como Executar

### 1. Instalar Dependências

```bash
# Na raiz do projeto
npm install

# No diretório do worker
cd worker
npm install
cd ..
```

### 2. Configurar Variáveis de Ambiente

Adicione ao seu arquivo `.env`:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 3. Iniciar Serviços Docker

```bash
# Iniciar Redis e Worker Playwright
docker-compose up -d

# Ver logs
docker-compose logs -f playwright-worker
```

### 4. Testar a Automação

**Criar um Job:**

```bash
curl -X POST http://localhost:3000/api/simulador-caixa \
  -H "Content-Type: application/json" \
  -d '{
    "origemRecurso": "FGTS",
    "cidade": "São Paulo",
    "valorAvaliacao": "300000",
    "rendaFamiliar": "10000",
    "quantidadeParticipantes": 1,
    "participantes": [{"pactuacao": 100, "dataNascimento": "01/01/1990"}],
    "possuiTresAnosFGTS": true,
    "jaBeneficiadoSubsidio": false,
    "sistemaAmortizacao": "SAC",
    "possuiDependentes": false,
    "nomeCliente": "Teste"
  }'
```

Resposta:

```json
{
  "jobId": "1",
  "status": "pending"
}
```

**Verificar Resultado:**

```bash
curl http://localhost:3000/api/simulador-caixa?jobId=1
```

## 📁 Estrutura de Arquivos

```
vca-tech/
├── docker-compose.yml          # Orquestração Redis (na raiz)
├── Dockerfile.worker           # Container do Worker Playwright
├── worker/
│   ├── docker-compose.yml     # Orquestração local do worker
│   ├── Dockerfile             # Dockerfile do worker
│   ├── package.json           # Dependências do worker (BullMQ + Playwright)
│   └── index.js               # Worker BullMQ que processa jobs
└── src/
    └── app/
        ├── api/
        │   └── simulador-caixa/
        │       ├── route.ts   # API que cria/consulta jobs na fila BullMQ
        │       ├── pdf/       # Geração de PDF dos resultados
        │       └── plano-pdf/ # Geração de PDF do plano
        └── dashboard/
            └── (solucoes)/
                └── simulador-financiamento-caixa/
                    ├── page.tsx
                    ├── resultados/
                    ├── montagem-plano/
                    └── _components/
                        ├── simulador-form.tsx
                        └── resultados-simulacao.tsx
```

## 🔧 Comandos Docker Úteis

```bash
# Parar serviços
docker-compose down

# Reconstruir imagens
docker-compose up -d --build

# Ver logs do Redis
docker-compose logs -f redis

# Ver logs do Worker
docker-compose logs -f playwright-worker

# Acessar Redis CLI
docker exec -it vca-redis redis-cli
```

## ✅ Status Atual

✅ Automação Playwright implementada e funcional
✅ Integração com frontend completa via BullMQ
✅ Sistema de progresso em tempo real
✅ Geração de PDFs dos resultados e planos

## 🎯 Melhorias Futuras

1. **Otimizações**

   - Cache de resultados para simulações similares
   - Rate limiting mais inteligente
   - Retry strategy customizada

2. **Migração para VPS**
   - Ajustar `REDIS_HOST` para IP da VPS
   - Configurar firewall para porta 6379
   - Implementar autenticação Redis com senha

## 🐛 Debug

**Verificar se Redis está rodando:**

```bash
docker exec -it worker-redis-1 redis-cli ping
# Resposta: PONG
```

**Ver jobs na fila BullMQ:**

```bash
# Listar todas as chaves da fila
docker exec -it worker-redis-1 redis-cli KEYS "bull:simulador-caixa:*"

# Ver jobs ativos
docker exec -it worker-redis-1 redis-cli LLEN bull:simulador-caixa:active

# Ver jobs completos
docker exec -it worker-redis-1 redis-cli LLEN bull:simulador-caixa:completed

# Ver jobs com falha
docker exec -it worker-redis-1 redis-cli LLEN bull:simulador-caixa:failed
```

**Limpar a fila:**

```bash
cd worker
npm run queue:clear
```

## 📝 Notas

- O Worker processa jobs em ordem FIFO (First In, First Out)
- Resultados ficam armazenados no Redis por 1 hora
- O Playwright roda em modo headless (sem interface gráfica)
- Logs são visíveis via `docker-compose logs`
