import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-epi";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createClient();

    const { data: empresas, error } = await supabase
      .from('tb_cdc')
      .select('*')
      .order('trade_name', { ascending: true });

    if (error) {
      console.error('Erro ao buscar empresas:', error);
      return NextResponse.json(
        { error: "Erro ao buscar empresas" },
        { status: 500 }
      );
    }

    return NextResponse.json(empresas || []);
  } catch (error) {
    console.error("Erro ao buscar empresas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar empresas" },
      { status: 500 }
    );
  }
}
