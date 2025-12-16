import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { LOGO_BASE64 } from '@/util/logo-base64';

interface Participante {
  pactuacao: number;
  dataNascimento: string;
}

interface DadosSimulacao {
  nomeCliente: string;
  valorImovel: string;
  nomeEmpreendimento: string;
  unidade: string;
  origemRecurso: string;
  cidade: string;
  valorAvaliacao: string;
  rendaFamiliar: string;
  quantidadeParticipantes: number;
  participantes: Participante[];
  possuiTresAnosFGTS: boolean;
  jaBeneficiadoSubsidio: boolean;
  sistemaAmortizacao: string;
  possuiDependentes: boolean;
}

interface Resultados {
  tipoFinanciamento: string;
  valorImovel: string;
  subsidio: string;
  valorFinanciado: string;
  prestacao: string;
  prazo: string;
}

export async function POST(request: NextRequest) {
  try {
    const { dadosSimulacao, resultados } = await request.json();

    // Logo VCA em base64
    const logoBase64 = LOGO_BASE64;

    // Template HTML para o PDF
    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Simulação de Financiamento</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      padding: 30px;
      color: #333;
      font-size: 12px;
    }
    .header {
      text-align: center;
      margin-bottom: 25px;
      border-bottom: 3px solid #0066cc;
      padding-bottom: 15px;
    }
    .header h1 {
      color: #0066cc;
      font-size: 24px;
      margin-bottom: 3px;
    }
    .header p {
      color: #666;
      font-size: 12px;
    }
    .section {
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    .section-title {
      background: #0066cc;
      color: white;
      padding: 8px 12px;
      font-size: 16px;
      border-radius: 4px;
      margin-bottom: 12px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-bottom: 10px;
    }
    .field {
      padding: 8px;
      background: #f5f5f5;
      border-radius: 4px;
    }
    .field-label {
      font-size: 11px;
      color: #666;
      margin-bottom: 3px;
    }
    .field-value {
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }
    .highlight {
      background: #e6f3ff;
      border-left: 4px solid #0066cc;
    }
    .success {
      background: #e8f5e9;
      border-left: 4px solid #4caf50;
    }
    .warning {
      background: #fff3e0;
      border-left: 4px solid #ff9800;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-top: 12px;
    }
    .big-value {
      text-align: center;
      padding: 12px;
      border-radius: 6px;
    }
    .big-value .label {
      font-size: 10px;
      color: #666;
      margin-bottom: 5px;
    }
    .big-value .value {
      font-size: 18px;
      font-weight: bold;
    }
    .participants {
      margin-top: 8px;
    }
    .participant-item {
      padding: 6px 10px;
      background: #f9f9f9;
      border-radius: 3px;
      margin-bottom: 5px;
      display: flex;
      justify-content: space-between;
      font-size: 11px;
    }
    .badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 3px;
      font-size: 10px;
      margin-right: 6px;
      margin-bottom: 6px;
    }
    .badge-success {
      background: #4caf50;
      color: white;
    }
    .badge-default {
      background: #e0e0e0;
      color: #666;
    }
    .footer {
      margin-top: 20px;
      text-align: center;
      padding-top: 12px;
      border-top: 2px solid #e0e0e0;
      color: #999;
      font-size: 10px;
    }
  </style>
</head>
<body>
  <div class="header">
    <img src="${logoBase64}" alt="VCA Logo" style="height: 50px; margin-bottom: 10px;" />
    <h1>Simulação de Financiamento Habitacional</h1>
    <p>Caixa Econômica Federal - ${new Date().toLocaleDateString('pt-BR')}</p>
  </div>

  <div class="section">
    <div class="section-title">Dados do Cliente</div>
    <div class="grid">
      <div class="field">
        <div class="field-label">Nome</div>
        <div class="field-value">${dadosSimulacao.nomeCliente}</div>
      </div>
      <div class="field">
        <div class="field-label">Renda Familiar</div>
        <div class="field-value">${dadosSimulacao.rendaFamiliar}</div>
      </div>
      <div class="field">
        <div class="field-label">Cidade</div>
        <div class="field-value">${dadosSimulacao.cidade}</div>
      </div>
      <div class="field">
        <div class="field-label">Origem de Recurso</div>
        <div class="field-value">${dadosSimulacao.origemRecurso}</div>
      </div>
    </div>

    <div class="participants">
      <div class="field-label" style="margin-bottom: 10px;">Participantes (${dadosSimulacao.quantidadeParticipantes})</div>
      ${dadosSimulacao.participantes.map((p: Participante, i: number) => `
        <div class="participant-item">
          <span><strong>${i === 0 ? 'Participante 1' : `Participante ${i + 1}`}:</strong> ${p.pactuacao}% de Pactuação</span>
          <span>${new Date(p.dataNascimento).toLocaleDateString('pt-BR')}</span>
        </div>
      `).join('')}
    </div>

    <div style="margin-top: 15px;">
      <div class="field-label" style="margin-bottom: 10px;">Condições Especiais</div>
      <div>
        <span class="badge ${dadosSimulacao.possuiTresAnosFGTS ? 'badge-success' : 'badge-default'}">
          ${dadosSimulacao.possuiTresAnosFGTS ? '✓' : '✗'} 3 anos de FGTS
        </span>
        <span class="badge ${dadosSimulacao.jaBeneficiadoSubsidio ? 'badge-success' : 'badge-default'}">
          ${dadosSimulacao.jaBeneficiadoSubsidio ? '✓' : '✗'} Já beneficiado com subsídio
        </span>
        <span class="badge ${dadosSimulacao.possuiDependentes ? 'badge-success' : 'badge-default'}">
          ${dadosSimulacao.possuiDependentes ? '✓' : '✗'} Possui dependentes
        </span>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Resultado da Simulação</div>
    <div class="field" style="margin-bottom: 20px;">
      <div class="field-label">Tipo de Financiamento</div>
      <div class="field-value" style="font-size: 14px;">${resultados.tipoFinanciamento}</div>
    </div>

    <div class="info-grid">
      <div class="big-value highlight">
        <div class="label">Valor de Avaliação</div>
        <div class="value">${dadosSimulacao.valorAvaliacao}</div>
      </div>
      <div class="big-value highlight">
        <div class="label">Valor do Imóvel</div>
        <div class="value">${resultados.valorImovel}</div>
      </div>
      <div class="big-value success">
        <div class="label">Subsídio</div>
        <div class="value" style="color: #4caf50;">${resultados.subsidio}</div>
      </div>
      <div class="big-value highlight">
        <div class="label">Valor Financiado</div>
        <div class="value">${resultados.valorFinanciado}</div>
      </div>
      <div class="big-value" style="background: #e3f2fd;">
        <div class="label">Entrada</div>
        <div class="value" style="color: #1976d2;">${calcularEntrada(dadosSimulacao, resultados)}</div>
      </div>
      <div class="big-value warning">
        <div class="label">Prestação Financiamento</div>
        <div class="value" style="color: #f57c00;">${resultados.prestacao}</div>
      </div>
    </div>

    <div class="grid" style="margin-top: 15px;">
      <div class="field">
        <div class="field-label">Prazo</div>
        <div class="field-value">${resultados.prazo}</div>
      </div>
      <div class="field">
        <div class="field-label">Sistema de Amortização</div>
        <div class="field-value">${dadosSimulacao.sistemaAmortizacao}</div>
      </div>
    </div>

    <div class="grid" style="margin-top: 10px;">
      <div class="field">
        <div class="field-label">Empreendimento</div>
        <div class="field-value">${dadosSimulacao.nomeEmpreendimento}</div>
      </div>
      <div class="field">
        <div class="field-label">Unidade</div>
        <div class="field-value">${dadosSimulacao.unidade}</div>
      </div>
    </div>
  </div>

  <div class="footer">
    <p>Este documento é uma simulação e não representa uma proposta de crédito.</p>
    <p>Os valores e condições apresentados podem sofrer alterações.</p>
  </div>
</body>
</html>
    `;

    // Gerar PDF com Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
      },
    });

    await browser.close();

    // Retornar PDF com headers CORS
    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="simulacao-${dadosSimulacao.nomeCliente.replace(/\s+/g, '-')}.pdf"`,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, ngrok-skip-browser-warning',
        'Access-Control-Max-Age': '86400',
      },
    });
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar PDF' },
      { status: 500 }
    );
  }
}

function calcularEntrada(dadosSimulacao: DadosSimulacao, resultados: Resultados): string {
  const valorImovelNum = parseFloat(
    dadosSimulacao.valorImovel.replace(/\D/g, '')
  ) / 100;
  const valorFinanciadoNum = parseFloat(
    resultados.valorFinanciado.replace(/\D/g, '')
  ) / 100;
  const subsidioNum = parseFloat(
    resultados.subsidio.replace(/[R$\s.]/g, '').replace(',', '.')
  );

  const entrada = valorImovelNum - valorFinanciadoNum - subsidioNum;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(entrada);
}
