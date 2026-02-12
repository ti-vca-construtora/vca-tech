import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-epi";

interface CheckData {
  cnpjEmpresa: string;
  valorLiquido: string;
}

// Extrair valor numérico da string formatada
function parseMonetaryValue(value: string): number {
  const cleaned = value.replace(/[^\d,]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}

export async function POST(request: Request) {
  try {
    const data: CheckData = await request.json();

    if (!data.cnpjEmpresa || !data.valorLiquido) {
      return NextResponse.json(
        { error: "CNPJ e Valor são obrigatórios" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Buscar configuração de intervalo
    const { data: config, error: configError } = await supabase
      .from('tb_dac_config')
      .select('intervalo_dias')
      .single<{ intervalo_dias: number }>();

    if (configError) {
      console.error('Erro ao buscar configuração:', configError);
      return NextResponse.json(
        { error: "Erro ao verificar configuração" },
        { status: 500 }
      );
    }

    const intervaloDias = config?.intervalo_dias || 30;
    const valorNumerico = parseMonetaryValue(data.valorLiquido);

    // Calcular data limite (intervalo dias atrás)
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - intervaloDias);

    // Buscar DACs similares
    const { data: dacsExistentes, error: searchError } = await supabase
      .from('tb_dac')
      .select('*')
      .eq('cnpj_empresa', data.cnpjEmpresa)
      .eq('valor_liquido', valorNumerico)
      .gte('created_at', dataLimite.toISOString())
      .order('created_at', { ascending: false })
      .returns<Array<{
        dac_number: string;
        nome_pessoa: string;
        cpf_cnpj_pessoa: string;
        descricao_servico: string;
        created_at: string;
      }>>();

    if (searchError) {
      console.error('Erro ao buscar DACs:', searchError);
      return NextResponse.json(
        { error: "Erro ao verificar duplicidade" },
        { status: 500 }
      );
    }

    if (dacsExistentes && dacsExistentes.length > 0) {
      const ultimoDAC = dacsExistentes[0];
      const diasDesdeUltimoDAC = Math.floor(
        (Date.now() - new Date(ultimoDAC.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );

      return NextResponse.json({
        isDuplicate: true,
        intervaloDias,
        diasDesdeUltimoDAC,
        ultimoDAC: {
          dacNumber: ultimoDAC.dac_number,
          nomePessoa: ultimoDAC.nome_pessoa,
          cpfCnpjPessoa: ultimoDAC.cpf_cnpj_pessoa,
          descricaoServico: ultimoDAC.descricao_servico,
          createdAt: ultimoDAC.created_at,
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
