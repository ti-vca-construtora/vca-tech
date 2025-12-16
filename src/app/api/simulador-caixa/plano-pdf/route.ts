import { NextRequest, NextResponse } from 'next/server';
import puppeteer, { Browser } from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { LOGO_BASE64 } from '@/util/logo-base64';

/* eslint-disable @typescript-eslint/no-unused-vars */
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

interface LinhaPlano {
  id: string;
  serieId: string;
  serie: string;
  parcelas: number;
  valor: string;
  valorOriginal: number;
  data: string;
}

interface RequestBody {
  dadosSimulacao: DadosSimulacao;
  resultados: Resultados;
  linhasPlano: LinhaPlano[];
  prazoEntrega?: string;
  nomeUsuario?: string;
}

function getHtmlContent({ dadosSimulacao, resultados, linhasPlano, prazoEntrega, nomeUsuario }: RequestBody): string {
  const logoBase64 = LOGO_BASE64;

    // Calcular entrada
    const calcularEntrada = () => {
      const valorImovelNum = parseFloat(dadosSimulacao.valorImovel.replace(/\D/g, '')) / 100;
      const valorFinanciadoNum = parseFloat(resultados.valorFinanciado.replace(/\D/g, '')) / 100;
      const subsidioNum = parseFloat(resultados.subsidio.replace(/[R$\s.]/g, '').replace(',', '.'));
      
      let entrada = valorImovelNum - valorFinanciadoNum - subsidioNum;
      
      linhasPlano.forEach((linha: LinhaPlano) => {
        if ((linha.serieId === 'sinal' || linha.serieId === 'intermediaria') && linha.valorOriginal > 0) {
          entrada -= linha.valorOriginal;
        }
      });
      
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(entrada);
    };

    // Calcular total do plano
    const calcularTotal = () => {
      let total = 0;
      linhasPlano.forEach((linha: LinhaPlano) => {
        if (linha.valorOriginal > 0) {
          total += linha.valorOriginal;
        }
      });
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(total);
    };

    // Ordenar linhas do plano
    const ordenarLinhasPlano = (linhas: LinhaPlano[]) => {
      const ordemPrioridade: { [key: string]: number } = {
        'sinal': 1,
        'entrada': 2,
        'intermediaria': 3,
      };

      return [...linhas].sort((a, b) => {
        // Linhas sem série vão para o final
        if (!a.serie && !b.serie) return 0;
        if (!a.serie) return 1;
        if (!b.serie) return -1;

        // Ordena por tipo de série
        const prioridadeA = ordemPrioridade[a.serieId] || 999;
        const prioridadeB = ordemPrioridade[b.serieId] || 999;

        if (prioridadeA !== prioridadeB) {
          return prioridadeA - prioridadeB;
        }

        // Dentro do mesmo tipo, ordena por nome (Sinal 1, Sinal 2, etc.)
        return a.serie.localeCompare(b.serie);
      });
    };

    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Simulação e Plano de Pagamento</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #333;
      font-size: 11px;
    }
    .page {
      padding: 30px;
      page-break-after: always;
    }
    .page:last-child {
      page-break-after: auto;
    }
    .header {
      text-align: center;
      margin-bottom: 25px;
      border-bottom: 3px solid #0066cc;
      padding-bottom: 15px;
    }
    .logo {
      max-width: 150px;
      margin-bottom: 10px;
    }
    .header h1 {
      color: #0066cc;
      font-size: 22px;
      margin-bottom: 3px;
    }
    .header p {
      color: #666;
      font-size: 11px;
    }
    .section {
      margin-bottom: 18px;
    }
    .section-title {
      background: #0066cc;
      color: white;
      padding: 7px 12px;
      font-size: 14px;
      border-radius: 4px;
      margin-bottom: 10px;
      font-weight: 600;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      margin-bottom: 8px;
    }
    .field {
      padding: 7px;
      background: #f5f5f5;
      border-radius: 4px;
    }
    .field-label {
      font-size: 9px;
      color: #666;
      text-transform: uppercase;
      margin-bottom: 3px;
      font-weight: 600;
    }
    .field-value {
      font-size: 11px;
      color: #333;
      font-weight: 500;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin: 15px 0;
    }
    .big-value {
      padding: 12px;
      border-radius: 6px;
      text-align: center;
    }
    .big-value .label {
      font-size: 9px;
      color: #666;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    .big-value .value {
      font-size: 16px;
      font-weight: bold;
      color: #0066cc;
    }
    .highlight {
      background: #f0f7ff;
      border: 1px solid #b3d9ff;
    }
    .success {
      background: #f1f8f4;
      border: 1px solid #a5d6a7;
    }
    .warning {
      background: #fff3e0;
      border: 1px solid #ffcc80;
    }
    .participants {
      margin-top: 12px;
    }
    .participant-item {
      padding: 6px 10px;
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      margin-bottom: 5px;
      display: flex;
      justify-content: space-between;
      font-size: 10px;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 9px;
      margin-right: 6px;
      margin-top: 5px;
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
      margin-top: 25px;
      padding-top: 12px;
      border-top: 2px solid #e0e0e0;
      text-align: center;
      font-size: 9px;
      color: #999;
    }
    
    /* Estilos para página 2 - Plano de Pagamento */
    .plan-table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      font-size: 10px;
    }
    .plan-table thead {
      background: #0066cc;
      color: white;
    }
    .plan-table th {
      padding: 8px;
      text-align: left;
      font-weight: 600;
      font-size: 9px;
      text-transform: uppercase;
    }
    .plan-table th.center {
      text-align: center;
    }
    .plan-table th.right {
      text-align: right;
    }
    .plan-table tbody tr {
      border-bottom: 1px solid #e0e0e0;
    }
    .plan-table tbody tr:nth-child(even) {
      background: #f9f9f9;
    }
    .plan-table tbody tr:hover {
      background: #f0f7ff;
    }
    .plan-table td {
      padding: 7px 8px;
    }
    .plan-table td.center {
      text-align: center;
    }
    .plan-table td.right {
      text-align: right;
    }
    .plan-table td.empty {
      color: #999;
      font-style: italic;
      font-size: 9px;
    }
    .plan-table td.serie {
      font-weight: 600;
      color: #0066cc;
    }
    .plan-table td.valor {
      font-weight: 600;
    }
    .total-row {
      background: #e3f2fd !important;
      font-weight: bold;
      font-size: 11px;
    }
    .total-row td {
      padding: 10px 8px;
      border-top: 2px solid #0066cc;
    }
    .info-boxes {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin: 15px 0;
    }
    .info-box {
      padding: 10px;
      border-radius: 6px;
      border: 1px solid #e0e0e0;
    }
    .info-box .label {
      font-size: 9px;
      color: #666;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    .info-box .value {
      font-size: 14px;
      font-weight: bold;
    }
    .info-box.prosoluto {
      background: #f1f8f4;
      border-color: #4caf50;
    }
    .info-box.prosoluto .value {
      color: #2e7d32;
    }
    .info-box.prestacao {
      background: #fff3e0;
      border-color: #ff9800;
    }
    .info-box.prestacao .value {
      color: #e65100;
    }
  </style>
</head>
<body>
  <!-- PÁGINA 1: Resultado da Simulação -->
  <div class="page">
    <div class="header">
      <img src="${logoBase64}" alt="Logo VCA" class="logo">
      <h1>Simulação de Financiamento</h1>
      <p>Documento gerado em ${new Date().toLocaleString('pt-BR')}</p>
      <p style="font-size: 10px; margin-top: 3px;">Exportado por: ${nomeUsuario || 'Usuário'}</p>
    </div>

    <div class="section">
      <div class="section-title">Dados do Cliente</div>
      <div class="grid">
        <div class="field">
          <div class="field-label">Nome do Cliente</div>
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
        <div class="field-label" style="margin-bottom: 8px;">Participantes (${dadosSimulacao.quantidadeParticipantes})</div>
        ${dadosSimulacao.participantes.map((p: Participante, i: number) => `
          <div class="participant-item">
            <span><strong>${i === 0 ? 'Principal' : `Participante ${i + 1}`}:</strong> ${p.pactuacao}% de Pactuação</span>
            <span>${new Date(p.dataNascimento).toLocaleDateString('pt-BR')}</span>
          </div>
        `).join('')}
      </div>

      <div style="margin-top: 12px;">
        <div class="field-label" style="margin-bottom: 8px;">Condições Especiais</div>
        <div>
          <span class="badge ${dadosSimulacao.possuiTresAnosFGTS ? 'badge-success' : 'badge-default'}">
            ${dadosSimulacao.possuiTresAnosFGTS ? '✓' : '✗'} 3 anos de FGTS
          </span>
          <span class="badge ${dadosSimulacao.jaBeneficiadoSubsidio ? 'badge-success' : 'badge-default'}">
            ${dadosSimulacao.jaBeneficiadoSubsidio ? '✓' : '✗'} Já beneficiado
          </span>
          <span class="badge ${dadosSimulacao.possuiDependentes ? 'badge-success' : 'badge-default'}">
            ${dadosSimulacao.possuiDependentes ? '✓' : '✗'} Possui dependentes
          </span>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Resultado da Simulação</div>
      <div class="field" style="margin-bottom: 15px;">
        <div class="field-label">Tipo de Financiamento</div>
        <div class="field-value" style="font-size: 13px;">${resultados.tipoFinanciamento}</div>
      </div>

      <div class="info-grid">
        <div class="big-value highlight">
          <div class="label">Valor de Avaliação</div>
          <div class="value">${dadosSimulacao.valorAvaliacao}</div>
        </div>
        <div class="big-value highlight">
          <div class="label">Valor do Imóvel</div>
          <div class="value">${dadosSimulacao.valorImovel}</div>
        </div>
        <div class="big-value" style="background: #e3f2fd; border: 1px solid #90caf9;">
          <div class="label">Entrada</div>
          <div class="value" style="color: #1976d2;">${calcularEntrada()}</div>
        </div>
        <div class="big-value success">
          <div class="label">Subsídio</div>
          <div class="value" style="color: #4caf50;">${resultados.subsidio}</div>
        </div>
        <div class="big-value warning">
          <div class="label">Valor Financiado</div>
          <div class="value" style="color: #f57c00;">${resultados.valorFinanciado}</div>
        </div>
        <div class="big-value warning">
          <div class="label">Prestação Financiamento</div>
          <div class="value" style="color: #f57c00;">${resultados.prestacao}</div>
        </div>
      </div>

      <div class="grid" style="margin-top: 12px;">
        <div class="field">
          <div class="field-label">Prazo</div>
          <div class="field-value">${resultados.prazo}</div>
        </div>
        <div class="field">
          <div class="field-label">Sistema de Amortização</div>
          <div class="field-value">${dadosSimulacao.sistemaAmortizacao}</div>
        </div>
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
  </div>

  <!-- PÁGINA 2: Plano de Pagamento -->
  <div class="page">
    <div class="header">
      <img src="${logoBase64}" alt="Logo VCA" class="logo">
      <h1>Plano de Pagamento</h1>
      <p>${dadosSimulacao.nomeCliente} - ${dadosSimulacao.unidade}</p>
    </div>

    ${prazoEntrega ? `
    <div class="section">
      <div class="field">
        <div class="field-label">Prazo de Entrega Previsto</div>
        <div class="field-value">${prazoEntrega}</div>
      </div>
    </div>
    ` : ''}

    <div class="section">
      <div class="section-title">Cronograma de Pagamento</div>
      <table class="plan-table">
        <thead>
          <tr>
            <th>SÉRIE</th>
            <th class="center">PARCELAS</th>
            <th class="center">VALOR</th>
            <th class="center">DATA</th>
          </tr>
        </thead>
        <tbody>
          ${ordenarLinhasPlano(linhasPlano)
            .filter((linha: LinhaPlano) => linha.serie && linha.serieId)
            .map((linha: LinhaPlano) => `
              <tr>
                <td>${linha.serie}</td>
                <td class="center">${linha.parcelas}</td>
                <td class="center valor">${linha.valor}</td>
                <td class="center">${linha.data || '-'}</td>
              </tr>
            `).join('')}
          
          <!-- Linhas fixas: Valor Financiado e Subsídio -->
          <tr style="background: #e3f2fd; border-top: 2px solid #0066cc;">
            <td class="serie" style="color: #1565c0;">Valor Financiado</td>
            <td class="center">-</td>
            <td class="center valor" style="color: #1565c0;">${resultados.valorFinanciado}</td>
            <td class="center">-</td>
          </tr>
          <tr style="background: #e3f2fd;">
            <td class="serie" style="color: #1565c0;">Subsídio</td>
            <td class="center">-</td>
            <td class="center valor" style="color: #1565c0;">${resultados.subsidio}</td>
            <td class="center">-</td>
          </tr>
          
          <tr class="total-row">
            <td colspan="2"><strong>TOTAL DO PLANO</strong></td>
            <td class="center"><strong>${(() => {
              let total = 0;
              linhasPlano.forEach((linha: LinhaPlano) => {
                if (linha.valorOriginal > 0) {
                  total += linha.valorOriginal;
                }
              });
              const valorFinanciadoNum = parseFloat(resultados.valorFinanciado.replace(/[R$\s.]/g, '').replace(',', '.'));
              const subsidioNum = parseFloat(resultados.subsidio.replace(/[R$\s.]/g, '').replace(',', '.'));
              total += valorFinanciadoNum + subsidioNum;
              return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(total);
            })()}</strong></td>
            <td></td>
          </tr>
        </tbody>
      </table>
      
      <!-- Prestação Financiamento -->
      <div style="margin-top: 20px; padding: 15px; background: #fff3e0; border: 2px solid #ff9800; border-radius: 6px; text-align: center;">
        <div style="font-size: 10px; color: #666; text-transform: uppercase; margin-bottom: 5px; font-weight: 600;">Prestação Financiamento</div>
        <div style="font-size: 20px; font-weight: bold; color: #e65100;">${resultados.prestacao}</div>
        <div style="font-size: 9px; color: #666; margin-top: 5px;">Valor mensal após entrega do imóvel</div>
      </div>
    </div>

    <div class="footer">
      <p><strong>Observações importantes:</strong></p>
      <p>• O valor da Entrada já considera os descontos de Sinal e Intermediárias.</p>
      <p>• O valor da prestação poderá sofrer reajustes durante o pagamento com o banco.</p>
      <p>• Este plano está sujeito à aprovação da instituição financeira.</p>
    </div>
  </div>
</body>
</html>
    `;

  return htmlContent;
}

let browserInstance: Browser | null = null;

async function getBrowserInstance(): Promise<Browser> {
  if (process.env.NODE_ENV === 'development' && browserInstance) {
    return browserInstance;
  }

  const executablePath = await chromium.executablePath();

  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath,
    headless: chromium.headless,
  });

  if (process.env.NODE_ENV === 'development') {
    browserInstance = browser;
  }

  return browser;
}

export async function POST(request: NextRequest) {
  let browser: Browser | null = null;
  try {
    const body: RequestBody = await request.json();
    const { dadosSimulacao } = body;

    const htmlContent = getHtmlContent(body);

    browser = await getBrowserInstance();
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });

    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

    await page.close();
    if (process.env.NODE_ENV !== 'development') {
      await browser.close();
    }

    const filename = `plano-pagamento-${dadosSimulacao.nomeCliente.replace(/\s+/g, '-')}.pdf`;
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Erro ao gerar PDF do plano:', error);
    if (browser && process.env.NODE_ENV !== 'development') {
      await browser.close();
    }
    return NextResponse.json(
      { error: 'Erro ao gerar PDF do plano de pagamento' },
      { status: 500 }
    );
  }
}
