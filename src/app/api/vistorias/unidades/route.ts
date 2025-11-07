/* eslint-disable prettier/prettier */
import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_TECH_API_URL
const API_ENDPOINT = 'units'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = searchParams.get('page')
  const pageSize = searchParams.get('pageSize')
  const id = searchParams.get('id')

  let getUrl = `${API_BASE_URL}/${API_ENDPOINT}?page=${page}&pageSize=${pageSize}`

  if (id) {
    getUrl = `${API_BASE_URL}/${API_ENDPOINT}/${id}`
  }

  const res = await fetch(getUrl, {
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_VISTORIAS_TOKEN}`,
    },
  })

  const data = await res.json()
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  const res = await fetch(`${API_BASE_URL}/${API_ENDPOINT}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_VISTORIAS_TOKEN}`,
    },
    body: JSON.stringify(body),
  })

  const data = await res.json()
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  console.log('🔵 [API PATCH] Recebida requisição PATCH')
  console.log('🔵 [API PATCH] ID da unidade:', id)

  if (!id) {
    console.error('🔴 [API PATCH] ID não fornecido!')
    return NextResponse.json({ error: 'ID is required' }, { status: 400 })
  }

  const body = await req.json()
  console.log('🔵 [API PATCH] Body recebido:', body)
  console.log('🔵 [API PATCH] Validations:', body.validations)

  const apiUrl = `${API_BASE_URL}/${API_ENDPOINT}/${id}`
  console.log('🔵 [API PATCH] URL da API externa:', apiUrl)
  console.log('🔵 [API PATCH] Enviando requisição para API externa...')

  const externalResponse = await fetch(apiUrl, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_VISTORIAS_TOKEN}`,
    },
    body: JSON.stringify(body),
  })

  console.log(
    '🟢 [API PATCH] Status da resposta da API externa:',
    externalResponse.status
  )
  console.log('🟢 [API PATCH] Status text:', externalResponse.statusText)

  const responseData = await externalResponse.json().catch(() => null)
  console.log('🟢 [API PATCH] Response data da API externa:', responseData)

  if (!externalResponse.ok) {
    console.error('🔴 [API PATCH] Erro na API externa!')
    return NextResponse.json(
      { error: 'Failed to update unit', details: responseData },
      { status: externalResponse.status }
    )
  }

  console.log('🟢 [API PATCH] PATCH executado com sucesso!')
  return NextResponse.json({ status: 200, data: responseData })
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id)
    return NextResponse.json({ error: 'ID is required' }, { status: 400 })

  await fetch(`${API_BASE_URL}/${API_ENDPOINT}/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_VISTORIAS_TOKEN}`,
    },
  })

  return NextResponse.json({ status: 200 })
}
