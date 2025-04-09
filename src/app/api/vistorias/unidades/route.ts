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

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 })
  }

  const body = await req.json()

  await fetch(`${API_BASE_URL}/${API_ENDPOINT}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_VISTORIAS_TOKEN}`,
    },
    body: JSON.stringify(body),
  })

  return NextResponse.json({ status: 200 })
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
