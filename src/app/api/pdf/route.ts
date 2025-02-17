import puppeteer from 'puppeteer'
import { NextResponse } from 'next/server'
import chromium from '@sparticuz/chromium'

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

    const browser = await puppeteer.launch({
      executablePath:
        process.env.NODE_ENV === 'production'
          ? await chromium.executablePath()
          : undefined,
      headless:
        process.env.NODE_ENV === 'production'
          ? (chromium.headless as boolean | 'shell' | undefined)
          : true,
      args: process.env.NODE_ENV === 'production' ? chromium.args : [],
    })
    const page = await browser.newPage()

    await page.setContent(fullHtml, {
      waitUntil: 'networkidle0',
      timeout: 10000,
    })

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 10, bottom: 10, left: 10, right: 10 },
    })

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
