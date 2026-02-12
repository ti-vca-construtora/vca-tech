# Gerador de RPS - Documentação Completa

## 📋 Visão Geral

O **Gerador de RPS** é uma solução completa para criação de Recibos Provisórios de Serviços (RPS) de forma rápida e organizada. A solução conta com formulário em duas etapas, preview em tempo real e validações completas.

## 🏗️ Estrutura do Projeto

```
gerador-rps/
├── page.tsx                    # Página principal com layout responsivo
├── components/
│   ├── gerador-rps-form.tsx   # Formulário de 2 etapas
│   └── preview-pdf.tsx         # Preview do RPS em tempo real
└── README.md                   # Esta documentação
```

## ✨ Funcionalidades Implementadas

### ✅ Etapa 1: Dados do Prestador
- ✅ Nome/Razão Social (campo texto)
- ✅ CPF (com máscara 000.000.000-00)
- ✅ Data de Nascimento (input date)
- ✅ RG (com máscara 00.000.000-0)
- ✅ PIS (com máscara 000.00000.00-0)
- ✅ Estado (select com todos os estados brasileiros)
- ✅ Município (campo texto)
- ✅ Validações completas antes de avançar

### ✅ Etapa 2: Serviço e Pagamento
- ✅ Descrição do Serviço (textarea)
- ✅ Valor do Serviço (com máscara monetária R$ 0,00)
- ✅ Forma de Pagamento (select: PIX, TED, Dinheiro, Cheque)

#### ✅ Campos Condicionais PIX
- ✅ Tipo de Chave (CPF, CNPJ, Email, Telefone, Aleatória)
- ✅ Chave PIX (campo texto)

#### ✅ Campos Condicionais TED
- ✅ Banco (select com principais bancos)
- ✅ Tipo de Conta (Corrente ou Poupança)
- ✅ Agência (máscara 0000)
- ✅ Conta (máscara 00000-0)
- ✅ CPF/CNPJ da Conta (máscara automática)
- ✅ Checkbox "Dados bancários de terceiros"

### ✅ Recursos Adicionais
- ✅ Indicador de progresso visual
- ✅ Preview em tempo real
- ✅ Layout responsivo (mobile, tablet, desktop)
- ✅ Validações em cada etapa
- ✅ Mensagens de erro contextuais
- ✅ Toast notifications
- ✅ Navegação entre etapas
- ✅ Limpeza automática de campos ao mudar forma de pagamento

## 🎨 Máscaras de Formatação Implementadas

### CPF
```
Entrada: 12345678901
Saída:   123.456.789-01
```

### RG
```
Entrada: 123456789
Saída:   12.345.678-9
```

### PIS
```
Entrada: 12345678901
Saída:   123.45678.90-1
```

### Moeda
```
Entrada: 150000
Saída:   R$ 1.500,00
```

### Agência
```
Entrada: 1234
Saída:   1234
```

### Conta
```
Entrada: 123456
Saída:   12345-6
```

### CPF/CNPJ (Automático)
```
CPF:  123.456.789-01
CNPJ: 12.345.678/0001-90
```

## 🎯 Como Usar

### 1. Preencher Dados do Prestador
- Preencha todos os campos da primeira etapa
- Os campos com asterisco (*) são obrigatórios
- Use as máscaras para facilitar a digitação
- Clique em "Próximo" para avançar

### 2. Informar Serviço e Pagamento
- Descreva o serviço prestado
- Informe o valor (será formatado automaticamente)
- Selecione a forma de pagamento
- Preencha os campos adicionais conforme a forma escolhida
- Clique em "Gerar RPS"

### 3. Visualizar e Baixar
- O preview é atualizado em tempo real
- Revise todos os dados no painel direito
- Clique em "Baixar PDF" para gerar o documento

## 🎨 Personalização de Componentes

### Tamanhos de Elementos

**Inputs e Campos:**
```tsx
// Altura padrão dos inputs
className="h-10"  // 2.5rem / 40px

// Textarea com linhas personalizadas
rows={4}  // 4 linhas

// Select
className="h-10"  // Padrão shadcn
```

**Espaçamentos:**
```tsx
// Entre campos individuais
className="space-y-4"  // 1rem / 16px

// Entre seções
className="space-y-6"  // 1.5rem / 24px

// Gap em grids
className="gap-4"  // 1rem / 16px
```

**Grid Responsivo:**
```tsx
// 1 coluna em mobile, 2 em desktop
className="grid grid-cols-1 md:grid-cols-2 gap-4"
```

### Cores e Temas

**Cores Principais:**
- `text-primary` - Cor primária do tema
- `text-muted-foreground` - Texto secundário
- `border-red-500` - Bordas de erro
- `bg-orange-50` - Alerta de terceiros

**Badges:**
```tsx
<Badge variant="secondary">Texto</Badge>
<Badge variant="outline">Texto</Badge>
```

## 🔧 Validações Implementadas

### Etapa 1 - Validações
- ✅ Nome/Razão Social não pode estar vazio
- ✅ CPF obrigatório
- ✅ Data de Nascimento obrigatória
- ✅ RG obrigatório
- ✅ PIS obrigatório
- ✅ Estado deve ser selecionado
- ✅ Município obrigatório

### Etapa 2 - Validações
- ✅ Descrição do serviço obrigatória
- ✅ Valor deve ser maior que R$ 0,00
- ✅ Forma de pagamento deve ser selecionada
- ✅ Se PIX: tipo de chave e chave obrigatórios
- ✅ Se TED: todos os campos bancários obrigatórios

## 📦 Dependências Utilizadas

### Componentes UI (shadcn/ui)
- ✅ `card` - Cards do formulário e preview
- ✅ `input` - Campos de entrada
- ✅ `label` - Labels dos campos
- ✅ `select` - Dropdowns de seleção
- ✅ `textarea` - Campo de texto multilinha
- ✅ `button` - Botões de navegação e ação
- ✅ `checkbox` - Checkbox de terceiros
- ✅ `badge` - Badges informativos
- ✅ `separator` - Separadores visuais

### Hooks
- ✅ `useToast` - Notificações toast
- ✅ `useState` - Gerenciamento de estado

### Ícones (lucide-react)
- ✅ `FileText` - Ícone de documento
- ✅ `User` - Ícone de usuário
- ✅ `ChevronLeft/Right` - Setas de navegação
- ✅ `Download` - Ícone de download
- ✅ `Eye` - Ícone de visualização

## 🚀 Próximas Melhorias

### Funcionalidades Futuras
1. **Geração de PDF Real**
   - Implementar jsPDF para gerar documento
   - Adicionar logo da empresa
   - Incluir assinatura digital

2. **Validação Avançada**
   - Validar CPF usando algoritmo
   - API de CEP para preencher município
   - Validar chave PIX conforme tipo

3. **Persistência de Dados**
   - Salvar rascunhos no localStorage
   - Histórico de RPS gerados
   - Exportar lista de RPS

4. **Compartilhamento**
   - Enviar por e-mail
   - Compartilhar via WhatsApp
   - Gerar link compartilhável

5. **Integrações**
   - Integrar com sistema de contabilidade
   - Exportar para Excel/CSV
   - API para geração automatizada

## 💡 Guia de Personalização

### Adicionar Novos Campos

**1. Atualizar interface no page.tsx:**
```tsx
export interface FormData {
  // ... campos existentes
  novoCampo: string;  // Adicionar aqui
}
```

**2. Adicionar no estado inicial:**
```tsx
const [formData, setFormData] = useState<FormData>({
  // ... campos existentes
  novoCampo: '',  // Adicionar aqui
});
```

**3. Criar campo no formulário:**
```tsx
<Input
  id="novoCampo"
  value={formData.novoCampo}
  onChange={(e) => handleInputChange("novoCampo", e.target.value)}
/>
```

**4. Mostrar no preview:**
```tsx
<div className="flex">
  <span className="font-semibold">Novo Campo:</span>
  <span>{formData.novoCampo || "-"}</span>
</div>
```

### Modificar Validações

**Adicionar nova validação:**
```tsx
const validateEtapa1 = () => {
  const errors: Record<string, string> = {};
  
  // ... validações existentes
  
  // Nova validação
  if (formData.novoCampo.length < 3) {
    errors.novoCampo = "Mínimo 3 caracteres";
  }
  
  return errors;
};
```

### Ajustar Responsividade

**Grid de colunas flexível:**
```tsx
// 1 col mobile, 2 tablet, 3 desktop
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

// Inverter ordem em mobile
className="flex flex-col lg:flex-row-reverse"

// Ocultar em mobile
className="hidden md:block"
```

## 📊 Status da Implementação

| Funcionalidade | Status | Observações |
|---------------|--------|-------------|
| Formulário Etapa 1 | ✅ Completo | 7 campos com validação |
| Formulário Etapa 2 | ✅ Completo | Campos condicionais PIX/TED |
| Máscaras de Input | ✅ Completo | CPF, RG, PIS, Moeda, etc |
| Validações | ✅ Completo | Todas as etapas validadas |
| Preview em Tempo Real | ✅ Completo | Atualização automática |
| Responsividade | ✅ Completo | Mobile, tablet, desktop |
| Geração de PDF | ⏳ Pendente | TODO: Implementar jsPDF |
| Persistência | ⏳ Pendente | TODO: localStorage |
| Envio por Email | ⏳ Pendente | TODO: Integração |

## 🎓 Conceitos Aplicados

- **State Management**: Uso de useState para gerenciar formulário
- **Validação de Forms**: Validações por etapa com feedback visual
- **Máscaras de Input**: Formatação automática durante digitação
- **Renderização Condicional**: Campos exibidos conforme seleção
- **Layout Responsivo**: Grid system do Tailwind CSS
- **Component Composition**: Separação clara de componentes
- **Type Safety**: TypeScript para type checking
- **UX/UI**: Feedback visual, progressão clara, preview em tempo real

---

**Desenvolvido seguindo o padrão das soluções VCA Tech**