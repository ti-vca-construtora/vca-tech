import chromium from "@sparticuz/chromium-min";
import { NextResponse } from "next/server";
import puppeteer, { Browser } from "puppeteer";
import puppeteerCore, { type Browser as BrowserCore } from "puppeteer-core";
import { readFile } from "fs/promises";
import { join } from "path";
import { createClient } from "@/lib/supabase-epi";

interface FormData {
  nomeRazaoSocial: string;
  cpf: string;
  rg: string;
  dataNascimento: string;
  nomeMae: string;
  pis: string;
  estado: string;
  municipio: string;
  companyId: string;
  nomeEmpresa: string;
  cnpjEmpresa: string;
  descricaoServico: string;
  valorServico: string;
  formaPagamento: string;
  tipoChavePix?: string;
  chavePix?: string;
  banco?: string;
  tipoConta?: string;
  agencia?: string;
  conta?: string;
  cpfCnpjConta?: string;
  dadosTerceiros?: boolean;
}

// Gerar número RPS com timestamp de Brasília (YYYYMMDDHHMM)
function generateRPSNumber(): string {
  const now = new Date();
  
  // Converter para horário de Brasília usando toLocaleString
  const brasiliaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  
  const year = brasiliaTime.getFullYear();
  const month = String(brasiliaTime.getMonth() + 1).padStart(2, '0');
  const day = String(brasiliaTime.getDate()).padStart(2, '0');
  const hours = String(brasiliaTime.getHours()).padStart(2, '0');
  const minutes = String(brasiliaTime.getMinutes()).padStart(2, '0');
  
  return `${year}${month}${day}${hours}${minutes}`;
}

// Calcular impostos
function calculateTax(valorLiquido: number) {
  const valorBruto = valorLiquido / 0.89;
  const imposto = valorBruto - valorLiquido;
  
  return {
    valorLiquido,
    valorBruto,
    imposto
  };
}

// Extrair valor numérico da string formatada
function parseMonetaryValue(value: string): number {
  const cleaned = value.replace(/[^\d,]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatDate(dateString: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('pt-BR');
}

function getBancoNome(codigo: string): string {
  const bancos: Record<string, string> = {
    "001": "Banco do Brasil",
    "237": "Bradesco",
    "104": "Caixa Econômica",
    "341": "Itaú",
    "033": "Santander",
    "356": "Banco Real",
    "399": "HSBC",
    "422": "Banco Safra",
    "453": "Banco Rural",
    "633": "Banco Rendimento",
    "745": "Citibank",
  };
  return bancos[codigo] || codigo;
}

async function getLogoBase64() {
  try {
    const logoPath = join(process.cwd(), 'public', 'assets', 'logo-vca.png');
    const logoBuffer = await readFile(logoPath);
    return `data:image/png;base64,${logoBuffer.toString('base64')}`;
  } catch (error) {
    console.error('Erro ao carregar logo:', error);
    return '';
  }
}

function generateRPSHTML(data: FormData, rpsNumber: string, logoBase64: string) {
  const valorLiquido = parseMonetaryValue(data.valorServico);
  const { valorBruto, imposto } = calculateTax(valorLiquido);
  
  // Obter data e hora de emissão em Brasília
  const now = new Date();
  const brasiliaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  
  const dataEmissao = brasiliaTime.toLocaleDateString('pt-BR');
  const horaEmissao = `${String(brasiliaTime.getHours()).padStart(2, '0')}:${String(brasiliaTime.getMinutes()).padStart(2, '0')}`;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RPS - ${rpsNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Arial', sans-serif;
      font-size: 10px;
      line-height: 1.3;
      color: #333;
      padding: 15px;
    }
    
    .container {
      max-width: 210mm;
      margin: 0 auto;
      border: 2px solid #003366;
      padding: 12px;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 2px solid #003366;
    }
    
    .logo {
      max-width: 100px;
      height: auto;
    }
    
    .header-info {
      text-align: right;
    }
    
    .doc-title {
      font-size: 18px;
      font-weight: bold;
      color: #003366;
      margin-bottom: 3px;
    }
    
    .doc-subtitle {
      font-size: 10px;
      color: #666;
      margin-bottom: 5px;
    }
    
    .rps-number {
      font-size: 12px;
      font-weight: bold;
      color: #003366;
      background: #f0f0f0;
      padding: 4px 8px;
      border-radius: 3px;
    }
    
    .section {
      margin-bottom: 8px;
    }
    
    .section-title {
      font-size: 11px;
      font-weight: bold;
      color: #fff;
      background: #003366;
      padding: 3px 6px;
      margin-bottom: 4px;
    }
    
    .grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 6px;
    }
    
    .grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
    }
    
    .field {
      margin-bottom: 4px;
    }
    
    .field-label {
      font-weight: bold;
      font-size: 9px;
      color: #555;
      display: block;
      margin-bottom: 1px;
    }
    
    .field-value {
      font-size: 10px;
      color: #000;
      padding: 2px 5px;
      background: #f9f9f9;
      border: 1px solid #ddd;
      border-radius: 2px;
      min-height: 18px;
      display: block;
    }
    
    .full-width {
      grid-column: 1 / -1;
    }
    
    .description-box {
      background: #f9f9f9;
      border: 1px solid #ddd;
      padding: 6px;
      min-height: 50px;
      border-radius: 2px;
      white-space: pre-wrap;
    }
    
    .values-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6px;
    }
    
    .values-table th,
    .values-table td {
      padding: 4px;
      text-align: right;
      border: 1px solid #ddd;
      font-size: 10px;
    }
    
    .values-table th {
      background: #f0f0f0;
      font-weight: bold;
      text-align: left;
    }
    
    .values-table .total-row {
      background: #e6f3ff;
      font-weight: bold;
      font-size: 12px;
    }
    
    .alert-box {
      background: #fff3cd;
      border: 1px solid #ffc107;
      padding: 4px 6px;
      margin-top: 4px;
      border-radius: 3px;
      font-size: 9px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    .footer {
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px solid #ddd;
      text-align: center;
      font-size: 8px;
      color: #666;
    }
    
    .signature-area {
      margin-top: 20px;
      display: flex;
      justify-content: space-around;
    }
    
    .signature-box {
      text-align: center;
      width: 200px;
    }
    
    .signature-line {
      border-top: 1px solid #333;
      margin-bottom: 5px;
      padding-top: 5px;
      font-size: 10px;
    }

    @media print {
      body {
        padding: 0;
      }
      .container {
        border: none;
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Cabeçalho -->
    <div class="header">
      <div>
        ${logoBase64 ? `<img src="${logoBase64}" alt="Logo VCA" class="logo" />` : '<div style="width: 120px; height: 60px; background: #003366;"></div>'}
      </div>
      <div class="header-info">
        <div class="doc-title">RPS - RECIBO PROVISÓRIO DE SERVIÇOS</div>
        <div class="rps-number">Nº ${rpsNumber}</div>
      </div>
    </div>

    <!-- Dados do Prestador -->
    <div class="section">
      <div class="section-title">DADOS DO PRESTADOR</div>
      <div class="grid">
        <div class="field full-width">
          <span class="field-label">Nome/Razão Social:</span>
          <span class="field-value">${data.nomeRazaoSocial || '-'}</span>
        </div>
        <div class="field">
          <span class="field-label">CPF:</span>
          <span class="field-value">${data.cpf || '-'}</span>
        </div>
        <div class="field">
          <span class="field-label">RG:</span>
          <span class="field-value">${data.rg || '-'}</span>
        </div>
        <div class="field">
          <span class="field-label">Data de Nascimento:</span>
          <span class="field-value">${formatDate(data.dataNascimento)}</span>
        </div>
        <div class="field">
          <span class="field-label">Nome da Mãe:</span>
          <span class="field-value">${data.nomeMae || '-'}</span>
        </div>
        <div class="field">
          <span class="field-label">PIS:</span>
          <span class="field-value">${data.pis || '-'}</span>
        </div>
        <div class="field">
          <span class="field-label">Município/Estado:</span>
          <span class="field-value">${data.municipio || '-'} / ${data.estado || '-'}</span>
        </div>
      </div>
    </div>

    <!-- Dados do Tomador -->
        <div class="section">
      <div class="section-title">DADOS DO TOMADOR</div>
      <div class="grid">
        <div class="field full-width">
          <span class="field-label">Nome/Razão Social:</span>
          <span class="field-value">VCA SERVIÇOS DE CONSTRUÇÃO LTDA</span>
        </div>
        <div class="field">
          <span class="field-label">CNPJ:</span>
          <span class="field-value">53.267.895/0001-91</span>
        </div>
        <div class="field">
          <span class="field-label">Centro de Custo:</span>
          <span class="field-value">${data.nomeEmpresa || '-'}</span>
        </div>
        <div class="field">
          <span class="field-label">Endereço:</span>
          <span class="field-value">AVENIDA OLIVIA FLORES, N° 1265, CANDEIAS</span>
        </div>
        <div class="field">
          <span class="field-label">CEP</span>
          <span class="field-value">45028-610</span>
        </div>
        <div class="field">
          <span class="field-label">Município/Estado:</span>
          <span class="field-value">Vitória da Conquista / BA</span>
        </div>
          <div class="field">
          <span class="field-label">E-mail:</span>
          <span class="field-value">adm01@vcaconstrutora.com.br</span>
        </div>
      </div>
    </div>

    <!-- Descrição do Serviço -->
    <div class="section">
      <div class="section-title">DESCRIÇÃO DO SERVIÇO PRESTADO</div>
      <div class="description-box">${data.descricaoServico || '-'}</div>
    </div>

    <!-- Valores -->
    <div class="section">
      <div class="section-title">VALORES</div>
      <table class="values-table">
        <tr>
          <th>Descrição</th>
          <th style="text-align: right;">Valor</th>
        </tr>
        <tr>
          <td>Valor Bruto do Serviço</td>
          <td>${formatCurrency(valorBruto)}</td>
        </tr>
        <tr>
          <td>(-) Imposto Retido (11%)</td>
          <td>${formatCurrency(imposto)}</td>
        </tr>
        <tr class="total-row">
          <td>Valor Líquido a Receber</td>
          <td>${formatCurrency(valorLiquido)}</td>
        </tr>
      </table>
    </div>

    <!-- Forma de Pagamento -->
    <div class="section">
      <div class="section-title">FORMA DE PAGAMENTO</div>
      <div class="grid">
        <div class="field">
          <span class="field-label">Modalidade:</span>
          <span class="field-value">${data.formaPagamento || '-'}</span>
        </div>

        ${data.formaPagamento === 'PIX' ? `
        <div class="field">
          <span class="field-label">Tipo de Chave:</span>
          <span class="field-value">${data.tipoChavePix || '-'}</span>
        </div>
        <div class="field full-width">
          <span class="field-label">Chave PIX:</span>
          <span class="field-value">${data.chavePix || '-'}</span>
        </div>
        ` : ''}

        ${data.formaPagamento === 'TED' ? `
        <div class="field">
          <span class="field-label">Banco:</span>
          <span class="field-value">${data.banco ? `${data.banco} - ${getBancoNome(data.banco)}` : '-'}</span>
        </div>
        <div class="field">
          <span class="field-label">Tipo de Conta:</span>
          <span class="field-value">${data.tipoConta === 'CORRENTE' ? 'Conta Corrente' : data.tipoConta === 'POUPANCA' ? 'Conta Poupança' : '-'}</span>
        </div>
        <div class="field">
          <span class="field-label">Agência:</span>
          <span class="field-value">${data.agencia || '-'}</span>
        </div>
        <div class="field">
          <span class="field-label">Conta:</span>
          <span class="field-value">${data.conta || '-'}</span>
        </div>
        <div class="field full-width">
          <span class="field-label">CPF/CNPJ da Conta:</span>
          <span class="field-value">${data.cpfCnpjConta || '-'}</span>
        </div>
        ` : ''}
      </div>
    </div>

    <!-- Rodapé -->
    <div class="footer">
      <p>Data e Hora de Emissão: ${dataEmissao} às ${horaEmissao}</p>
    </div>
  </div>
</body>
</html>
  `;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const formData: FormData = body;

    // Gerar número do RPS
    const rpsNumber = generateRPSNumber();

    // Carregar logo em base64
    const logoBase64 = await getLogoBase64();

    // Gerar HTML do recibo
    const html = generateRPSHTML(formData, rpsNumber, logoBase64);

    // Configurar browser
    let browser: Browser | BrowserCore;
    
    if (process.env.VERCEL) {
      const executablePath = await chromium.executablePath(
        "https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar"
      );

      browser = await puppeteerCore.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath,
        headless: true,
      });
    } else {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }

    const page = await browser.newPage();
    
    // Configurar página
    await page.setContent(html, {
      waitUntil: 'networkidle0',
    });

    // Gerar PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm',
      },
    });

    await browser.close();

    // Salvar no banco de dados
    let cadastroError: string | null = null;
    try {
      const supabase = createClient();
      const valorNumerico = parseMonetaryValue(formData.valorServico);
      const stripMask = (v: string | null | undefined) => v ? (v.replace(/\D/g, '') || null) : null;
      const cpfStripped = stripMask(formData.cpf) ?? formData.cpf;

      // Salvar RPS
      const { error: insertRPSError } = await (supabase
        .from('tb_rps') as any)
        .insert({
          rps_number: rpsNumber,
          nome_razao_social: formData.nomeRazaoSocial,
          cpf: cpfStripped,
          rg: stripMask(formData.rg),
          data_nascimento: formData.dataNascimento || null,
          nome_mae: formData.nomeMae,
          pis: stripMask(formData.pis),
          estado: formData.estado,
          municipio: formData.municipio,
          company_id: formData.companyId,
          nome_empresa: formData.nomeEmpresa,
          cnpj_empresa: stripMask(formData.cnpjEmpresa) ?? formData.cnpjEmpresa,
          descricao_servico: formData.descricaoServico,
          valor_liquido: valorNumerico,
          forma_pagamento: formData.formaPagamento,
          tipo_chave_pix: formData.tipoChavePix || null,
          chave_pix: formData.chavePix || null,
          banco: formData.banco || null,
          tipo_conta: formData.tipoConta || null,
          agencia: formData.agencia || null,
          conta: formData.conta || null,
          cpf_cnpj_conta: stripMask(formData.cpfCnpjConta),
          dados_terceiros: formData.dadosTerceiros || false,
        });

      if (insertRPSError) {
        const msg = `INSERT tb_rps error: ${JSON.stringify(insertRPSError)}`;
        console.error(msg);
        cadastroError = (cadastroError ? cadastroError + ' | ' : '') + msg;
      }

      // Salvar ou atualizar cadastro da pessoa
      try {
        const { data: cadastroExistente, error: selectError } = await supabase
          .from('tb_rps_cadastros')
          .select('id')
          .eq('cpf', cpfStripped)
          .maybeSingle<{ id: string }>();

        if (selectError) {
          const msg = `SELECT cadastro error: ${JSON.stringify(selectError)}`;
          console.error(msg);
          cadastroError = msg;
        } else if (cadastroExistente) {
          // Atualizar cadastro existente
          const { error: updateError } = await (supabase
            .from('tb_rps_cadastros') as any)
            .update({
              nome_razao_social: formData.nomeRazaoSocial,
              rg: stripMask(formData.rg),
              data_nascimento: formData.dataNascimento || null,
              nome_mae: formData.nomeMae,
              pis: stripMask(formData.pis),
              estado: formData.estado,
              municipio: formData.municipio,
              updated_at: new Date().toISOString(),
            })
            .eq('id', cadastroExistente.id);

          if (updateError) {
            const msg = `UPDATE cadastro error: ${JSON.stringify(updateError)}`;
            console.error(msg);
            cadastroError = msg;
          }
        } else {
          // Criar novo cadastro
          const { error: insertCadastroError } = await (supabase
            .from('tb_rps_cadastros') as any)
            .insert({
              nome_razao_social: formData.nomeRazaoSocial,
              cpf: cpfStripped,
              rg: stripMask(formData.rg),
              data_nascimento: formData.dataNascimento || null,
              nome_mae: formData.nomeMae,
              pis: stripMask(formData.pis),
              estado: formData.estado,
              municipio: formData.municipio,
            });

          if (insertCadastroError) {
            const msg = `INSERT cadastro error: ${JSON.stringify(insertCadastroError)}`;
            console.error(msg);
            cadastroError = msg;
          }
        }
      } catch (cadastroDbError) {
        const msg = `Cadastro DB exception: ${cadastroDbError instanceof Error ? cadastroDbError.message : String(cadastroDbError)}`;
        console.error(msg);
        cadastroError = msg;
      }
    } catch (dbError) {
      console.error('Erro ao conectar ao banco:', dbError);
    }

    // Retornar PDF
    const responseHeaders: Record<string, string> = {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="RPS-${rpsNumber}.pdf"`,
    };
    if (cadastroError) {
      responseHeaders['X-Cadastro-Error'] = cadastroError.substring(0, 500);
    }
    return new NextResponse(Buffer.from(pdf), { headers: responseHeaders });
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar PDF', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}
