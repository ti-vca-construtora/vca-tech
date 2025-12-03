/* eslint-disable prettier/prettier */
import chromium from "@sparticuz/chromium-min";
import { addHours, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { NextResponse } from "next/server";
import puppeteer, { Browser } from "puppeteer";
import puppeteerCore, { type Browser as BrowserCore } from "puppeteer-core";

interface Inspection {
  id: string;
  status: string;
  inspectionSlot: {
    startAt: string | Date;
    endAt: string | Date;
  };
  unitId: string;
  unit: {
    unit: string;
    development: {
      name: string;
    };
  };
}

function generateAgendamentosHTML(data: {
  inspections: Inspection[];
  filters: {
    startDate: string;
    endDate: string;
    development: string;
  };
}) {
  const { inspections, filters } = data;

  const formatDate = (dateStr: string) => {
    return format(parseISO(dateStr), "dd/MM/yyyy", { locale: ptBR });
  };

  const formatDateTime = (date: string | Date) => {
    const dateObj =
      typeof date === "string" ? addHours(parseISO(date), 3) : date;
    return format(dateObj, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return '<span style="background: #dcfce7; color: #16a34a; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 500;">Entregue</span>';
      case "RESCHEDULED":
        return '<span style="background: #fef9c3; color: #ca8a04; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 500;">Recusado</span>';
      default:
        return '<span style="background: #f3f4f6; color: #374151; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 500;">Agendado</span>';
    }
  };

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 40px; background: #fff; }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            padding-bottom: 20px;
            border-bottom: 3px solid #2563eb;
          }
          .header h1 { 
            color: #1e40af; 
            font-size: 28px; 
            margin-bottom: 10px;
          }
          .filters { 
            background: #f8fafc; 
            padding: 20px; 
            border-radius: 8px; 
            margin-bottom: 30px;
            border-left: 4px solid #2563eb;
          }
          .filters h2 { 
            color: #1e40af; 
            font-size: 16px; 
            margin-bottom: 12px;
          }
          .filter-item { 
            margin: 8px 0; 
            color: #475569;
            font-size: 14px;
          }
          .filter-label { 
            font-weight: 600; 
            color: #334155;
          }
          .inspection-card { 
            background: #fff; 
            border: 1px solid #e2e8f0; 
            border-radius: 8px; 
            padding: 20px; 
            margin-bottom: 15px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .inspection-header { 
            display: flex; 
            justify-content: space-between; 
            align-items: center;
            margin-bottom: 12px;
          }
          .inspection-title { 
            font-size: 18px; 
            font-weight: 600; 
            color: #1e293b;
          }
          .inspection-details { 
            color: #64748b; 
            font-size: 14px;
            line-height: 1.6;
          }
          .inspection-detail { margin: 4px 0; }
          .no-data { 
            text-align: center; 
            color: #94a3b8; 
            padding: 40px; 
            font-size: 16px;
          }
          .footer { 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 1px solid #e2e8f0;
            text-align: center; 
            color: #94a3b8; 
            font-size: 12px;
          }
          .count { 
            background: #dbeafe; 
            color: #1e40af; 
            padding: 8px 16px; 
            border-radius: 6px; 
            font-weight: 600;
            display: inline-block;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📋 Relatório de Agendamentos</h1>
          <p style="color: #64748b; margin-top: 5px;">Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
        </div>

        <div class="filters">
          <h2>🔍 Filtros Aplicados</h2>
          <div class="filter-item">
            <span class="filter-label">Período:</span> ${formatDate(filters.startDate)} até ${formatDate(filters.endDate)}
          </div>
          <div class="filter-item">
            <span class="filter-label">Empreendimento:</span> ${filters.development}
          </div>
          <div class="count">Total de agendamentos: ${inspections.length}</div>
        </div>

        ${
          inspections.length === 0
            ? '<div class="no-data">Nenhum agendamento encontrado com os filtros aplicados.</div>'
            : inspections
                .map(
                  (inspection) => `
            <div class="inspection-card">
              <div class="inspection-header">
                <div class="inspection-title">${inspection.unit.development.name}</div>
                <div>${getStatusBadge(inspection.status)}</div>
              </div>
              <div class="inspection-details">
                <div class="inspection-detail"><strong>Unidade:</strong> ${inspection.unit.unit}</div>
                <div class="inspection-detail"><strong>Data/Hora:</strong> ${formatDateTime(inspection.inspectionSlot.startAt)} - ${format(typeof inspection.inspectionSlot.endAt === "string" ? addHours(parseISO(inspection.inspectionSlot.endAt), 3) : inspection.inspectionSlot.endAt, "HH:mm")}</div>
              </div>
            </div>
          `,
                )
                .join("")
        }

        <div class="footer">
          <p>VCA Tech - Sistema de Gestão de Vistorias</p>
          <p>Este relatório foi gerado automaticamente pelo sistema</p>
        </div>
      </body>
    </html>
  `;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { htmlContent, fileName, type, data } = body;

    let finalHtml = htmlContent;
    let pdfFileName = fileName ? `${fileName}.pdf` : "documento.pdf";

    // Se for do tipo 'agendamentos', gerar HTML específico
    if (type === "agendamentos" && data) {
      pdfFileName = `agendamentos-${format(new Date(), "dd-MM-yyyy-HHmmss")}.pdf`;
      finalHtml = generateAgendamentosHTML(data);
    }

    if (!finalHtml) {
      return NextResponse.json(
        { error: "HTML não fornecido" },
        { status: 400 },
      );
    }

    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        </head>
        <body>
          ${finalHtml}
        </body>
      </html>
    `;
    console.log("Iniciando Puppeteer...");
    console.time("Geração do PDF");

    let browser: Browser | BrowserCore;

    console.log("Environment: ", process.env.NODE_ENV);

    if (
      process.env.NODE_ENV === "production" ||
      process.env.VERCEL_ENV === "production"
    ) {
      const executablePath = await chromium.executablePath(
        "https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar",
      );
      browser = await puppeteerCore.launch({
        executablePath,
        args: chromium.args,
        headless: true,
        defaultViewport: chromium.defaultViewport,
      });
    } else {
      browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    }

    console.log("Puppeteer iniciado, criando página...");

    const page = await browser.newPage();

    await page.setContent(fullHtml, {
      waitUntil: "load",
      timeout: 15000,
    });

    console.log("Gerando PDF...");

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: 10, bottom: 10, left: 10, right: 10 },
      scale: 0.8,
    });

    console.log("PDF gerado com sucesso!");
    console.timeEnd("Geração do PDF");

    await browser.close();

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${pdfFileName}"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
