import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-epi";

interface SiengeCompany {
  id: number;
  name: string;
  cnpj: string;
  tradeName: string;
}

interface SiengeResponse {
  resultSetMetadata: {
    count: number;
  };
  results: SiengeCompany[];
}

export async function POST() {
  try {
    // Credenciais para autenticação Basic Auth
    const username = "vca-tech";
    const password = "8w7WKHD6i8A15jFcTj7ldGBHgzsYglU5";
    const basicAuth = Buffer.from(`${username}:${password}`).toString("base64");

    // Buscar empresas do Sienge
    const siengeResponse = await fetch(
      "https://api.sienge.com.br/vca/public/api/v1/companies?limit=200",
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!siengeResponse.ok) {
      console.error("Erro na resposta do Sienge:", siengeResponse.status);
      return NextResponse.json(
        { error: "Erro ao buscar empresas no Sienge" },
        { status: siengeResponse.status }
      );
    }

    const siengeData: SiengeResponse = await siengeResponse.json();
    const companies = siengeData.results;

    if (!companies || companies.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma empresa encontrada no Sienge" },
        { status: 404 }
      );
    }

    // Conectar ao Supabase
    const supabase = createClient();

    // Buscar empresas existentes
    const { data: existingCompanies, error: fetchError } = await (supabase
      .from("tb_empresas")
      .select("external_id") as any);

    if (fetchError) {
      console.error("Erro ao buscar empresas existentes:", fetchError);
      return NextResponse.json(
        { error: "Erro ao buscar empresas existentes no banco de dados" },
        { status: 500 }
      );
    }

    const existingIds = new Set(
      existingCompanies?.map((c: any) => c.external_id) || []
    );

    // Separar empresas para inserção e atualização
    const toInsert = companies.filter((c) => !existingIds.has(c.id));
    const toUpdate = companies.filter((c) => existingIds.has(c.id));

    let insertedCount = 0;
    let updatedCount = 0;
    const errors: string[] = [];

    // Inserir novas empresas
    if (toInsert.length > 0) {
      const { error: insertError } = await (supabase.from("tb_empresas") as any).insert(
        toInsert.map((company) => ({
          external_id: company.id,
          name: company.name,
          cnpj: company.cnpj,
          trade_name: company.tradeName,
        }))
      );

      if (insertError) {
        console.error("Erro ao inserir empresas:", insertError);
        errors.push(`Erro ao inserir empresas: ${insertError.message}`);
      } else {
        insertedCount = toInsert.length;
      }
    }

    // Atualizar empresas existentes
    for (const company of toUpdate) {
      const { error: updateError } = await (supabase
        .from("tb_empresas") as any)
        .update({
          name: company.name,
          cnpj: company.cnpj,
          trade_name: company.tradeName,
          updated_at: new Date().toISOString(),
        })
        .eq("external_id", company.id);

      if (updateError) {
        console.error(
          `Erro ao atualizar empresa ${company.id}:`,
          updateError
        );
        errors.push(
          `Erro ao atualizar empresa ${company.name}: ${updateError.message}`
        );
      } else {
        updatedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Sincronização concluída",
      stats: {
        total: companies.length,
        inserted: insertedCount,
        updated: updatedCount,
        errors: errors.length,
      },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Erro na sincronização:", error);
    return NextResponse.json(
      {
        error: "Erro ao sincronizar empresas",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
