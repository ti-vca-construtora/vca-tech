# 🏢 VCA Tech - Portal de Soluções Internas

Sistema web completo com múltiplas soluções para automação e gestão interna da VCA Construtora.

## 🚀 Stack Tecnológica

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Node.js + BullMQ + Redis
- **Automação**: Playwright
- **UI Components**: Radix UI + shadcn/ui
- **Banco de Dados**: Firebase + Supabase
- **Autenticação**: Firebase Auth + JWT

## 📦 Principais Funcionalidades

### Soluções Implementadas

- 🏠 **Simulador de Financiamento Caixa** - Automação completa com Playwright
- 📅 **Agenda de Vistorias** - Gestão de agendamentos
- 💰 **Calculadora de Correção PR** - Cálculos financeiros
- 📊 **Calculadora de Juros** - Simulações de juros
- 🚚 **Controle de Cargas** - Gestão logística
- 💳 **Gerador de PIX** - Geração de QR Codes PIX
- 📧 **Huggy Envio em Massa** - Automação de mensagens
- 🛴 **Reserva de Patinete** - Sistema de reservas

### APIs Integradas

- Sienge API
- AVP (Análise de Viabilidade de Proposta)
- CV CRM (VCA + Lotear)
- Huggy
- Firebase
- Supabase

## 🏃 Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais

# Rodar desenvolvimento
npm run dev

# Build para produção
npm run build
npm start
```

Acesse: [http://localhost:3000](http://localhost:3000)

## 🤖 Worker de Automação

O worker processa automações do simulador da Caixa usando Playwright e BullMQ.

```bash
# Entrar na pasta worker
cd worker

# Instalar dependências
npm install

# Configurar Redis
docker-compose up -d redis

# Rodar worker
npm start
```

Documentação completa: [worker/README.md](worker/README.md)

## 🚀 Deploy

### 📖 Documentação de Deploy Disponível

**Para começar rápido (RECOMENDADO):**

- 🚀 **[DEPLOY-QUICK.md](DEPLOY-QUICK.md)** - Deploy Railway em 15 minutos (passo-a-passo)

**Para explorar todas as opções:**

- 📊 **[DEPLOY-COMPARISON.md](DEPLOY-COMPARISON.md)** - Comparação detalhada de plataformas
- 📚 **[DEPLOY.md](DEPLOY.md)** - Guia completo de deploy (5 opções)
- ✅ **[STATUS.md](STATUS.md)** - Status do projeto e checklist

### 🏆 Recomendação

**Vercel (Frontend - GRÁTIS) + Railway (Worker - $5-15/mês)**

✅ Deploy em 15 minutos  
✅ Zero configuração DevOps  
✅ Auto-deploy no Git push  
✅ Logs em tempo real

👉 **Siga**: [DEPLOY-QUICK.md](DEPLOY-QUICK.md)

## 📁 Estrutura do Projeto

```
vca-tech/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   ├── dashboard/         # Área autenticada
│   │   └── login/             # Autenticação
│   ├── components/            # Componentes React
│   ├── hooks/                 # Custom Hooks
│   ├── lib/                   # Utilitários
│   ├── services/              # Serviços externos
│   ├── store/                 # Estado global (Zustand)
│   └── types/                 # TypeScript types
├── worker/                    # Worker BullMQ + Playwright
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── index.js              # Processador de jobs
│   └── package.json
├── public/                    # Assets estáticos
└── package.json
```

## 🔐 Autenticação e Permissões

Sistema de autenticação com Firebase e controle de acesso baseado em:

- Áreas (comercial, obras, financeiro, etc.)
- Permissões específicas por solução
- Níveis de usuário (admin, user, viewer)

## 📚 Documentação

- **[AUTOMACAO-README.md](AUTOMACAO-README.md)** - Documentação da automação Playwright
- **[DEPLOY.md](DEPLOY.md)** - Guia completo de deploy
- **[worker/README.md](worker/README.md)** - Documentação do worker

## 🛠️ Scripts Disponíveis

```bash
npm run dev      # Desenvolvimento
npm run build    # Build produção
npm start        # Rodar produção
npm run lint     # Linter
```

## 🌐 Ambientes

- **Desenvolvimento**: http://localhost:3000
- **Produção**: https://vca-tech.vercel.app (ou seu domínio)

## 📝 Variáveis de Ambiente

Arquivo `.env` requerido com as seguintes variáveis:

```bash
# APIs Sienge
NEXT_PUBLIC_HASH_BASIC=
NEXT_PUBLIC_HASH_BASIC_LOTEAR=
NEXT_PUBLIC_API_URL=

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
# ... outras configs Firebase

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=

# Redis (Worker)
REDIS_HOST=
REDIS_PORT=
```

Ver `.env` completo no arquivo de exemplo.

## 🤝 Contribuindo

1. Clone o repositório
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit suas mudanças: `git commit -m 'Adiciona nova funcionalidade'`
4. Push para a branch: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

## 📄 Licença

Propriedade da VCA Construtora - Todos os direitos reservados.

---

**Desenvolvido por**: Equipe VCA Tech  
**Última atualização**: Dezembro 2025
