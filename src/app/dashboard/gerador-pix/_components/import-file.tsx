/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import * as xlsx from 'xlsx'
import * as qrcode from 'qrcode'
import Link from 'next/link'
import { useState } from 'react'
import { BsFiletypeXlsx } from 'react-icons/bs'
import { Loader2 } from 'lucide-react'
import JSZip from 'jszip'
import { toPng } from 'html-to-image'
import { generatePix } from '@/app/util'
import { ZodError, ZodIssue } from 'zod'
import { formSchema } from '../schema/pix-schema'

type Info = {
  'Tipo de Chave': 'Celular/Telefone' | 'CPF/CNPJ' | 'E-mail' | 'Outro'
  'Chave Pix': string
  'Nome do Beneficiario': string
  'Cidade do Beneficiario': string
  Identificador: string
  ' Valor (opcional) ': string
}

type PixResult = {
  success: boolean
  payload: string | null
  qrCodeLink: string | null
  identificador: string
  error: ZodIssue[] | null
}

export function ImportFile() {
  const [file, setFile] = useState<File>()
  const [info, setInfo] = useState<Info[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleReadFile = async () => {
    setIsLoading(true)
    const reader = new FileReader()

    reader.onload = (event) => {
      const data = event.target?.result

      if (!data) return

      const workbook = xlsx.read(data, { type: 'array' })

      const sheetName = workbook.SheetNames.find(
        (name) => name.toLowerCase() === 'dados',
      )

      if (!sheetName) {
        console.error('A aba "dados" não foi encontrada.')
        return
      }

      const worksheet = workbook.Sheets[sheetName]
      const jsonData = xlsx.utils.sheet_to_json(worksheet, { defval: null })

      setInfo(jsonData as Info[])
    }

    reader.readAsArrayBuffer(file!)

    const timeout = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timeout)
  }

  const handleDownloadAllPixData = async () => {
    const zip = new JSZip()
    const pixDataArray = await handleInfoToPixData()

    console.log('pixDataArray: ', pixDataArray)

    for (let i = 0; i < pixDataArray.length; i++) {
      const { payload, qrCodeLink, identificador } = pixDataArray[i]
      console.log('Processando item:', i, payload, qrCodeLink)

      const container = document.createElement('div')
      container.style.backgroundColor = 'white'
      container.style.padding = '20px'
      container.style.display = 'flex'
      container.style.flexDirection = 'column'
      container.style.alignItems = 'center'
      container.style.justifyItems = 'center'
      container.style.width = 'fit-content'
      container.style.height = 'fit-content'

      if (!qrCodeLink) {
        throw new Error('Link de imagem QR Code não fornecido')
      }

      const img = new Image()
      img.src = qrCodeLink
      img.alt = 'QR Code'
      img.width = 200
      img.height = 200

      img.onload = () => console.log(`Imagem carregada para item ${i}`)
      img.onerror = (err) =>
        console.error(`Erro ao carregar imagem para item ${i}:`, err)

      container.appendChild(img)

      const text = document.createElement('span')
      text.textContent = identificador
      container.appendChild(text)

      document.body.appendChild(container)

      try {
        const dataUrl = await toPng(container, { backgroundColor: 'white' })

        const base64Data = dataUrl.split(',')[1]
        zip.file(`pix-${i + 1}.png`, base64Data, { base64: true })
      } catch (error) {
        console.error(`Erro ao gerar PNG para o item ${i + 1}:`, error)
      } finally {
        document.body.removeChild(container)
      }
    }

    zip.generateAsync({ type: 'blob' }).then((content) => {
      const link = document.createElement('a')
      link.href = URL.createObjectURL(content)
      link.download = `pix-data-${Date.now()}.zip`
      link.click()
    })
  }

  const handleInfoToPixData = async (): Promise<PixResult[]> => {
    console.log(info)
    const results = await Promise.all(
      info.map(async (item): Promise<PixResult> => {
        const transformedItem = {
          keyType: item['Tipo de Chave'].toLowerCase().includes('cpf')
            ? 'cpf'
            : 'tel',
          key:
            item['Tipo de Chave'] === 'Celular/Telefone'
              ? `+55${item['Chave Pix']}`
              : item['Chave Pix'],
          nomeBeneficiario: item['Nome do Beneficiario'],
          cidade: item['Cidade do Beneficiario'],
          valor: item[' Valor (opcional) ']?.toString(),
          identificador: item.Identificador.trim(),
        }

        try {
          formSchema.parse(transformedItem)

          const response = generatePix([
            {
              name: transformedItem.nomeBeneficiario,
              key: transformedItem.key,
              transactionId: transformedItem.identificador.trim(),
              city: transformedItem.cidade,
              value: Number(transformedItem.valor) || 0,
            },
          ])
          const payload = response.payload()
          const qrCodeUrl = await qrcode.toDataURL(payload)

          return {
            success: true,
            payload,
            qrCodeLink: qrCodeUrl,
            identificador: transformedItem.identificador,
            error: null,
          }
        } catch (error) {
          if (error instanceof ZodError) {
            return {
              success: false,
              payload: null,
              qrCodeLink: null,
              identificador: transformedItem.identificador,
              error: error.errors,
            }
          }

          return {
            success: false,
            payload: null,
            qrCodeLink: null,
            identificador: transformedItem.identificador,
            error: [
              {
                message: 'Erro desconhecido',
                path: [],
                code: 'custom',
              },
            ],
          }
        }
      }),
    )

    return results
  }

  return (
    <div className="size-full shadow-md bg-white rounded-lg py-4 px-16 flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">QR Code em Lote</h2>
      </div>
      <div className="flex gap-4 size-full">
        <div className="rounded-lg flex flex-col gap-6 p-4 bg-neutral-50 shadow-md size-full">
          <div className="bg-white shadow-md flex flex-col gap-2 rounded-lg w-full h-fit px-4 pt-4 pb-10">
            <span className="font-semibold">Importar planilha:</span>

            <span className="text-sm text-neutral-800">
              {'• A planilha deve estar no formato de arquivo .xlsx.'}
            </span>
            <span className="text-sm text-neutral-800">
              {'• A planilha deve respeitar a estrutura predefinida.'}
            </span>
            <span className="text-sm text-neutral-800">
              {'• Todos os campos obrigatórios precisam ser preenchidos.'}
            </span>
            <span className="text-sm text-neutral-800">
              {'• '}
              <Link
                className="font-semibold text-azul-claro-vca underline"
                href={'/assets/modelo-pix.xlsx'}
              >
                Clique aqui
              </Link>
              {' para baixar a planilha modelo.'}
            </span>
          </div>
          <div className="flex justify-around gap-4 size-full bg-white rounded-lg shadow-md p-4">
            {!info.length ? (
              <div className="self-center flex flex-col gap-4 justify-center items-center">
                <BsFiletypeXlsx className="text-7xl text-verde-vca bg-white" />
                <input
                  type="file"
                  accept=".xlsx"
                  onChange={(e) => setFile(e.target.files![0])}
                  className="text-xs"
                />
                <button
                  onClick={handleReadFile}
                  className="bg-azul-claro-vca mt-3 self-center font-semibold text-sm rounded text-white w-fit p-2"
                >
                  Importar Planilha
                </button>
              </div>
            ) : isLoading ? (
              <Loader2 className="animate-spin duration-500 self-center text-neutral-500" />
            ) : (
              <div className="text-sm flex flex-col justify-between gap-2 w-full">
                <div className="flex flex-col gap-2">
                  <h3 className="font-semibold">Resultado da Importação:</h3>
                  <span>Nenhum erro encontrado.</span>
                  <span>
                    Quantidade de linhas importadas:{' '}
                    <span className="font-semibold">{info.length}</span>
                  </span>
                  <span>
                    Valor total: R${' '}
                    <span className="font-semibold">
                      {info
                        .reduce((sum, item) => {
                          const value = item[' Valor (opcional) ']
                          return sum + (value ? parseFloat(value) : 0)
                        }, 0)
                        .toFixed(2)}
                    </span>
                  </span>
                </div>
                <button
                  onClick={handleDownloadAllPixData}
                  className="bg-azul-claro-vca mt-3 self-center font-semibold text-sm rounded text-white w-fit p-2"
                >
                  Download
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
