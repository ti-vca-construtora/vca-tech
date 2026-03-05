import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-epi";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createClient();

    const { data: companies, error } = await supabase
      .from("tb_empresas")
      .select("*")
      .order("trade_name", { ascending: true });

    if (error) {
      console.error("Erro ao buscar empresas CDC:", error);
      return NextResponse.json(
        { error: "Erro ao buscar empresas CDC" },
        { status: 500 }
      );
    }

    return NextResponse.json(companies || []);
  } catch (error) {
    console.error("Erro ao buscar empresas CDC:", error);
    return NextResponse.json(
      { error: "Erro ao buscar empresas CDC" },
      { status: 500 }
    );
  }
}
