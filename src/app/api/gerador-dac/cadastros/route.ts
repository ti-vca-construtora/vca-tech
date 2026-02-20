import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-epi";

export async function GET() {
  try {
    const supabase = createClient();

    const { data: cadastros, error } = await supabase
      .from('tb_dac_cadastros')
      .select('*')
      .order('nome_razao_social', { ascending: true });

    if (error) {
      console.error('Erro ao buscar cadastros:', error);
      return NextResponse.json(
        { error: "Erro ao buscar cadastros" },
        { status: 500 }
      );
    }

    return NextResponse.json(cadastros || []);
  } catch (error) {
    console.error("Erro ao buscar cadastros:", error);
    return NextResponse.json(
      { error: "Erro ao buscar cadastros" },
      { status: 500 }
    );
  }
}
