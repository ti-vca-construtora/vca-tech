# 🎯 Guia Visual de Deploy - 3 Passos

## TL;DR (Too Long, Didn't Read)

**Frontend** → Vercel (Grátis)  
**Worker** → Railway ($5-15/mês)  
**Tempo total**: 15 minutos

---

## 📍 Você está aqui

```
┌─────────────────────────────────────┐
│  💻 Código pronto localmente        │
│  ✅ Funciona no seu computador      │
│  🎯 Quer colocar na internet        │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│  🚀 SEGUIR ESTE GUIA                │
│  ⏱️  15 minutos                     │
│  💰 $5-15/mês após créditos         │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│  🌐 Sistema no ar e acessível       │
│  ✅ Frontend: vca-tech.vercel.app   │
│  ✅ Worker: processando automações  │
└─────────────────────────────────────┘
```

---

## 🎬 Passo 1: Preparar (2 minutos)

### O que você precisa:

#### ✅ Contas (gratuitas)

- [ ] GitHub (onde está seu código)
- [ ] Vercel ([vercel.com](https://vercel.com))
- [ ] Railway ([railway.app](https://railway.app))

#### ✅ Informações

- [ ] Arquivo `.env` com todas as variáveis
- [ ] Repositório Git commitado e com push

### Ação:

```bash
# 1. Garantir que está commitado
git add .
git commit -m "Preparando para deploy"
git push origin main

# 2. Verificar .gitignore
# .env deve estar listado (NÃO fazer push do .env)
cat .gitignore | grep .env
```

---

## 🤖 Passo 2: Deploy Worker (7 minutos)

### Acesse [railway.app](https://railway.app)

```
┌──────────────────────────────────────────┐
│  1. New Project                          │
│     ↓                                    │
│  2. Deploy from GitHub repo              │
│     ↓                                    │
│  3. Selecione "vca-tech"                 │
└──────────────────────────────────────────┘
```

### Configurar Redis

```
┌──────────────────────────────────────────┐
│  No projeto criado:                      │
│                                          │
│  1. Clique "New" → "Database" → "Redis" │
│     ⏱️  Aguarde 30s                       │
│     ✅ Redis pronto!                      │
└──────────────────────────────────────────┘
```

### Configurar Worker

```
┌──────────────────────────────────────────┐
│  No card do deploy do worker:           │
│                                          │
│  1. Settings → Root Directory: "worker" │
│  2. Builder: "Dockerfile"                │
│  3. Variables → Add Reference → Redis   │
│  4. Add Variable: NODE_ENV=production   │
│  5. Aguardar deploy (~3 min)            │
└──────────────────────────────────────────┘
```

### Verificar

```
┌──────────────────────────────────────────┐
│  Clique no Worker → Logs                 │
│                                          │
│  Deve aparecer:                          │
│  🚀 Worker iniciado e aguardando jobs... │
│                                          │
│  ✅ WORKER FUNCIONANDO!                  │
└──────────────────────────────────────────┘
```

### Copiar REDIS_HOST

```
┌──────────────────────────────────────────┐
│  Clique no Redis → Connect               │
│                                          │
│  Copie:                                  │
│  📋 REDIS_HOST=redis.railway.internal    │
│                                          │
│  (você vai precisar no Passo 3)         │
└──────────────────────────────────────────┘
```

---

## 🌐 Passo 3: Deploy Frontend (6 minutos)

### Acesse [vercel.com](https://vercel.com)

```
┌──────────────────────────────────────────┐
│  1. Add New... → Project                 │
│     ↓                                    │
│  2. Import Git Repository: "vca-tech"    │
│     ↓                                    │
│  3. Framework Preset: Next.js ✅         │
└──────────────────────────────────────────┘
```

### Adicionar Variáveis de Ambiente

```
┌──────────────────────────────────────────┐
│  Clique "Environment Variables"          │
│                                          │
│  Cole TODAS as variáveis do .env:        │
│                                          │
│  ⚠️  IMPORTANTE:                          │
│  REDIS_HOST=<valor_copiado_do_railway>   │
│  REDIS_PORT=6379                         │
│                                          │
│  + Todas as outras do arquivo .env       │
└──────────────────────────────────────────┘
```

### Deploy!

```
┌──────────────────────────────────────────┐
│  Clique "Deploy"                         │
│                                          │
│  ⏱️  Aguarde ~2 minutos                   │
│                                          │
│  ✅ Deploy concluído!                     │
│                                          │
│  🌐 URL: https://vca-tech-xxx.vercel.app │
└──────────────────────────────────────────┘
```

---

## ✅ Verificação Final (3 minutos)

### Teste o Sistema

```
┌──────────────────────────────────────────┐
│  1. Abra a URL da Vercel                 │
│     ↓                                    │
│  2. Faça Login                           │
│     ↓                                    │
│  3. Vá em "Simulador Financiamento"      │
│     ↓                                    │
│  4. Preencha e envie uma simulação       │
│     ↓                                    │
│  5. Aguarde processamento                │
│     ↓                                    │
│  6. Veja os resultados!                  │
└──────────────────────────────────────────┘
```

### Verificar Logs do Worker

```
┌──────────────────────────────────────────┐
│  Railway → Worker → Logs                 │
│                                          │
│  Você deve ver:                          │
│  📋 Processando job: 1                   │
│  🌐 Navegando para o simulador...        │
│  ✅ Job 1 completado com sucesso         │
└──────────────────────────────────────────┘
```

---

## 🎉 Pronto!

```
╔═══════════════════════════════════════════╗
║  ✅ SISTEMA 100% OPERACIONAL              ║
║                                           ║
║  🌐 Frontend: Online                      ║
║  🤖 Worker: Processando                   ║
║  📊 Redis: Conectado                      ║
║                                           ║
║  💰 Custo: ~$5-15/mês                     ║
║  ⏱️  Deploy: 15 minutos                   ║
╚═══════════════════════════════════════════╝
```

---

## 🔍 Checklist Rápido

Antes de começar:

- [ ] ✅ Código no GitHub
- [ ] ✅ Arquivo `.env` salvo (local, não no Git)
- [ ] ✅ Contas Vercel e Railway criadas

Passo 2 (Worker):

- [ ] ✅ Projeto criado no Railway
- [ ] ✅ Redis deployado
- [ ] ✅ Worker configurado (root: worker)
- [ ] ✅ Variáveis adicionadas
- [ ] ✅ REDIS_HOST copiado
- [ ] ✅ Logs mostrando "Worker iniciado"

Passo 3 (Frontend):

- [ ] ✅ Projeto importado na Vercel
- [ ] ✅ TODAS variáveis adicionadas (incluindo REDIS_HOST)
- [ ] ✅ Deploy concluído
- [ ] ✅ Site acessível

Verificação:

- [ ] ✅ Login funciona
- [ ] ✅ Simulação processa
- [ ] ✅ Logs do worker aparecem
- [ ] ✅ Resultados são exibidos

---

## 🆘 Problemas?

### "Worker não inicia"

→ Verifique logs no Railway  
→ Confirme REDIS_HOST está configurado

### "Frontend não conecta"

→ Confirme REDIS_HOST no Vercel  
→ Use o host "internal" do Railway  
→ Faça Redeploy na Vercel

### "Simulação fica pending"

→ Verifique logs do Worker  
→ Confirme Worker está rodando  
→ Teste conexão Redis

### Mais ajuda

📖 [DEPLOY-QUICK.md](DEPLOY-QUICK.md) - Guia detalhado  
📚 [DEPLOY.md](DEPLOY.md) - Troubleshooting completo

---

## 📞 Próximos Passos Opcionais

Depois que estiver funcionando:

### Configurar Domínio Customizado

```
Vercel → Settings → Domains
→ Adicionar tech.seudominio.com.br
```

### Monitoramento

```
Railway → Metrics (automático)
Vercel → Analytics (automático)
```

### Backups

```
Railway → Configure backup schedule
```

---

## 💡 Dicas Pro

1. **Redeploy Fácil**: Push no Git = deploy automático
2. **Preview Deploys**: PRs geram URLs de preview
3. **Logs**: Sempre verifique logs em caso de problema
4. **Custos**: Railway cobra por uso real (não fixo)
5. **Escalabilidade**: Ambas plataformas escalam automaticamente

---

**Tempo Total**: ⏱️ ~15 minutos  
**Custo Inicial**: 💰 Grátis (créditos)  
**Custo Mensal**: 💰 $5-15  
**Dificuldade**: ⭐ Fácil

**🚀 Comece agora!**
