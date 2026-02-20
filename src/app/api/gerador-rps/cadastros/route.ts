import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-epi";

export async function GET() {
  try {
    const supabase = createClient();

    const { data: cadastros, error } = await supabase
      .from('tb_rps_cadastros')
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

export async function PATCH(request: Request) {
  try {
    const supabase = createClient();
    const body = await request.json();
    const { id, nome_razao_social, rg, data_nascimento, nome_mae, pis, estado, municipio } = body;

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    const { error } = await (supabase.from('tb_rps_cadastros') as any)
      .update({
        nome_razao_social,
        rg,
        data_nascimento: data_nascimento || null,
        nome_mae,
        pis: pis || null,
        estado,
        municipio,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar cadastro:', error);
      return NextResponse.json({ error: "Erro ao atualizar cadastro" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao atualizar cadastro:", error);
    return NextResponse.json({ error: "Erro ao atualizar cadastro" }, { status: 500 });
  }
}
