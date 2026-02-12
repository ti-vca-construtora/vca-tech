import chromium from "@sparticuz/chromium-min";
import { NextResponse } from "next/server";
import puppeteer, { Browser } from "puppeteer";
import puppeteerCore, { type Browser as BrowserCore } from "puppeteer-core";
import { readFile } from "fs/promises";
import { join } from "path";
import { createClient } from "@/lib/supabase-epi";

interface FormData {
  nomePessoa: string;
  cpfCnpjPessoa: string;
  valorLiquido: string;
  descricaoServico: string;
  nomeEmpresa: string;
  cnpjEmpresa: string;
  forceGenerate?: boolean;
  usuarioEmail?: string;
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

// Gerar número DAC com timestamp de Brasília (YYYYMMDDHHMM)
function generateDACNumber(): string {
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

function generateReciboHTML(data: FormData, dacNumber: string, logoBase64: string) {
  const valorLiquido = parseMonetaryValue(data.valorLiquido);
  
  // Obter data de emissão em Brasília
  const now = new Date();
  const brasiliaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  
  const dia = brasiliaTime.getDate();
  const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const mes = meses[brasiliaTime.getMonth()];
  const ano = brasiliaTime.getFullYear();
  
  const dataExtenso = `${dia} de ${mes} de ${ano}`;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recibo de Pagamento - ${dacNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    @page {
      size: A4;
      margin: 0;
    }
    
    body {
      font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
      font-size: 11px;
      line-height: 1.6;
      color: #2c3e50;
      background: white;
    }
    
    .page {
      width: 210mm;
      height: 297mm;
      margin: 0 auto;
      background: white;
      position: relative;
    }
    
    .container {
      padding: 25mm 20mm;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    
    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 20px;
      margin-bottom: 30px;
      border-bottom: 3px solid #0066cc;
    }
    
    .logo {
      max-width: 180px;
      height: auto;
    }
    
    .doc-info {
      text-align: right;
    }
    
    .doc-type {
      font-size: 32px;
      font-weight: 700;
      color: #0066cc;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 5px;
    }
    
    .doc-number {
      font-size: 11px;
      color: #7f8c8d;
      font-weight: 500;
    }
    
    .doc-date {
      font-size: 10px;
      color: #95a5a6;
      margin-top: 3px;
    }
    
    /* Info Grid */
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .info-card {
      border: 2px solid #e8ecef;
      border-radius: 8px;
      padding: 18px;
      background: white;
      transition: border-color 0.3s;
    }
    
    .info-card:hover {
      border-color: #0066cc;
    }
    
    .info-header {
      font-size: 10px;
      font-weight: 700;
      color: white;
      background: #0066cc;
      padding: 6px 12px;
      margin: -18px -18px 15px -18px;
      border-radius: 6px 6px 0 0;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }
    
    .info-row {
      display: flex;
      padding: 6px 0;
      border-bottom: 1px solid #f5f7fa;
    }
    
    .info-row:last-child {
      border-bottom: none;
    }
    
    .info-label {
      font-weight: 600;
      color: #7f8c8d;
      min-width: 70px;
      font-size: 10px;
    }
    
    .info-value {
      color: #2c3e50;
      font-weight: 500;
      flex: 1;
    }
    
    /* Declaração do Recebimento */
    .declaracao-section {
      text-align: center;
      padding: 30px 40px;
      margin: 40px 0;
      border-top: 1px solid #e8ecef;
      border-bottom: 1px solid #e8ecef;
    }
    
    .declaracao-text {
      font-size: 13px;
      color: #2c3e50;
      line-height: 2;
      max-width: 600px;
      margin: 0 auto;
    }
    
    .declaracao-servico {
      font-weight: 600;
      color: #34495e;
      font-style: italic;
      margin: 0 4px;
    }
    
    .declaracao-valor {
      font-weight: 700;
      color: #0066cc;
      font-size: 16px;
      margin: 0 4px;
    }
    
    /* Assinatura */
    .signature-section {
      margin-top: auto;
      padding-top: 40px;
    }
    
    .signature-box {
      max-width: 400px;
      margin: 0 auto;
      text-align: center;
    }
    
    .signature-label {
      font-size: 10px;
      color: #95a5a6;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 60px;
    }
    
    .signature-line {
      border-top: 2px solid #2c3e50;
      padding-top: 10px;
      margin-bottom: 10px;
    }
    
    .signature-name {
      font-size: 13px;
      font-weight: 700;
      color: #2c3e50;
      margin-bottom: 5px;
    }
    
    .signature-doc {
      font-size: 11px;
      color: #7f8c8d;
    }
    
    /* Footer */
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #e8ecef;
      text-align: center;
    }
    
    .footer-location {
      font-size: 11px;
      color: #34495e;
      font-weight: 600;
      margin-bottom: 5px;
    }
    
    .footer-note {
      font-size: 9px;
      color: #95a5a6;
      font-style: italic;
    }
    
    .footer-brand {
      margin-top: 15px;
      padding: 12px;
      background: linear-gradient(135deg, #00a8cc 0%, #0066cc 100%);
      border-radius: 6px;
      color: white;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    
    @media print {
      body {
        margin: 0;
      }
      .page {
        margin: 0;
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="container">
      <!-- Header -->
      <div class="header">
        ${logoBase64 ? `<img src="${logoBase64}" alt="Logo VCA" class="logo" />` : ''}
        <div class="doc-info">
          <div class="doc-type">Recibo</div>
          <div class="doc-number">Nº ${dacNumber}</div>
          <div class="doc-date">${dataExtenso}</div>
        </div>
      </div>
      
      <!-- Informações -->
      <div class="info-grid">
        <!-- Pagador -->
        <div class="info-card">
          <div class="info-header">Dados do Pagador</div>
          <div class="info-row">
            <div class="info-label">Empresa:</div>
            <div class="info-value">${data.nomeEmpresa}</div>
          </div>
          <div class="info-row">
            <div class="info-label">CNPJ:</div>
            <div class="info-value">${data.cnpjEmpresa}</div>
          </div>
        </div>
        
        <!-- Recebedor -->
        <div class="info-card">
          <div class="info-header">Dados do Recebedor</div>
          <div class="info-row">
            <div class="info-label">Nome:</div>
            <div class="info-value">${data.nomePessoa}</div>
          </div>
          <div class="info-row">
            <div class="info-label">${data.cpfCnpjPessoa.length <= 14 ? 'CPF' : 'CNPJ'}:</div>
            <div class="info-value">${data.cpfCnpjPessoa}</div>
          </div>
        </div>
      </div>
      
      <!-- Declaração -->
      <div class="declaracao-section">
        <div class="declaracao-text">
          Recebi de <strong>${data.nomeEmpresa}</strong> o valor de 
          <span class="declaracao-valor">${formatCurrency(valorLiquido)}</span>
          referente a <span class="declaracao-servico">${data.descricaoServico}</span>.
        </div>
      </div>
      
      <!-- Assinatura -->
      <div class="signature-section">
        <div class="signature-box">
          <div class="signature-label">Assinatura do Recebedor</div>
          <div class="signature-line">
            <div class="signature-name">${data.nomePessoa}</div>
            <div class="signature-doc">${data.cpfCnpjPessoa.length <= 14 ? 'CPF' : 'CNPJ'}: ${data.cpfCnpjPessoa}</div>
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="footer">
        <div class="footer-location">Vitória da Conquista - BA</div>
        <div class="footer-note">Este documento possui validade legal como comprovante de pagamento</div>
        <div class="footer-brand">VCA Construtora e Incorporadora</div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

export async function POST(request: Request) {
  let browser: Browser | BrowserCore | null = null;

  try {
    const data: FormData = await request.json();

    // Validação básica
    if (!data.nomePessoa || !data.cpfCnpjPessoa || !data.valorLiquido || 
        !data.descricaoServico || !data.nomeEmpresa || !data.cnpjEmpresa) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }

    // Gerar número do DAC
    const dacNumber = generateDACNumber();

    // Carregar logo
    const logoBase64 = await getLogoBase64();

    // Gerar HTML do recibo
    const html = generateReciboHTML(data, dacNumber, logoBase64);

    // Configurar Puppeteer
    const isProduction = process.env.NODE_ENV === "production";

    if (isProduction) {
      const executablePath = await chromium.executablePath(
        "https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar"
      );

      browser = await puppeteerCore.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath,
        headless: true,
      }) as BrowserCore;
    } else {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      }) as Browser;
    }

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    // Gerar PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        right: "20mm",
        bottom: "20mm",
        left: "20mm",
      },
    });

    await browser.close();

    // Salvar no banco de dados
    try {
      const supabase = createClient();
      const valorNumerico = parseMonetaryValue(data.valorLiquido);

      const { error: insertError } = await (supabase
        .from('tb_dac') as any)
        .insert({
          dac_number: dacNumber,
          nome_pessoa: data.nomePessoa,
          cpf_cnpj_pessoa: data.cpfCnpjPessoa,
          valor_liquido: valorNumerico,
          descricao_servico: data.descricaoServico,
          nome_empresa: data.nomeEmpresa,
          cnpj_empresa: data.cnpjEmpresa,
          usuario_email: data.usuarioEmail || null,
        });

      if (insertError) {
        console.error('Erro ao salvar DAC no banco:', insertError);
        // Não interrompe o fluxo, apenas loga o erro
      }
    } catch (dbError) {
      console.error('Erro ao conectar ao banco:', dbError);
      // Não interrompe o fluxo, apenas loga o erro
    }

    // Retornar PDF
    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Recibo-${dacNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    
    if (browser) {
      await browser.close();
    }

    return NextResponse.json(
      { error: "Erro ao gerar PDF. Tente novamente." },
      { status: 500 }
    );
  }
}
