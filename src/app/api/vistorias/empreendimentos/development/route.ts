/* eslint-disable prettier/prettier */
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_TECH_API_URL;
const API_ENDPOINT = "developments";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Development ID is required" },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(`${API_BASE_URL}/${API_ENDPOINT}/${id}`, {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_VISTORIAS_TOKEN}`,
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch development" },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching development:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
