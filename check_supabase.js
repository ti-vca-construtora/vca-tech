const fs = require('fs');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_EPI_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_EPI_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return console.error('Missing env vars');

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase.from('tb_empresas').select('*').limit(5);
  
  if (error) {
    console.error('Error fetching tb_empresas:', error);
  } else {
    console.log('Result limited 5 tb_empresas:');
    console.log(JSON.stringify(data, null, 2));
  }
}

main();
