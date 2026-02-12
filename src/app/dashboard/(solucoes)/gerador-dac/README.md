# Gerador de DAC (Recibo de Pagamento)

## Descrição

Sistema para geração de recibos de pagamento em PDF. Permite criar recibos profissionais com logo da empresa, dados completos do pagador e recebedor.

## Funcionalidades

### Formulário de Dados

O formulário coleta as seguintes informações:

#### Dados do Recebedor
- **Nome da Pessoa**: Nome completo da pessoa que recebe o pagamento
- **CPF ou CNPJ**: Documento de identificação (com máscara automática)

#### Dados do Pagamento
- **Valor Líquido**: Valor do pagamento (com formatação de moeda)
- **Descrição do Serviço**: Descrição detalhada do serviço prestado

#### Dados da Empresa Pagadora
- **Nome da Empresa**: Razão social da empresa pagadora
- **CNPJ da Empresa**: CNPJ da empresa (com máscara automática)

### Geração do Recibo

O recibo gerado em PDF contém:

1. **Logo da VCA** no topo do documento
2. **Título**: "RECIBO DE PAGAMENTO"
3. **Texto do recibo** com:
   - Nome e CNPJ da empresa pagadora
   - Valor em formato numérico e por extenso
   - Descrição do serviço
4. **Área de assinatura** com:
   - Linha para assinatura
   - Nome do recebedor
   - CPF/CNPJ do recebedor
5. **Data e local**: Vitória da Conquista - BA, [data por extenso]

### Preview e Download

- **Preview em tempo real**: Visualização do PDF antes do download
- **Download instantâneo**: Baixar o recibo em formato PDF
- **Atualização dinâmica**: Recibo é atualizado conforme os dados são preenchidos

## Validações

Todos os campos são obrigatórios:
- Validação de preenchimento
- Máscaras automáticas para CPF/CNPJ
- Formatação automática de valores monetários
- Conversão de valores para extenso

## Permissões

- **Área requerida**: Financeiro
- **Permissão requerida**: gerador-dac

## Tecnologias

- Next.js 14
- TypeScript
- Puppeteer (geração de PDF)
- shadcn/ui (componentes)
- Tailwind CSS

## API

### POST /api/gerador-dac

Gera o PDF do recibo com base nos dados fornecidos.

**Body:**
```json
{
  "nomePessoa": "João Silva",
  "cpfCnpjPessoa": "000.000.000-00",
  "valorLiquido": "R$ 80,00",
  "descricaoServico": "Serviço de chaveiro in loco",
  "nomeEmpresa": "VCA CONSTRUTORA",
  "cnpjEmpresa": "15.464.677/0001-58"
}
```

**Response:**
- Retorna o PDF em formato binário
- Content-Type: `application/pdf`
- Nome do arquivo: `Recibo-[timestamp].pdf`

## Estrutura de Arquivos

```
gerador-dac/
├── page.tsx                    # Página principal
├── components/
│   ├── gerador-dac-form.tsx   # Formulário de dados
│   └── preview-pdf.tsx        # Preview do PDF
└── README.md                   # Esta documentação
```

## Como Usar

1. Acesse a página do Gerador de DAC
2. Preencha todos os campos do formulário
3. Clique em "Gerar Preview" para visualizar o recibo
4. Clique em "Baixar PDF" para fazer o download do arquivo

## Notas

- Os valores são convertidos automaticamente para extenso
- A data é gerada automaticamente no formato extenso
- O recibo segue o padrão visual da imagem de referência
- Local padrão: Vitória da Conquista - BA
