# Automação Playwright - Simulador Financiamento Caixa

## 🏗️ Arquitetura

```
Webapp (Next.js) → API Route (/api/automate) → Redis Queue → Worker (Playwright)
                                                                      ↓
                                                              Resultado no Redis
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
curl -X POST http://localhost:3000/api/automate \
  -H "Content-Type: application/json" \
  -d '{
    "dados": {
      "valor": 300000,
      "prazo": 360,
      "renda": 10000
    }
  }'
```

Resposta:

```json
{
  "success": true,
  "jobId": "abc123xyz",
  "message": "Automação adicionada à fila de processamento"
}
```

**Verificar Resultado:**

```bash
curl http://localhost:3000/api/automate?jobId=abc123xyz
```

## 📁 Estrutura de Arquivos

```
vca-tech/
├── docker-compose.yml          # Orquestração Redis + Worker
├── Dockerfile.worker           # Container do Worker Playwright
├── worker/
│   ├── package.json           # Dependências do worker
│   └── index.js               # Worker que processa jobs
└── src/
    └── app/
        └── api/
            └── automate/
                └── route.ts   # API que cria jobs na fila
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

## 🎯 Próximos Passos

1. **Implementar a automação Playwright** no arquivo `worker/index.js`

   - Adicionar seletores e interações específicas do site da Caixa
   - Preencher campos de formulário
   - Extrair resultados da simulação

2. **Integrar com o frontend** do simulador-financiamento-caixa

   - Criar componente que chama `/api/automate`
   - Implementar polling ou websocket para acompanhar progresso
   - Exibir resultados da simulação

3. **Migração para VPS**
   - Ajustar `REDIS_HOST` para IP da VPS
   - Configurar firewall para porta 6379
   - Implementar autenticação Redis

## 🐛 Debug

**Verificar se Redis está rodando:**

```bash
docker exec -it vca-redis redis-cli ping
# Resposta: PONG
```

**Ver jobs na fila:**

```bash
docker exec -it vca-redis redis-cli LLEN simulador-financiamento:jobs
```

**Ver resultado de um job:**

```bash
docker exec -it vca-redis redis-cli GET simulador-financiamento:result:abc123xyz
```

## 📝 Notas

- O Worker processa jobs em ordem FIFO (First In, First Out)
- Resultados ficam armazenados no Redis por 1 hora
- O Playwright roda em modo headless (sem interface gráfica)
- Logs são visíveis via `docker-compose logs`
