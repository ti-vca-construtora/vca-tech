# Migração para Supabase - Calculadora de Correção

Este documento descreve as mudanças realizadas para migrar o armazenamento dos índices IPC-DI, IGP-M e IPCA de `localStorage` para o Supabase.

## O que foi alterado?

### 1. Componente atualizado
- **Arquivo**: `src/app/dashboard/(solucoes)/calculadora-correcao-pr/_components/ipc-di-manager.tsx`
- Removido uso de `localStorage`
- Implementado CRUD completo com Supabase
- Agora usa `supabaseEpi` (cliente específico para EPIs)

### 2. Schema do banco de dados
- **Arquivo**: `supabase-migration.sql`
- Tabela `index_entries` criada com:
  - Colunas: `id`, `mes`, `ano`, `valor`, `tipo`, `created_at`, `updated_at`
  - Constraint único para evitar duplicatas: `UNIQUE(mes, ano, tipo)`
  - Índices para melhor performance
  - RLS (Row Level Security) habilitado
  - Trigger para `updated_at` automático

### 3. Dados iniciais
- **Arquivo**: `supabase-seed-data.sql`
- Dados de IPC-DI (2017-2025): 98 registros
- Dados de IGP-M (2024-2025): 13 registros
- Dados de IPCA (2024-2025): 13 registros
- Total: 124 registros iniciais

### 4. TypeScript Types
- **Arquivo**: `src/types/supabase.ts`
- Adicionada interface `index_entries` com tipos para Row, Insert e Update

## Como aplicar a migração?

### Passo 1: Executar o schema no Supabase

1. Acesse o Supabase Dashboard: https://app.supabase.com/project/pwzyfcpgqgbtwibvbpwu/editor
2. Vá para **SQL Editor**
3. Cole o conteúdo do arquivo `supabase-migration.sql`
4. Execute o script

### Passo 2: Inserir os dados iniciais

1. No **SQL Editor** do Supabase
2. Cole o conteúdo do arquivo `supabase-seed-data.sql`
3. Execute o script

### Passo 3: Verificar as variáveis de ambiente

Certifique-se de que as seguintes variáveis estão no arquivo `.env`:

```env
NEXT_PUBLIC_SUPABASE_EPI_URL=https://pwzyfcpgqgbtwibvbpwu.supabase.co
NEXT_PUBLIC_SUPABASE_EPI_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3enlmY3BncWdidHdpYnZicHd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMzEwMTEsImV4cCI6MjA3NjkwNzAxMX0.wDhFm5mr662BAe-_LvNSsWHbGTejvEZpIGaBucKvRU8
```

✅ Já estão configuradas no seu `.env`!

### Passo 4: Deploy ou restart local

- **Local**: Reinicie o servidor de desenvolvimento (`npm run dev` ou `yarn dev`)
- **Produção**: Faça o deploy da aplicação

## Verificação

Após a migração, você pode verificar se tudo está funcionando:

1. Acesse a calculadora de correção no dashboard
2. Verifique se os índices estão sendo carregados corretamente
3. Teste adicionar uma nova taxa
4. Teste excluir uma taxa
5. Verifique no Supabase se as operações estão sendo refletidas

## Estrutura da tabela

```sql
CREATE TABLE public.index_entries (
  id UUID PRIMARY KEY,
  mes INTEGER NOT NULL CHECK (mes >= 1 AND mes <= 12),
  ano INTEGER NOT NULL CHECK (ano >= 2000),
  valor DECIMAL(10, 2) NOT NULL,
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('IPC-DI', 'IGP-M', 'IPCA')),
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(mes, ano, tipo)
);
```

## Funcionalidades implementadas

✅ **Listar** todos os índices (com filtro por tipo)  
✅ **Adicionar** novo índice  
✅ **Excluir** índice existente  
✅ **Ordenação** automática por ano e mês (mais recentes primeiro)  
✅ **Validação** de duplicatas (não permite mesma combinação de mês/ano/tipo)  
✅ **Error handling** com mensagens amigáveis  

## Observações importantes

- O `localStorage` não é mais utilizado
- Todos os dados agora estão centralizados no Supabase
- As operações são assíncronas e podem ter um pequeno delay de rede
- Os dados são compartilhados entre todos os usuários
- Existe validação de unicidade no banco de dados (mês + ano + tipo)

## Rollback (caso necessário)

Se precisar reverter a migração, o código anterior utilizava `localStorage` com a chave `"index-entries"`. Os dados estão no formato:

```typescript
type IndexEntry = {
  id: string;
  mes: number;
  ano: number;
  valor: number;
  tipo: "IPC-DI" | "IGP-M" | "IPCA";
  criadoEm: string;
}
```

## Suporte

Em caso de problemas:
1. Verifique os logs do console do navegador
2. Verifique os logs do Supabase
3. Verifique se as variáveis de ambiente estão corretas
4. Verifique se a tabela foi criada corretamente no Supabase
