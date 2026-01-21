# Suporte a Tipos de Empreendimento - EPI

## 📋 Resumo

Implementamos suporte para configurações diferentes de EPIs baseadas no tipo de empreendimento: **Incorporação** e **Loteamento**.

## 🏗️ Arquitetura

### Abordagem Escolhida: ✅ **Coluna de Tipo**
Adicionamos uma coluna `empreendimento_tipo` na tabela `funcao_epi_items` ao invés de duplicar tabelas.

**Vantagens:**
- ✅ Escalável para adicionar mais tipos no futuro
- ✅ Única fonte de verdade
- ✅ Queries mais simples
- ✅ Menos redundância de código

## 📂 Arquivos Modificados

### 1. Schema do Banco de Dados
- **`supabase-schema-and-seed.sql`**: Schema atualizado com ENUM e coluna
- **`migration-add-empreendimento-tipo.sql`**: Script de migração para bancos existentes
- **`supabase-seed-data-updated.sql`**: Seed data atualizado

### 2. Tipos TypeScript
- **`cont-solic-epi-storage.ts`**: 
  - Novo tipo `EmpreendimentoTipo`
  - `FuncaoEpiItem` agora inclui `empreendimentoTipo`
  - Funções async aceitam filtro por tipo

### 3. Componentes
- **`configuracoes-supabase-demo.tsx`**: 
  - Seletor de tipo UI
  - Filtro automático por tipo
  - Salvamento com tipo específico

### 4. Funções Supabase
- **`cont-solic-epi-supabase.ts`**:
  - `loadFuncoesFromDB(empreendimentoTipo?)`: Carrega configurações filtradas
  - `saveFuncoesToDB(funcoes, empreendimentoTipo)`: Salva para tipo específico

## 🗄️ Estrutura do Banco

```sql
-- ENUM
CREATE TYPE empreendimento_tipo AS ENUM ('INCORPORACAO', 'LOTEAMENTO');

-- Tabela funcao_epi_items
CREATE TABLE funcao_epi_items (
  id UUID PRIMARY KEY,
  funcao_id UUID REFERENCES funcoes(id),
  epi TEXT NOT NULL,
  interval_months NUMERIC NOT NULL,
  quantity_per_employee NUMERIC NOT NULL,
  empreendimento_tipo empreendimento_tipo NOT NULL DEFAULT 'INCORPORACAO',
  UNIQUE(funcao_id, epi, empreendimento_tipo) -- Chave única inclui tipo
);

-- Tabela obras
ALTER TABLE obras 
ADD COLUMN empreendimento_tipo empreendimento_tipo NOT NULL DEFAULT 'INCORPORACAO';
```

## 🚀 Como Usar

### Para Banco de Dados Novo
1. Execute `supabase-schema-and-seed.sql`
2. Execute `migration-add-empreendimento-tipo.sql` para duplicar configurações

### Para Banco de Dados Existente
1. Execute `migration-add-empreendimento-tipo.sql`
   - Adiciona coluna
   - Duplica configurações de INCORPORACAO para LOTEAMENTO

### Na Interface
1. Acesse **Configurações** da solução EPI
2. Selecione o tipo: **Incorporação** ou **Loteamento**
3. Configure os EPIs específicos para aquele tipo
4. As alterações são salvas automaticamente por tipo

## 💡 Exemplos de Uso

### Carregar Configurações
```typescript
// Carregar apenas INCORPORACAO
const funcoesIncorp = await loadFuncoesAsync('INCORPORACAO');

// Carregar apenas LOTEAMENTO
const funcoesLote = await loadFuncoesAsync('LOTEAMENTO');

// Carregar todas (sem filtro)
const todasFuncoes = await loadFuncoesAsync();
```

### Salvar Configurações
```typescript
// Salvar para INCORPORACAO
await saveFuncoesAsync(funcoes, 'INCORPORACAO');

// Salvar para LOTEAMENTO
await saveFuncoesAsync(funcoes, 'LOTEAMENTO');
```

## 🎯 Benefícios

1. **Flexibilidade**: Cada tipo de obra tem suas próprias configurações
2. **Escalabilidade**: Fácil adicionar mais tipos no futuro
3. **Manutenibilidade**: Código mais limpo e organizado
4. **Performance**: Queries otimizadas com índices

## 📝 Notas Importantes

- Os dados são sempre salvos em **meses** no banco de dados
- A conversão de dias/semanas/meses/anos é apenas visual
- Cada tipo mantém suas próprias configurações independentes
- A migração duplica automaticamente as configurações existentes

## 🔄 Próximos Passos

Se precisar adicionar mais tipos no futuro:
1. Adicione o novo valor ao ENUM `empreendimento_tipo`
2. Execute script para duplicar configurações base
3. Adicione botão na UI para o novo tipo
