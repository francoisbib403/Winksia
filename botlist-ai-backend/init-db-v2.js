const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xbldukqqduyifeucgies.supabase.co';
const supabaseKey = 'sb_secret_CeuYmu3f1NsIvR1zba9Pjg_lXSwg0te';

const supabase = createClient(supabaseUrl, supabaseKey);

const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  try {
    console.log('Reading SQL file...');
    const sqlFile = fs.readFileSync(path.join(__dirname, 'database-init.sql'), 'utf8');
    
    console.log('Splitting SQL into individual statements...');
    const sqlStatements = sqlFile
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`Found ${sqlStatements.length} SQL statements to execute`);
    
    for (const statement of sqlStatements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      const { data, error } = await supabase.rpc('exec', { sql: statement });
      
      if (error) {
        console.error(`Error executing statement: ${error.message}`);
        console.error(`Statement: ${statement}`);
        continue; // Continue with next statement
      }
      
      console.log(`Success: ${JSON.stringify(data).substring(0, 100)}...`);
    }
    
    console.log('Database initialization completed!');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

initializeDatabase();