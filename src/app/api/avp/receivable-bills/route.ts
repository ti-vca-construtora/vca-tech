import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const BASIC_HASH = process.env.NEXT_PUBLIC_HASH_BASIC;
const LOTEAR_BASIC_HASH = process.env.NEXT_PUBLIC_HASH_BASIC_LOTEAR;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    const contractNumber = searchParams.get("contractNumber");
    const origem = searchParams.get("origem");

    if (!customerId) {
      return NextResponse.json(
        { error: "customerId não fornecido" },
        { status: 400 },
      );
    }

    if (!contractNumber) {
      return NextResponse.json(
        { error: "contractNumber não fornecido" },
        { status: 400 },
      );
    }

    if (!origem) {
      return NextResponse.json(
        { error: "origem não fornecido" },
        { status: 400 },
      );
    }

    const response = await fetch(
      `${API_URL}${origem}/public/api/v1/accounts-receivable/receivable-bills?customerId=${customerId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${origem === "vca" ? BASIC_HASH : LOTEAR_BASIC_HASH}`,
          "Content-Type": "application/json",
        },
      },
    );

    // Log da resposta original da API externa
    console.log("Resposta da API:", response);

    if (!response.ok) {
      throw new Error("Erro ao buscar dados da API externa");
    }

    const data = await response.json();
    return NextResponse.json(data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any | unknown) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
