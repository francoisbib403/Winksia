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
    
    console.log('Executing SQL...');
    const { data, error } = await supabase.rpc('execute_sql', { sql: sqlFile });
    
    if (error) {
      console.error('Error executing SQL:', error);
      process.exit(1);
    }
    
    console.log('Database initialized successfully!');
    console.log('Response:', data);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

initializeDatabase();