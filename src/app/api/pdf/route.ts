import puppeteer from 'puppeteer'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { htmlContent, fileName } = await req.json()

    if (!htmlContent) {
      return NextResponse.json({ error: 'HTML não fornecido' }, { status: 400 })
    }

    const pdfFileName = fileName ? `${fileName}.pdf` : 'documento.pdf'

    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `
    console.log('Iniciando Puppeteer...')

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    console.log('Puppeteer iniciado, criando página...')

    const page = await browser.newPage()

    await page.setContent(fullHtml, {
      waitUntil: 'networkidle0',
      timeout: 10000,
    })

    console.log('Gerando PDF...')

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 10, bottom: 10, left: 10, right: 10 },
    })

    console.log('PDF gerado com sucesso!')

    await browser.close()

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${pdfFileName}"`,
      },
    })
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 })
  }
}
