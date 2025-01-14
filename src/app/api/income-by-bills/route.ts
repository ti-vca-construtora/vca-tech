import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL
const BASIC_HASH = process.env.NEXT_PUBLIC_HASH_BASIC

type PaymentTerm = {
  id: string
  description: string
}

type ReceiptsCategory = {
  costCenterId: number
  costCenterName: string
  financialCategoryId: string
  financialCategoryName: string
  financialCategoryReducer: string
  financialCategoryType: string
  financialCategoryRate: number
}

type FinancialCategory = {
  costCenterId: number
  financialCategoryId: string
  financialCategoryName: string
  financialCategoryReducer: string
  financialCategoryType: string
  financialCategoryRate: number
  bankMovementId: number
}

type BankMovement = {
  bankMovementDate: string
  sequencialNumber: number
  id: number
  amount: number
  historicId: number
  historicName: string
  operationId: number
  operationName: string
  operationType: string
  reconcile: string
  correctedAmount: number
  originId: string
  financialCategories: FinancialCategory[]
}

type Receipt = {
  operationTypeId: number
  operationTypeName: string
  grossAmount: number
  monetaryCorrectionAmount: number
  interestAmount: number
  fineAmount: number
  discountAmount: number
  taxAmount: number
  netAmount: number
  additionAmount: number
  insuranceAmount: number
  dueAdmAmount: number
  calculationDate: string
  paymentDate: string
  accountCompanyId: number
  accountNumber: string
  accountType: string
  sequencialNumber: number
  correctedNetAmount: number
  indexerId: number
  embeddedInterestAmount: number
  proRata: number
  bankMovements: BankMovement[]
}

export type Parcela = {
  companyId: number
  companyName: string
  businessAreaId: number
  businessAreaName: string
  projectId: number
  projectName: string
  groupCompanyId: number
  groupCompanyName: string
  holdingId: number
  holdingName: string
  subsidiaryId: number
  subsidiaryName: string
  businessTypeId: number
  businessTypeName: string
  clientId: number
  clientName: string
  billId: number
  installmentId: number
  documentIdentificationId: string
  documentIdentificationName: string
  documentNumber: string
  documentForecast: string
  originId: string
  originalAmount: number
  discountAmount: number
  taxAmount: number
  indexerId: number
  indexerName: string
  dueDate: string
  issueDate: string
  billDate: string
  installmentBaseDate: string
  balanceAmount: number
  correctedBalanceAmount: number
  periodicityType: string
  embeddedInterestAmount: number
  interestType: string
  interestRate: number
  correctionType: string
  interestBaseDate: string
  defaulterSituation: string
  subJudicie: string
  mainUnit: string
  installmentNumber: string
  paymentTerm: PaymentTerm
  receiptsCategories: ReceiptsCategory[]
  receipts: Receipt[]
}

export type IncomeByBillsApiResponse = {
  data: Parcela[]
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const billId = searchParams.get('billId')

    if (!billId) {
      return NextResponse.json(
        { error: 'billId não fornecido' },
        { status: 400 },
      )
    }

    const response = await fetch(
      `${API_URL}vca/public/api/bulk-data/v1/income/by-bills?billsIds=${billId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Basic ${BASIC_HASH}`,
          'Content-Type': 'application/json',
        },
      },
    )

    // Log da resposta original da API externa
    console.log('Resposta da API:', response)

    if (!response.ok) {
      throw new Error('Erro ao buscar dados da API externa')
    }

    const data: IncomeByBillsApiResponse = await response.json()
    return NextResponse.json(data)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any | unknown) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
