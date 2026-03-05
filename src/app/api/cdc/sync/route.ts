import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-epi";

interface SiengeCompany {
  id: number;
  name: string;
  cnpj?: string;
  tradeName?: string;
}

interface SiengeResponse {
  resultSetMetadata?: {
    count: number;
  };
  results?: SiengeCompany[];
}

interface CompanyDbRecord {
  external_id: number;
  name: string;
  cnpj: string;
  trade_name: string;
  updated_at?: string;
}

interface QueryError {
  message: string;
}

interface CdcTableClient {
  select: (
    columns: string
  ) => Promise<{ data: Array<{ external_id: number }> | null; error: QueryError | null }>;
  upsert: (
    values: CompanyDbRecord[],
    options?: { onConflict?: string }
  ) => Promise<{ error: QueryError | null }>;
  delete: () => {
    not: (column: string, operator: string, value: string) => Promise<{ error: QueryError | null }>;
  };
}

export async function POST() {
  try {
    const basicAuth = process.env.NEXT_PUBLIC_HASH_BASIC;

    let allCompanies: SiengeCompany[] = [];
    let offset = 0;
    const limit = 100;
    let totalCount = 0;

    do {
      const siengeResponse = await fetch(
        `https://api.sienge.com.br/vca/public/api/v1/companies?limit=${limit}&offset=${offset}`,
        {
          method: "GET",
          headers: {
            Authorization: `Basic ${basicAuth}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!siengeResponse.ok) {
        console.error(
          "Erro na resposta do Sienge (offset " + offset + "):",
          siengeResponse.status
        );
        return NextResponse.json(
          { error: "Erro ao buscar empresas CDC no Sienge" },
          { status: siengeResponse.status }
        );
      }

      const siengeData: SiengeResponse = await siengeResponse.json();

      if (siengeData.results) {
        allCompanies = allCompanies.concat(siengeData.results);
      }

      if (offset === 0) {
        totalCount = siengeData.resultSetMetadata?.count || 0;
      }

      offset += limit;
    } while (offset < totalCount);

    if (allCompanies.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma empresa CDC encontrada no Sienge" },
        { status: 404 }
      );
    }

    const supabase = createClient();
    const cdcTable = supabase.from("tb_empresas") as unknown as CdcTableClient;

    const { data: existingCompanies, error: fetchError } = await cdcTable.select("external_id");
    const existingCount = existingCompanies?.length || 0;

    if (fetchError) {
      console.error("Erro ao buscar empresas CDC existentes:", fetchError);
      return NextResponse.json(
        { error: "Erro ao buscar empresas CDC existentes no banco de dados" },
        { status: 500 }
      );
    }

    const errors: string[] = [];
    const incomingIds = allCompanies.map((company) => company.id);
    const incomingIdsCsv = incomingIds.join(",");

    const records: CompanyDbRecord[] = allCompanies.map((company) => ({
      external_id: company.id,
      name: company.name,
      cnpj: company.cnpj || "",
      trade_name: company.tradeName || company.name,
      updated_at: new Date().toISOString(),
    }));

    const { error: upsertError } = await cdcTable.upsert(records, {
      onConflict: "external_id",
    });

    if (upsertError) {
      console.error("Erro no upsert de empresas CDC:", upsertError);
      return NextResponse.json(
        { error: `Erro ao sincronizar empresas CDC: ${upsertError.message}` },
        { status: 500 }
      );
    }

    if (incomingIds.length > 0) {
      const { error: cleanupError } = await cdcTable
        .delete()
        .not("external_id", "in", `(${incomingIdsCsv})`);

      if (cleanupError) {
        console.error("Erro ao limpar empresas CDC antigas:", cleanupError);
        errors.push(`Erro ao limpar empresas antigas: ${cleanupError.message}`);
      }
    }

    const insertedCount = Math.max(allCompanies.length - existingCount, 0);
    const updatedCount = Math.min(existingCount, allCompanies.length);

    return NextResponse.json({
      success: true,
      message: "Sincronização CDC concluída",
      stats: {
        total: allCompanies.length,
        inserted: insertedCount,
        updated: updatedCount,
        errors: errors.length,
      },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Erro na sincronização CDC:", error);
    return NextResponse.json(
      {
        error: "Erro ao sincronizar empresas CDC",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
