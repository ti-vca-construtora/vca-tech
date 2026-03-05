require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function fetchAllCompanies() {
  const basicAuth = process.env.NEXT_PUBLIC_HASH_BASIC;

  if (!basicAuth) {
    throw new Error('NEXT_PUBLIC_HASH_BASIC não configurada no .env');
  }

  const allCompanies = [];
  const limit = 100;
  let offset = 0;
  let totalCount = 0;

  do {
    const url = `https://api.sienge.com.br/vca/public/api/v1/companies?limit=${limit}&offset=${offset}`;
    console.log(`Buscando Sienge: ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro Sienge offset=${offset}: HTTP ${response.status}`);
    }

    const payload = await response.json();

    if (Array.isArray(payload.results)) {
      allCompanies.push(...payload.results);
    }

    if (offset === 0) {
      totalCount = payload?.resultSetMetadata?.count || 0;
      console.log(`Total esperado: ${totalCount}`);
    }

    offset += limit;
  } while (offset < totalCount);

  return allCompanies;
}

async function syncCdc() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_EPI_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_EPI_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_EPI_URL/NEXT_PUBLIC_SUPABASE_EPI_ANON_KEY não configuradas');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const companies = await fetchAllCompanies();

  if (companies.length === 0) {
    throw new Error('Nenhuma empresa retornada pela API /companies');
  }

  const records = companies.map((company) => ({
    external_id: company.id,
    name: company.name,
    cnpj: company.cnpj || '',
    trade_name: company.tradeName || company.name,
    updated_at: new Date().toISOString(),
  }));

  console.log(`Fazendo upsert de ${records.length} empresas em tb_empresas...`);
  const { error: upsertError } = await supabase
    .from('tb_empresas')
    .upsert(records, { onConflict: 'external_id' });

  if (upsertError) {
    throw new Error(`Erro no upsert da tb_empresas: ${upsertError.message}`);
  }

  const idsCsv = records.map((record) => record.external_id).join(',');
  if (idsCsv.length > 0) {
    console.log('Removendo empresas antigas da tb_empresas que não existem mais na API...');
    const { error: cleanupError } = await supabase
      .from('tb_empresas')
      .delete()
      .not('external_id', 'in', `(${idsCsv})`);

    if (cleanupError) {
      throw new Error(`Erro limpando empresas antigas da tb_empresas: ${cleanupError.message}`);
    }
  }

  const { count, error: countError } = await supabase
    .from('tb_empresas')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    throw new Error(`Erro ao contar tb_empresas: ${countError.message}`);
  }

  console.log(`Sincronização concluída. Total atual em tb_empresas: ${count}`);
}

syncCdc()
  .then(() => {
    console.log('OK');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Falha na sincronização CDC:', error.message);
    process.exit(1);
  });
