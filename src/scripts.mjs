import fs from 'fs/promises'
import path from 'path'

// Função para codificar imagem em base64 para utilização em PDF
async function convertImageToBase64() {
  const imagePath = path.resolve(process.cwd(), 'public/assets/logo-vca.png') // Trocar caminho
  const image = await fs.readFile(imagePath)
  const base64 = `data:image/png;base64,${image.toString('base64')}`

  const outputPath = path.resolve(process.cwd(), 'src/util/logo-base64.ts') // Criar arquivo e trocar caminho
  await fs.writeFile(outputPath, `export const LOGO_BASE64 = '${base64}'`)
}

convertImageToBase64()
