# Migração para Supabase - Calculadora de Correção

Este documento descreve as mudanças realizadas para migrar o armazenamento dos índices IPC-DI, IGP-M, IPCA e Parcelas a Desconsiderar de `localStorage` para o Supabase.

## O que foi alterado?

### 1. Componentes atualizados
- **ipc-di-manager.tsx**: Removido uso de `localStorage`, implementado CRUD completo com Supabase
- **parcelas-desconsiderar-manager.tsx**: Removido uso de `localStorage`, implementado CRUD completo com Supabase
- **parcelas-tabela.tsx**: 
  - Atualizado para buscar parcelas a desconsiderar do Supabase em tempo real
  - **Adiciona carregamento automático dos índices do Supabase para cache local (localStorage)**
  - Isso permite que a função `getIndexRate` continue funcionando sem precisar modificar toda a arquitetura

Todos agora usam `supabaseEpi` (cliente específico para EPIs)

### 2. Schema do banco de dados
- **Arquivo**: `supabase-indices-migration.sql`

#### Tabela `index_entries`
- Colunas: `id`, `mes`, `ano`, `valor`, `tipo`, `created_at`, `updated_at`
- Constraint único para evitar duplicatas: `UNIQUE(mes, ano, tipo)`
- Índices para melhor performance
- RLS (Row Level Security) habilitado
- Trigger para `updated_at` automático

#### Tabela `parcelas_desconsiderar`
- Colunas: `id`, `descricao`, `created_at`, `updated_at`
- Constraint único: `UNIQUE(descricao)`
- Índice para melhor performance
- RLS (Row Level Security) habilitado
- Trigger para `updated_at` automático

### 3. Dados iniciais
- **Arquivo**: `supabase-indices-seed-data.sql`
- Dados de IPC-DI (2017-2026): 102 registros
- Dados de IGP-M (2024-2026): 16 registros
- Dados de IPCA (2024-2026): 16 registros
- Parcelas a Desconsiderar: 8 registros
- **Total: 142 registros iniciais**

> **Nota**: Se você já executou a migração inicial e está faltando dados de dezembro/2025 e início de 2026, execute o arquivo `supabase-hotfix-missing-months.sql` para adicionar apenas os meses faltantes.

### 4. TypeScript Types
- **Arquivo**: `src/types/supabase.ts`
- Adicionada interface `index_entries` com tipos para Row, Insert e Update
- Adicionada interface `parcelas_desconsiderar` com tipos para Row, Insert e Update
Opção 1: Migração completa (primeira vez)

#### Passo 1: Executar o schema no Supabase

1. Acesse o Supabase Dashboard: https://app.supabase.com/project/pwzyfcpgqgbtwibvbpwu/editor
2. Vá para **SQL Editor**
3. Cole o conteúdo do arquivo `supabase-indices-migration.sql`
4. Execute o script

#### Passo 2: Inserir os dados iniciais

1. No **SQL Editor** do Supabase
2. Cole o conteúdo do arquivo `supabase-indices-seed-data.sql`
3. Execute o script

### Opção 2: Hotfix rápido (se já tem dados mas está faltando meses recentes)

Se você já executou a migração mas está recebendo erro de "meses não possuem taxa cadastrada":

1. Acesse o Supabase Dashboard: https://app.supabase.com/project/pwzyfcpgqgbtwibvbpwu/editor
2. Vá para **SQL Editor**
3. Cole o conteúdo do arquivo `supabase-hotfix-missing-months.sql`
4. Execute o script

Este hotfix adiciona:
- Dezembro/2025 para todos os índices
- Janeiro e Fevereiro/2026 para todos os índices
1. No **SQL Editor** do Supabase
2. Cole o conteúdo do arquivo `supabase-indices-seed-data.sql`
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

## Estrutura das tabelas

### Tabela `index_entries`
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

### Tabela `parcelas_desconsiderar`
```sql
CREATE TABLE public.parcelas_desconsiderar (
  id UUID PRIMARY KEY,
  descricao VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

## Funcionalidades implementadas

### Índices de Correção (IPC-DI, IGP-M, IPCA)
✅ **Listar** todos os índices (com filtro por tipo)  
✅ **Adicionar** novo índice  
✅ **Excluir** índice existente  
✅ **Ordenação** automática por ano e mês (mais recentes primeiro)  
✅ **Validação** de duplicatas (não permite mesma combinação de mês/ano/tipo)  
✅ **Error handling** com mensagens amigáveis  

### Parcelas a Desconsiderar
✅ **Listar** todas as parcelas configuradas  
✅ **Adicionar** nova parcela  
✅ **Excluir** parcela existente  
✅ **Ordenação** automática por descrição (ordem alfabética)  
✅ **Validação** de duplicatas (não permite descrições iguais)  
✅ **Integração** em tempo real com cálculo de correção  
✅ **Error handling** com mensagens amigáveis  

## Observações importantes

### Como funciona o sistema agora

- **Supabase** é a fonte de verdade (single source of truth) para todos os dados
- **localStorage** é usado como **cache local** apenas para os índices de correção
- Quando o componente `parcelas-tabela.tsx` é carregado:
  1. Busca automaticamente todos os índices do Supabase
  2. Armazena no localStorage para uso pela função `getIndexRate` 
  3. Isso permite que o cálculo funcione de forma síncrona e rápida
- As **parcelas a desconsiderar** são sempre buscadas em tempo real do Supabase (não ficam em cache)
- Os dados são compartilhados entre todos os usuários
- Existe validação de unicidade no banco de dados:
  - Para índices: mês + ano + tipo
  - Para parcelas: descrição

### ⚠️ Importante sobre atualização de dados

Quando você adicionar/editar/excluir índices pelo gerenciador:
1. Os dados são salvos no Supabase imediatamente
2. Mas o cache local (localStorage) só é atualizado quando a página é recarregada
3. **Solução**: Após modificar índices, recarregue a página da calculadora para atualizar o cache

Alternativamente, você pode limpar o cache manualmente no console do navegador:
```javascript
localStorage.removeItem('index-entries');
```

## Estrutura das tabelas

## Rollback (caso necessário)

Se precisar reverter a migração, o código anterior utilizava `localStorage`:

### Para índices
Chave: `"index-entries"`
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

### Para parcelas a desconsiderar
Chave: `"parcelas-desconsiderar"`
```typescript
type ParcelaDesconsiderar = {
  id: string;
  descricao: string;
  criadoEm: string;
}
```

## Suporte

Em caso de problemas:
1. Verifique os logs do console do navegador
2. Verifique os logs do Supabase
3. Verifique se as variáveis de ambiente estão corretas
4. Verifique se as tabelas foram criadas corretamente no Supabase
5. **Se estiver faltando meses**: Execute o hotfix `supabase-hotfix-missing-months.sql`
6. **Se o cache estiver desatualizado**: Limpe o localStorage com `localStorage.removeItem('index-entries')`
