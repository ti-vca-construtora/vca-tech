/* eslint-disable prettier/prettier */
import { NextRequest, NextResponse } from "next/server";

const API_URL = `${process.env.NEXT_PUBLIC_TECH_API_URL}/inspection-config`;

export async function GET() {
  try {
    const token = process.env.NEXT_PUBLIC_VISTORIAS_TOKEN;

    if (!token) {
      return NextResponse.json(
        { error: "Access token não configurado" },
        { status: 500 },
      );
    }

    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("GET /inspection-config - Status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: "Erro ao buscar configurações", details: errorText },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro na API inspection-config:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = process.env.NEXT_PUBLIC_VISTORIAS_TOKEN;

    if (!token) {
      return NextResponse.json(
        { error: "Access token não configurado" },
        { status: 500 },
      );
    }

    const body = await request.json();

    const response = await fetch(API_URL, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    console.log("PATCH /inspection-config - Status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: "Erro ao atualizar configurações", details: errorText },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro na API inspection-config PATCH:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
