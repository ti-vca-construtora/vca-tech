import { NextRequest, NextResponse } from 'next/server'

interface Receipt {
  receiptId: number
  receiptDate: string
  receiptValue: number
  monetaryCorrectionValue: number
  calculationDate: string
  indexerValueCalculationDate: number
}

interface InstallmentBase {
  installmentId: number
  currentBalance: number
  latePaymentInterest: number
  adjustedValue: number
  additionalValue: number
  originalValue: number
  monetaryCorrectionValue: number
  conditionType: string
  indexerCode: number
  indexerName: string
  baseDateOfCorrection: string
  indexerValueBaseDate: number
  installmentNumber: string
}

interface PaidInstallment extends InstallmentBase {
  receipts: Receipt[]
}

interface DueInstallment extends InstallmentBase {
  indexerValueCalculationDate: number
  dueDate: string
}

interface PayableInstallment extends InstallmentBase {
  indexerValueCalculationDate: number
  dueDate: string
}

export interface CurrentDebit {
  billReceivableId: number
  documentId: string
  paidInstallments: PaidInstallment[]
  dueInstallments: DueInstallment[]
  payableInstallments: PayableInstallment[]
}

export interface CurrentDebitBalanceExternalApiResponse {
  resultSetMetadata: {
    count: number
    offset: number
    limit: number
  }
  results: CurrentDebit[]
}

export interface CurrentDebitBalanceApiResponse {
  data: CurrentDebit[]
}

const API_URL = process.env.NEXT_PUBLIC_API_URL
const BASIC_HASH = process.env.NEXT_PUBLIC_HASH_BASIC
const LOTEAR_BASIC_HASH = process.env.NEXT_PUBLIC_HASH_BASIC_LOTEAR

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const document = searchParams.get('document')
    const documentType = searchParams.get('documentType')
    const billId = searchParams.get('billId')
    const origem = searchParams.get('origem')

    if (!document) {
      return NextResponse.json(
        { error: 'document não fornecido' },
        { status: 400 },
      )
    }

    if (!documentType) {
      return NextResponse.json(
        { error: 'documentType não fornecido' },
        { status: 400 },
      )
    }

    if (!origem) {
      return NextResponse.json(
        { error: 'origem não fornecido' },
        { status: 400 },
      )
    }

    if (!billId) {
      return NextResponse.json(
        { error: 'billId não fornecido' },
        { status: 400 },
      )
    }

    const response = await fetch(
      `${API_URL}${origem}/public/api/v1/current-debit-balance?${documentType}=${document}&numberTitle=${billId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Basic ${origem === 'vca' ? BASIC_HASH : LOTEAR_BASIC_HASH}`,
          'Content-Type': 'application/json',
        },
      },
    )

    // Log da resposta original da API externa
    console.log('Resposta da API:', response)

    if (!response.ok) {
      throw new Error('Erro ao buscar dados da API externa')
    }

    const data: CurrentDebitBalanceExternalApiResponse = await response.json()

    return NextResponse.json(data)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any | unknown) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
