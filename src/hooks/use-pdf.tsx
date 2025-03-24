import React, { useCallback } from 'react'
import ReactDOMServer from 'react-dom/server'

async function generatePdfFromComponent<T>(
  Component: React.ElementType,
  props: T,
  fileName: string,
) {
  const htmlContent = ReactDOMServer.renderToString(
    React.createElement(Component, props as React.Attributes & T),
  )

  const response = await fetch(`${process.env.NEXT_PUBLIC_TECH_API_URL}/pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `,
      fileName,
    }),
  })

  if (!response.ok) {
    console.error('Erro ao gerar PDF')
    return
  }

  const pdfBlob = await response.blob()
  const url = URL.createObjectURL(pdfBlob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${fileName}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  return url
}

export function usePdf<T>({
  Component,
  props,
  fileName,
}: {
  Component: React.ElementType
  props: T
  fileName: string
}) {
  const generatePdf = useCallback(
    () => generatePdfFromComponent(Component, props, fileName),
    [Component, props],
  )

  return {
    generatePdf,
  }
}
