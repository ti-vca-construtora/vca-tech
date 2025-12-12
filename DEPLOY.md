# 🚀 Guia Completo de Deploy - VCA Tech

## 📋 Índice

- [Visão Geral da Arquitetura](#visão-geral-da-arquitetura)
- [Status do Projeto](#status-do-projeto)
- [Opções de Deploy](#opções-de-deploy)
- [Deploy Frontend (Vercel) - RECOMENDADO](#deploy-frontend-vercel---recomendado)
- [Deploy Worker](#deploy-worker)
  - [Opção 1: Railway (Mais Simples) ⭐](#opção-1-railway-mais-simples-)
  - [Opção 2: Render](#opção-2-render)
  - [Opção 3: AWS EC2](#opção-3-aws-ec2)
  - [Opção 4: VPS + PM2](#opção-4-vps--pm2)
  - [Opção 5: DigitalOcean App Platform](#opção-5-digitalocean-app-platform)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Monitoramento e Troubleshooting](#monitoramento-e-troubleshooting)

---

## 🏗️ Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        VERCEL (Frontend)                     │
│  Next.js + API Routes (/api/simulador-caixa, /api/pdf)     │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP API Calls
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              RAILWAY/VPS (Worker Backend)                    │
│  ┌───────────────────┐       ┌──────────────────┐          │
│  │  Redis (BullMQ)   │◄─────►│ Node.js Worker   │          │
│  │  Queue Manager    │       │ + Playwright     │          │
│  └───────────────────┘       └──────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

**Componentes:**

1. **Frontend (Next.js)**: Hospedado na Vercel - Interface do usuário + API Routes
2. **Worker (Node.js + Playwright)**: Processa automação do simulador da Caixa
3. **Redis**: Fila de jobs do BullMQ

---

## ✅ Status do Projeto

### Frontend

- ✅ **Pronto para Deploy**
- ✅ Configurado para Vercel
- ✅ Todas as APIs Routes funcionando
- ✅ Variáveis de ambiente organizadas
- ⚠️ **PENDÊNCIA**: Adicionar variável `REDIS_HOST` no Vercel apontando para o Worker

### Worker

- ✅ **Pronto para Deploy**
- ✅ Docker configurado
- ✅ BullMQ + Playwright funcionando
- ✅ Processamento de jobs implementado
- ✅ Geração de PDF implementada

---

## 🎯 Opções de Deploy

### Comparação Rápida

| Plataforma       | Dificuldade      | Custo      | Escalabilidade | Tempo Setup |
| ---------------- | ---------------- | ---------- | -------------- | ----------- |
| **Railway** ⭐   | ⭐ Fácil         | $5-20/mês  | Boa            | 10 min      |
| **Render**       | ⭐⭐ Médio       | $7-25/mês  | Boa            | 15 min      |
| **AWS EC2**      | ⭐⭐⭐⭐ Difícil | $10-30/mês | Excelente      | 60 min      |
| **VPS + PM2**    | ⭐⭐⭐ Médio     | $5-15/mês  | Boa            | 30 min      |
| **DigitalOcean** | ⭐⭐ Médio       | $5-20/mês  | Boa            | 20 min      |

**🏆 RECOMENDAÇÃO: Railway** (mais simples, rápido e eficiente)

---

## 🌐 Deploy Frontend (Vercel) - RECOMENDADO

### Por que Vercel?

- ✅ Deploy automático do Next.js
- ✅ Serverless functions otimizadas
- ✅ CDN global
- ✅ Preview deploys automáticos
- ✅ **GRÁTIS** para projetos pessoais/comerciais

### Passo a Passo

#### 1. Preparar o Repositório

```bash
# Garantir que .env não está no Git
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore

# Commit e push
git add .
git commit -m "Preparando para deploy"
git push origin main
```

#### 2. Deploy na Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub
3. Clique em **"New Project"**
4. Selecione o repositório `vca-tech`
5. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

#### 3. Adicionar Variáveis de Ambiente

Copie TODAS as variáveis do seu `.env` e adicione na Vercel:

**Environment Variables:**

```bash
# APIs Sienge
NEXT_PUBLIC_HASH_BASIC=dmNhLXRlY2g6OHc3V0tIRDZpOEExNWpGY1RqN2xkR0JIZ3pzWWdsVTU=
NEXT_PUBLIC_HASH_BASIC_LOTEAR=dmNhbG90ZWFyLXRlY2g6NUprSjJYOWpydUZWWjBsYjVNSkg0MTdsMkdSc2tOWGQ=
NEXT_PUBLIC_API_URL=https://api.sienge.com.br/

# Google reCAPTCHA
NEXT_PUBLIC_GOOGLE_SITE_KEY=6LcCJtwqAAAAAIlpX5QESdsnF4Xn_kQbSUXFCeT-
NEXT_PUBLIC_GOOGLE_SECRET_KEY=6LcCJtwqAAAAAFgwK4ouZeugomf5ty7dzkPNzdyW

# VCA Tech API
NEXT_PUBLIC_TECH_API_URL=https://api.suportevca.com.br

# Vistorias Token
NEXT_PUBLIC_VISTORIAS_TOKEN=<seu_token>

# CV API VCA
NEXT_PUBLIC_EMAIL_CV_API_VCA=tech@vcaconstrutora.com.br
NEXT_PUBLIC_TOKEN_CV_API_VCA=00501c7d41012e83bdd763c09125a6d995924e61

# CV API Lotear
NEXT_PUBLIC_EMAIL_CV_API_LOTEAR=tech@vcaconstrutora.com.br
NEXT_PUBLIC_TOKEN_CV_API_LOTEAR=4e5739b342d709ac7f918b851980219a12e1c30a

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBHbQizDRdd5tUBXK6WDlDCkl0HvZnpQ0E
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=reserva-patinete-vca.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=reserva-patinete-vca
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=reserva-patinete-vca.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=548173641607
NEXT_PUBLIC_FIREBASE_APP_ID=1:548173641607:web:0ea62bac2bdf664de58522
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-9EPNTM1GRE
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://reserva-patinete-vca-default-rtdb.firebaseio.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://rtatdninbzrkrvtcmabw.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_yWW75zEi5zRPm-7SOoBP_w_Rbc-Wu1C

# Admin
NEXT_PUBLIC_ADMIN_PASSWORD=0X8TgpGPH26T

# Huggy
NEXT_PUBLIC_HUGGY_V3_URL=https://api.huggy.app/v3
NEXT_PUBLIC_ACCESS_TOKEN_V3=<seu_token_huggy>

# 🔴 IMPORTANTE: Adicione após fazer deploy do Worker
REDIS_HOST=<URL_DO_RAILWAY_OU_VPS>
REDIS_PORT=6379
```

#### 4. Deploy!

Clique em **"Deploy"** e aguarde ~2 minutos.

✅ Seu frontend estará disponível em: `https://vca-tech.vercel.app` (ou domínio customizado)

---

## 🤖 Deploy Worker

## Opção 1: Railway (Mais Simples) ⭐

### Por que Railway?

- ✅ Deploy com 1 clique via Docker
- ✅ Redis incluído (managed)
- ✅ Logs em tempo real
- ✅ Auto-scaling
- ✅ $5 de crédito grátis
- ✅ Faturamento por uso real

### Passo a Passo

#### 1. Criar Conta no Railway

1. Acesse [railway.app](https://railway.app)
2. Faça login com GitHub
3. Adicione um cartão (necessário mesmo com créditos grátis)

#### 2. Deploy do Redis

1. No Dashboard, clique **"New Project"**
2. Selecione **"Deploy Redis"**
3. Aguarde deploy completar (~1 min)
4. Clique no Redis deployment
5. Vá em **"Connect"** → Copie as variáveis:
   - `REDIS_HOST`
   - `REDIS_PORT`
   - `REDIS_PASSWORD` (opcional)

#### 3. Deploy do Worker

1. No mesmo projeto, clique **"New"** → **"GitHub Repo"**
2. Selecione o repositório `vca-tech`
3. Configure:

   - **Root Directory**: `worker`
   - **Dockerfile Path**: `worker/Dockerfile`

4. Adicionar variáveis de ambiente:

   - `REDIS_HOST`: (copie do Redis deployment)
   - `REDIS_PORT`: `6379`
   - `NODE_ENV`: `production`

5. Clique **"Deploy"**

#### 4. Obter URL Pública do Worker

1. No deployment do Worker, vá em **"Settings"**
2. Clique **"Generate Domain"**
3. Copie a URL (ex: `vca-worker.railway.app`)

#### 5. Conectar Frontend ao Worker

1. Volte ao Vercel
2. Em **"Settings"** → **"Environment Variables"**
3. Adicione/Atualize:
   ```
   REDIS_HOST=<REDIS_HOST_DO_RAILWAY>
   REDIS_PORT=6379
   ```
4. Clique **"Redeploy"** para aplicar

✅ **Pronto!** Seu sistema está 100% funcional!

### Custos Estimados Railway

- **Redis**: ~$2-5/mês
- **Worker**: ~$3-10/mês (baseado em uso)
- **Total**: ~$5-15/mês

---

## Opção 2: Render

### Vantagens

- ✅ Plano gratuito generoso
- ✅ Deploy via Docker
- ✅ Fácil de usar

### Passo a Passo

#### 1. Criar Conta

1. Acesse [render.com](https://render.com)
2. Faça login com GitHub

#### 2. Deploy Redis

1. Clique **"New +"** → **"Redis"**
2. Configure:

   - **Name**: `vca-redis`
   - **Region**: `Ohio` (mais barato)
   - **Plan**: Free ou Starter ($7/mês)

3. Copie a **Connection String** (Internal)

#### 3. Deploy Worker

1. Clique **"New +"** → **"Web Service"**
2. Conecte seu repositório GitHub
3. Configure:

   - **Name**: `vca-worker`
   - **Region**: `Ohio`
   - **Root Directory**: `worker`
   - **Environment**: Docker
   - **Dockerfile Path**: `worker/Dockerfile`
   - **Plan**: Free (com limitações) ou Starter ($7/mês)

4. Adicione Environment Variables:

   ```
   REDIS_HOST=<internal_host_do_redis>
   REDIS_PORT=6379
   NODE_ENV=production
   ```

5. Clique **"Create Web Service"**

#### 4. Conectar ao Vercel

Copie a URL pública do Worker e adicione no Vercel como `REDIS_HOST`.

### Custos Render

- **Gratuito**: Redis + Worker (com sleep após inatividade)
- **Pago**: $14/mês (Redis $7 + Worker $7)

---

## Opção 3: AWS EC2

### ⚠️ Recomendado apenas se você já conhece AWS

### Vantagens

- ✅ Total controle
- ✅ Escalabilidade ilimitada
- ✅ Integração com outros serviços AWS

### Desvantagens

- ❌ Complexo de configurar
- ❌ Requer conhecimento de DevOps
- ❌ Custos podem crescer rapidamente

### Passo a Passo Resumido

#### 1. Criar Instância EC2

1. Acesse AWS Console → EC2
2. **Launch Instance**:
   - **AMI**: Ubuntu 22.04 LTS
   - **Instance Type**: t3.small (2 vCPU, 2GB RAM) - ~$15/mês
   - **Security Group**: Abrir portas 22 (SSH), 6379 (Redis), 3000 (Worker)
   - **Storage**: 20GB

#### 2. Instalar Docker

```bash
# Conectar via SSH
ssh -i sua-chave.pem ubuntu@<IP_DA_EC2>

# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 3. Clonar Repositório e Deploy

```bash
# Instalar Git
sudo apt install git -y

# Clonar repositório
git clone https://github.com/seu-usuario/vca-tech.git
cd vca-tech/worker

# Configurar variáveis
nano .env
# Adicione:
# REDIS_HOST=localhost
# REDIS_PORT=6379
# NODE_ENV=production

# Subir com Docker Compose
sudo docker-compose up -d --build

# Ver logs
sudo docker-compose logs -f
```

#### 4. Configurar Acesso Externo

```bash
# Instalar Nginx como reverse proxy
sudo apt install nginx -y

# Configurar
sudo nano /etc/nginx/sites-available/worker

# Adicione:
server {
    listen 80;
    server_name <SEU_IP_OU_DOMINIO>;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Ativar
sudo ln -s /etc/nginx/sites-available/worker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. Conectar ao Vercel

No Vercel, adicione:

```
REDIS_HOST=<IP_PUBLICO_DA_EC2>
REDIS_PORT=6379
```

### Custos AWS

- **EC2 t3.small**: ~$15/mês
- **EBS 20GB**: ~$2/mês
- **Transferência**: ~$1-5/mês
- **Total**: ~$18-22/mês

---

## Opção 4: VPS + PM2

### Provedores Recomendados

- **Contabo**: €5-10/mês (melhor custo-benefício)
- **Hetzner**: €5-15/mês (boa performance)
- **DigitalOcean**: $6-12/mês (fácil de usar)
- **Linode (Akamai)**: $5-10/mês

### Passo a Passo (Usando Contabo como exemplo)

#### 1. Criar VPS

1. Acesse [contabo.com](https://contabo.com)
2. Escolha plano VPS S (4 GB RAM) - €5/mês
3. OS: Ubuntu 22.04
4. Receba credenciais por email

#### 2. Configurar Servidor

```bash
# Conectar via SSH
ssh root@<IP_DO_VPS>

# Atualizar
apt update && apt upgrade -y

# Instalar Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# Instalar PM2
npm install -g pm2

# Instalar Redis
apt install redis-server -y
systemctl enable redis-server
systemctl start redis-server

# Instalar Playwright dependencies
apt install -y \
  libnss3 \
  libnspr4 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libdrm2 \
  libxkbcommon0 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  libgbm1 \
  libasound2
```

#### 3. Deploy do Worker

```bash
# Criar usuário para o app
adduser --disabled-password --gecos "" worker
su - worker

# Clonar repositório
git clone https://github.com/seu-usuario/vca-tech.git
cd vca-tech/worker

# Instalar dependências
npm install

# Instalar Playwright browsers
npx playwright install chromium

# Criar arquivo .env
nano .env
# Adicione:
# REDIS_HOST=localhost
# REDIS_PORT=6379
# NODE_ENV=production

# Iniciar com PM2
pm2 start index.js --name vca-worker

# Configurar PM2 para auto-start
pm2 startup
pm2 save

# Ver logs
pm2 logs vca-worker
```

#### 4. Configurar Firewall

```bash
# Instalar UFW
apt install ufw

# Configurar regras
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable
```

#### 5. Opcional: Configurar Domínio e HTTPS

```bash
# Instalar Nginx
apt install nginx certbot python3-certbot-nginx -y

# Configurar Nginx
nano /etc/nginx/sites-available/worker

# Adicione config (similar à AWS)

# Ativar SSL com Let's Encrypt
certbot --nginx -d worker.seudominio.com
```

### Custos VPS

- **Contabo VPS S**: €5/mês (~$5.50)
- **Total**: ~$5-8/mês

---

## Opção 5: DigitalOcean App Platform

### Vantagens

- ✅ Muito fácil de usar
- ✅ Similar ao Railway
- ✅ Documentação excelente

### Passo a Passo

1. Acesse [digitalocean.com](https://digitalocean.com)
2. Clique **"Create"** → **"Apps"**
3. Conecte GitHub e selecione repositório
4. Configure:
   - **Source Directory**: `worker`
   - **Dockerfile**: `worker/Dockerfile`
5. Adicione Redis Managed Database
6. Configure variáveis de ambiente
7. Deploy!

### Custos DigitalOcean

- **App (Basic)**: $5/mês
- **Redis (Basic)**: $15/mês
- **Total**: ~$20/mês

---

## 📝 Variáveis de Ambiente

### Frontend (Vercel)

```bash
# OBRIGATÓRIAS para o Worker funcionar
REDIS_HOST=<URL_DO_WORKER_BACKEND>
REDIS_PORT=6379

# Todas as outras variáveis do .env
NEXT_PUBLIC_*
```

### Worker (Railway/VPS/EC2)

```bash
# OBRIGATÓRIAS
REDIS_HOST=localhost  # ou URL do Redis managed
REDIS_PORT=6379
NODE_ENV=production

# OPCIONAIS (se Redis tiver senha)
REDIS_PASSWORD=<senha>
```

---

## 📊 Monitoramento e Troubleshooting

### Verificar Status do Worker

#### Railway

1. Acesse o dashboard do projeto
2. Clique no Worker deployment
3. Vá em **"Logs"**

#### Render/DigitalOcean

Similar - acesse os logs pelo dashboard

#### VPS/EC2

```bash
# PM2
pm2 status
pm2 logs vca-worker --lines 100

# Docker
docker-compose logs -f
docker ps

# Redis
redis-cli ping
redis-cli KEYS "bull:simulador-caixa:*"
```

### Testar o Sistema

```bash
# Testar API do frontend
curl https://vca-tech.vercel.app/api/simulador-caixa

# Criar um job de teste
curl -X POST https://vca-tech.vercel.app/api/simulador-caixa \
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

### Problemas Comuns

#### Worker não conecta ao Redis

- ✅ Verifique `REDIS_HOST` e `REDIS_PORT`
- ✅ Confirme que Redis está rodando
- ✅ Verifique firewall/security groups

#### Jobs ficam em "pending"

- ✅ Worker está rodando?
- ✅ Verifique logs do worker
- ✅ Redis tem jobs na fila?

#### Playwright falha no Docker

- ✅ Verifique se o Docker tem memória suficiente (mínimo 2GB)
- ✅ Aumente timeout se necessário
- ✅ Verifique logs para erros específicos

---

## 🎯 Recomendação Final

### Para Produção Imediata (Mais Simples)

**Railway** - Deploy em 10 minutos, custo ~$10-15/mês

### Para Melhor Custo-Benefício

**VPS (Contabo) + PM2** - ~$5/mês, setup 30 min

### Para Máxima Escalabilidade

**AWS EC2** - Complexo mas infinitamente escalável

---

## 📞 Suporte

Se tiver dúvidas durante o deploy:

1. Verifique os logs primeiro
2. Consulte a documentação da plataforma
3. Teste a conexão Redis manualmente
4. Revise as variáveis de ambiente

---

**Última atualização**: Dezembro 2025
**Versão**: 1.0.0
