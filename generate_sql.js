const fs = require('fs');

async function main() {
  const basicAuth = "dmNhLXRlY2g6OHc3V0tIRDZpOEExNWpGY1RqN2xkR0JIZ3pzWWdsVTU=";
  let allCompanies = [];
  let offset = 0;
  const limit = 100;
  let totalCount = 0;

  do {
    const url = `https://api.sienge.com.br/vca/public/api/v1/cost-centers?limit=${limit}&offset=${offset}`;
    console.log(`Fetching: ${url}`);
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Erro na resposta do Sienge (offset " + offset + "):", response.status);
      process.exit(1);
    }

    const siengeData = await response.json();
    
    if (siengeData.results) {
      allCompanies = allCompanies.concat(siengeData.results);
    }

    if (offset === 0 && siengeData.resultSetMetadata) {
      totalCount = siengeData.resultSetMetadata.count;
    }

    offset += limit;
  } while (offset < totalCount);

  let sql = "-- Remove a restrição de CNPJ único, se existir\n";
  sql += "ALTER TABLE tb_empresas DROP CONSTRAINT IF EXISTS tb_empresas_cnpj_key;\n\n";
  
  sql += "-- Limpa a tabela antes de inserir os novos dados e qualquer dado que dependa dela\n";
  sql += "TRUNCATE TABLE tb_empresas CASCADE;\n\n";

  sql += "INSERT INTO tb_empresas (external_id, name, cnpj, trade_name) VALUES\n";

  const filteredCompanies = allCompanies.filter(c => 
    c.name && c.name.replace(/\s+/g, ' ').toUpperCase().includes("VCA SERVIÇOS")
  );

  const values = filteredCompanies.map((c, index) => {
    const external_id = c.id;
    const name = c.name ? c.name.replace(/'/g, "''") : "";
    const cnpj = c.cnpj ? c.cnpj.replace(/'/g, "''") : "";
    const trade_name = name;
    
    return `(${external_id}, '${name}', '${cnpj}', '${trade_name}')`;
  });

  sql += values.join(",\n") + ";\n";

  fs.writeFileSync('insert_empresas.sql', sql, 'utf8');
  console.log("SQL generated at insert_empresas.sql com DROP CONSTRAINT e TRUNCATE.");
}

main().catch(console.error);
