# Migrations do Sistema de Controle de EPIs

Este diretório contém as migrations SQL necessárias para configurar o banco de dados Supabase.

## Ordem de Execução

Execute as migrations na seguinte ordem:

### 1. Migration Base (se ainda não executada)
Certifique-se de que as tabelas base existam:
- `epi_items`
- `funcoes`
- `funcao_epi_items`
- `obras`
- `inventory_snapshots`

### 2. `migration-add-empreendimento-tipo.sql`
Adiciona suporte para tipos de empreendimento (INCORPORACAO/LOTEAMENTO):
- Cria ENUM `empreendimento_tipo`
- Adiciona coluna `empreendimento_tipo` em `funcao_epi_items`
- Adiciona coluna `empreendimento_tipo` em `obras`
- Duplica registros para os dois tipos
- Cria índices de performance

**Status**: ✅ Deve estar executada

### 3. `migration-create-epi-requests.sql` ⚠️ **EXECUTAR AGORA**
Cria a tabela `epi_requests` para histórico de solicitações:
- Tabela `epi_requests` com todos os campos necessários
- Índices para queries rápidas
- Trigger para `updated_at` automático
- Comentários de documentação

**Status**: ❌ Pendente de execução

## Como Executar

1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Crie uma nova query
4. Cole o conteúdo do arquivo `migration-create-epi-requests.sql`
5. Execute a query (Run)
6. Verifique se aparece: "Tabela epi_requests criada com sucesso!"

## Verificação

Após executar, verifique se a tabela foi criada:

```sql
SELECT * FROM information_schema.tables 
WHERE table_name = 'epi_requests';
```

Deve retornar 1 linha.

## Estrutura da Tabela `epi_requests`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | TEXT | ID único da solicitação |
| `obra_id` | TEXT | ID da obra relacionada |
| `obra_name` | TEXT | Nome da obra (denormalizado) |
| `obra_type` | TEXT | INCORPORACAO ou LOTEAMENTO |
| `collected_data` | JSONB | Dados das etapas 1-3 (epiCounts, currentFunctionCounts, projectedFunctionCounts) |
| `request_data` | JSONB | Cálculos detalhados por função |
| `total_summary` | JSONB | Resumo consolidado por EPI |
| `created_at` | TIMESTAMPTZ | Data de criação |
| `created_by_id` | TEXT | ID do usuário |
| `created_by_name` | TEXT | Nome do usuário |
| `status` | TEXT | PENDING, APPROVED, REJECTED, COMPLETED |
| `updated_at` | TIMESTAMPTZ | Última atualização |

## Troubleshooting

### Erro: "Could not find the table 'public.epi_requests'"
**Solução**: Execute a migration `migration-create-epi-requests.sql`

### Erro: "permission denied"
**Solução**: Verifique se você tem permissões de admin no Supabase

### Erro: "duplicate_object"
**Solução**: A tabela já existe, não é necessário executar novamente
