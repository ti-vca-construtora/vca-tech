# ⚡ Deploy Rápido - Railway (15 minutos)

Este é o guia mais rápido e simples para colocar todo o sistema no ar.

## 🎯 Por que Railway?

- ✅ **Mais simples de todos** - Deploy com cliques
- ✅ **$5 grátis** para começar
- ✅ **Redis incluído** - Não precisa configurar separado
- ✅ **Auto-deploy** - Push no Git = deploy automático
- ✅ **Logs em tempo real**
- ✅ **Custo**: ~$5-15/mês

---

## 📋 Checklist Antes de Começar

- [ ] Código commitado no GitHub
- [ ] Arquivo `.env` NÃO está no Git (deve estar no `.gitignore`)
- [ ] Conta no Railway criada ([railway.app](https://railway.app))
- [ ] Conta no Vercel criada ([vercel.com](https://vercel.com))

---

## 🚀 Parte 1: Deploy do Worker (Railway)

### Passo 1: Criar Projeto no Railway

1. Acesse [railway.app](https://railway.app)
2. Login com GitHub
3. Clique **"New Project"**
4. Selecione **"Deploy from GitHub repo"**
5. Escolha o repositório `vca-tech`

### Passo 2: Deploy do Redis

1. No projeto criado, clique **"New"** (canto superior direito)
2. Selecione **"Database"** → **"Add Redis"**
3. Aguarde deploy (~30 segundos)
4. ✅ Redis está pronto!

### Passo 3: Deploy do Worker

1. Clique **"New"** novamente
2. Selecione **"GitHub Repo"** → Escolha `vca-tech` novamente
3. Railway vai detectar automaticamente o Next.js - **IGNORE ISSO**
4. Clique em **"Settings"** no card do deploy

5. Configure o **Root Directory**:

   - Procure por **"Root Directory"**
   - Digite: `worker`
   - Salve

6. Configure o **Docker**:

   - Em **"Builder"**, selecione **"Dockerfile"**
   - Railway vai detectar `worker/Dockerfile` automaticamente

7. Adicione **Environment Variables**:

   - Clique na aba **"Variables"**
   - Clique **"Add Variable"** ou **"Add Reference"**

   **Opção Fácil (Referenciar Redis):**

   - Clique **"Add Reference"**
   - Selecione o Redis que você criou
   - Railway vai adicionar automaticamente: `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`

   **OU Opção Manual:**

   - Clique no Redis → aba **"Connect"**
   - Copie as variáveis:
     ```
     REDIS_HOST=<valor>
     REDIS_PORT=6379
     REDIS_PASSWORD=<valor>
     ```
   - Cole no Worker

   Adicione também:

   ```
   NODE_ENV=production
   ```

8. Deploy!
   - Volte para a aba **"Deployments"**
   - Railway vai fazer deploy automático
   - Aguarde ~3-5 minutos (baixar Docker + instalar Playwright)

### Passo 4: Verificar se Funcionou

1. Clique na aba **"Logs"**
2. Você deve ver:
   ```
   🚀 Worker iniciado e aguardando jobs...
   ⚙️  Concorrência: 2 jobs simultâneos
   ⏱️  Rate limit: 10 jobs/minuto
   ```

✅ **Worker está rodando!**

### Passo 5: Obter Informações de Conexão

Você vai precisar do `REDIS_HOST` para conectar o frontend.

1. Clique no serviço **Redis**
2. Aba **"Connect"**
3. Procure por **"Private Network"** ou **"Internal"**
4. Copie o valor de `REDIS_HOST` (algo como: `redis.railway.internal`)

📝 **Anote esse valor** - você vai usar na Vercel!

---

## 🌐 Parte 2: Deploy do Frontend (Vercel)

### Passo 1: Conectar Repositório

1. Acesse [vercel.com](https://vercel.com)
2. Login com GitHub
3. Clique **"Add New..."** → **"Project"**
4. Selecione o repositório `vca-tech`

### Passo 2: Configurar Projeto

1. **Framework Preset**: Next.js (detectado automaticamente)
2. **Root Directory**: `./` (raiz do projeto)
3. **Build Command**: `npm run build` (padrão)
4. **Output Directory**: `.next` (padrão)

### Passo 3: Adicionar Variáveis de Ambiente

**⚠️ IMPORTANTE**: Copie TODAS as variáveis do seu arquivo `.env` local.

Clique em **"Environment Variables"** e adicione:

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

# Vistorias
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

# 🔴 REDIS (Copie do Railway)
REDIS_HOST=<VALOR_DO_RAILWAY>
REDIS_PORT=6379
```

**Para `REDIS_HOST`**: Use o valor que você copiou do Railway (Passo 5 da Parte 1)

### Passo 4: Deploy!

1. Clique **"Deploy"**
2. Aguarde ~2 minutos
3. ✅ **Deploy concluído!**

Sua aplicação estará em: `https://vca-tech-xxx.vercel.app`

---

## ✅ Parte 3: Testar o Sistema

### Teste 1: Acessar Frontend

1. Abra a URL da Vercel no navegador
2. Faça login
3. Navegue até **Simulador de Financiamento Caixa**

### Teste 2: Criar Simulação

1. Preencha o formulário
2. Clique em "Iniciar Simulação"
3. Aguarde o processamento
4. Verifique se os resultados aparecem

### Teste 3: Verificar Logs do Worker

1. Volte ao Railway
2. Clique no Worker
3. Aba **"Logs"**
4. Você deve ver:
   ```
   📋 Processando job: 1
   🌐 Navegando para o simulador...
   ✅ Job 1 completado com sucesso
   ```

---

## 🎉 Pronto!

Seu sistema está 100% no ar!

### URLs Importantes

- **Frontend**: `https://vca-tech-xxx.vercel.app`
- **Railway Dashboard**: `https://railway.app/project/<seu-projeto>`

### Próximos Passos (Opcional)

#### Configurar Domínio Customizado

**Na Vercel:**

1. Settings → Domains
2. Adicione seu domínio (ex: `tech.vcaconstrutora.com.br`)
3. Configure DNS conforme instruções

**No Railway:**

1. Settings → Networking
2. Generate Domain ou adicione customizado

#### Monitoramento

**Vercel:**

- Analytics integrado
- Logs em tempo real

**Railway:**

- Metrics automáticos (CPU, RAM, Network)
- Logs em tempo real
- Alertas (opcional)

---

## 💰 Custos Estimados

### Vercel

- **Gratuito** até 100GB bandwidth/mês
- Build time ilimitado
- Domínios customizados grátis

### Railway

- **$5 grátis** para começar
- **Redis**: ~$2-4/mês
- **Worker**: ~$3-8/mês (baseado em uso)
- **Total**: ~$5-12/mês

**Custo Total**: **~$5-12/mês** (após créditos grátis)

---

## 🆘 Problemas?

### Worker não inicia

- ✅ Verifique logs no Railway
- ✅ Confirme que `REDIS_HOST` está configurado
- ✅ Verifique se Redis está rodando

### Frontend não conecta ao Worker

- ✅ Confirme `REDIS_HOST` no Vercel
- ✅ Use o host **internal/private** do Railway
- ✅ Redeploy na Vercel após adicionar variável

### Simulação fica em "pending"

- ✅ Verifique logs do Worker no Railway
- ✅ Confirme que Worker está processando jobs
- ✅ Teste conexão com Redis

### Dúvidas sobre Railway

- 📖 [Documentação Railway](https://docs.railway.app)
- 💬 [Discord Railway](https://discord.gg/railway)

---

## 📞 Checklist Final

- [ ] Worker rodando no Railway
- [ ] Redis funcionando
- [ ] Frontend no ar na Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] Teste de simulação funcionando
- [ ] Logs do worker aparecendo
- [ ] ✅ Sistema 100% operacional!

---

**Tempo total**: ~15 minutos  
**Dificuldade**: ⭐ Fácil  
**Recomendado para**: Todos

Qualquer dúvida, consulte o [DEPLOY.md](DEPLOY.md) completo!
