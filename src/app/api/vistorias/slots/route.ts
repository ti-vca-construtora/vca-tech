import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_TECH_API_URL
const API_ENDPOINT = 'inspection-slots'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = searchParams.get('page')
  const pageSize = searchParams.get('pageSize')
  const id = searchParams.get('id')
  const isEnabled = searchParams.get('isEnabled')
  const fromDate = searchParams.get('fromDate')
  const toDate = searchParams.get('toDate')
  const developmentId = searchParams.get('developmentId')

  let getUrl = `${API_BASE_URL}/${API_ENDPOINT}?page=${page}&pageSize=${pageSize}`

  if (id) {
    getUrl = `${API_BASE_URL}/${API_ENDPOINT}/${id}`
  }

  if (isEnabled) {
    getUrl = `${API_BASE_URL}/${API_ENDPOINT}?page=${page}&pageSize=${pageSize}&isEnabled=${isEnabled}`
  }

  if (fromDate) {
    getUrl = `${API_BASE_URL}/${API_ENDPOINT}?fromDate=${fromDate}&page=1&pageSize=99999`
  }

  if (fromDate && toDate) {
    getUrl = `${API_BASE_URL}/${API_ENDPOINT}?fromDate=${fromDate}&toDate=${toDate}&page=1&pageSize=99999`
  }

  if (fromDate && developmentId) {
    getUrl = `${API_BASE_URL}/${API_ENDPOINT}?fromDate=${fromDate}&developmentId=${developmentId}&page=1&pageSize=99999`
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

  console.log('[API SLOTS POST] Recebido:', {
    totalSlots: body.slots?.length ?? 0,
    amostra: body.slots?.slice(0, 2) ?? [],
  })
  console.log('[API SLOTS POST] URL:', `${API_BASE_URL}/${API_ENDPOINT}/bulk`)

  try {
    const res = await fetch(`${API_BASE_URL}/${API_ENDPOINT}/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_VISTORIAS_TOKEN}`,
      },
      body: JSON.stringify(body),
    })

    console.log(
      '[API SLOTS POST] Status da resposta:',
      res.status,
      res.statusText
    )

    const data = await res.json()
    console.log('[API SLOTS POST] Resposta:', data)

    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    console.error('[API SLOTS POST] Erro:', error)
    return NextResponse.json(
      { error: 'Erro ao criar slots', details: String(error) },
      { status: 500 }
    )
  }
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
