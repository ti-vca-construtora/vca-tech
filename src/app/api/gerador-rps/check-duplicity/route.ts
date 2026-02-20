import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-epi";

interface CheckData {
  cpf: string;
  valorServico: string;
}

// Extrair valor numérico da string formatada
function parseMonetaryValue(value: string): number {
  const cleaned = value.replace(/[^\d,]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}

export async function POST(request: Request) {
  try {
    const data: CheckData = await request.json();

    if (!data.cpf || !data.valorServico) {
      return NextResponse.json(
        { error: "CPF e Valor são obrigatórios" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Para RPS, fixamos em 1 dia de intervalo como especificado
    const intervaloDias = 1;
    const valorNumerico = parseMonetaryValue(data.valorServico);

    // Calcular data limite (1 dia atrás)
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - intervaloDias);

    // Buscar RPS similares
    const { data: rpsExistentes, error: searchError } = await supabase
      .from('tb_rps')
      .select('*')
      .eq('cpf', data.cpf)
      .eq('valor_liquido', valorNumerico)
      .gte('created_at', dataLimite.toISOString())
      .order('created_at', { ascending: false })
      .returns<Array<{
        rps_number: string;
        nome_razao_social: string;
        cpf: string;
        descricao_servico: string;
        created_at: string;
      }>>();

    if (searchError) {
      console.error('Erro ao buscar RPS:', searchError);
      return NextResponse.json(
        { error: "Erro ao verificar duplicidade" },
        { status: 500 }
      );
    }

    if (rpsExistentes && rpsExistentes.length > 0) {
      const ultimoRPS = rpsExistentes[0];
      const diasDesdeUltimoRPS = Math.floor(
        (Date.now() - new Date(ultimoRPS.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );

      return NextResponse.json({
        isDuplicate: true,
        intervaloDias,
        diasDesdeUltimoRPS,
        ultimoRPS: {
          rpsNumber: ultimoRPS.rps_number,
          nomeRazaoSocial: ultimoRPS.nome_razao_social,
          cpf: ultimoRPS.cpf,
          descricaoServico: ultimoRPS.descricao_servico,
          createdAt: ultimoRPS.created_at,
        },
      });
    }

    return NextResponse.json({
      isDuplicate: false,
      intervaloDias,
    });
  } catch (error) {
    console.error("Erro ao verificar duplicidade:", error);
    return NextResponse.json(
      { error: "Erro ao verificar duplicidade" },
      { status: 500 }
    );
  }
}
