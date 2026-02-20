import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-epi";

interface CheckData {
  cpf: string;
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

    if (!data.cpf || !data.cnpjEmpresa || !data.valorLiquido) {
      return NextResponse.json(
        { error: "CPF, CNPJ e Valor são obrigatórios" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Buscar configuração de intervalo (se a tabela existir)
    let intervaloDias = 30; // valor padrão
    try {
      const { data: config, error: configError } = await supabase
        .from('tb_dac_config')
        .select('intervalo_dias')
        .single<{ intervalo_dias: number }>();

      if (!configError && config) {
        intervaloDias = config.intervalo_dias;
      }
    } catch (configErr) {
      // Usar padrão de 30 dias se tabela não existir
    }

    const valorNumerico = parseMonetaryValue(data.valorLiquido);

    // Calcular data limite (intervalo dias atrás)
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - intervaloDias);

    // Buscar DACs similares — CPF + CNPJ empresa + valor devem corresponder
    const { data: dacsExistentes, error: searchError } = await supabase
      .from('tb_dac')
      .select('*')
      .eq('cpf', data.cpf)
      .eq('cnpj_empresa', data.cnpjEmpresa)
      .eq('valor_liquido', valorNumerico)
      .gte('created_at', dataLimite.toISOString())
      .order('created_at', { ascending: false }) as { data: any[] | null; error: any };

    if (searchError) {
      console.error('[check-duplicity] Erro ao buscar DACs:', searchError);
      return NextResponse.json(
        { error: "Erro ao verificar duplicidade", details: searchError.message },
        { status: 500 }
      );
    }

    if (dacsExistentes && dacsExistentes.length > 0) {
      const ultimoDAC = dacsExistentes[0];
      const diasDesdeUltimoDAC = Math.floor(
        (Date.now() - new Date(ultimoDAC.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );

      // Suportar tanto campos novos quanto antigos
      const nomeRazaoSocial = ultimoDAC.nome_razao_social || ultimoDAC.nome_pessoa || 'N/A';
      const cpf = ultimoDAC.cpf || ultimoDAC.cpf_cnpj_pessoa || 'N/A';

      return NextResponse.json({
        isDuplicate: true,
        intervaloDias,
        diasDesdeUltimoDAC,
        ultimoDAC: {
          dacNumber: ultimoDAC.dac_number,
          nomeRazaoSocial,
          cpf,
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
    console.error("[check-duplicity] Erro geral:", error);
    return NextResponse.json(
      { error: "Erro ao verificar duplicidade", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
