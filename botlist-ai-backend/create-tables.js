const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xbldukqqduyifeucgies.supabase.co';
const supabaseKey = 'sb_secret_CeuYmu3f1NsIvR1zba9Pjg_lXSwg0te';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTables() {
  try {
    console.log('Creating categories table...');
    const { error: catError } = await supabase
      .from('categories')
      .select('*')
      .limit(1);
    
    if (catError && catError.code !== 'PGRST116') {
      console.error('Error checking categories table:', catError);
    } else {
      console.log('Categories table exists or will be created');
    }

    console.log('Creating files table...');
    const { error: fileError } = await supabase
      .from('files')
      .select('*')
      .limit(1);
    
    if (fileError && fileError.code !== 'PGRST116') {
      console.error('Error checking files table:', fileError);
    } else {
      console.log('Files table exists or will be created');
    }

    console.log('Creating tools table...');
    const { error: toolError } = await supabase
      .from('tools')
      .select('*')
      .limit(1);
    
    if (toolError && toolError.code !== 'PGRST116') {
      console.error('Error checking tools table:', toolError);
    } else {
      console.log('Tools table exists or will be created');
    }

    // If tables don't exist, create them
    if (catError?.code === 'PGRST116' || fileError?.code === 'PGRST116' || toolError?.code === 'PGRST116') {
      console.log('Tables do not exist, creating them...');
      
      // Create categories table
      const { error: createCatError } = await supabase.rpc('create_table', {
        table_name: 'categories',
        sql: `
          CREATE TABLE categories (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )
        `
      });
      
      if (createCatError) {
        console.error('Error creating categories table:', createCatError);
      } else {
        console.log('Categories table created successfully');
      }

      // Create files table
      const { error: createFileError } = await supabase.rpc('create_table', {
        table_name: 'files',
        sql: `
          CREATE TABLE files (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            filename VARCHAR(255) NOT NULL,
            original_name VARCHAR(255) NOT NULL,
            mimetype VARCHAR(100) NOT NULL,
            size INTEGER NOT NULL,
            url VARCHAR(500),
            key VARCHAR(255) UNIQUE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )
        `
      });
      
      if (createFileError) {
        console.error('Error creating files table:', createFileError);
      } else {
        console.log('Files table created successfully');
      }

      // Create tools table
      const { error: createToolError } = await supabase.rpc('create_table', {
        table_name: 'tools',
        sql: `
          CREATE TABLE tools (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            slug VARCHAR(255) UNIQUE NOT NULL,
            tagline VARCHAR(500),
            description TEXT NOT NULL,
            long_description TEXT,
            pricing_model VARCHAR(50) NOT NULL DEFAULT 'free',
            status VARCHAR(50) NOT NULL DEFAULT 'draft',
            website_url VARCHAR(500) NOT NULL,
            logo_file_id UUID REFERENCES files(id),
            demo_file_id UUID REFERENCES files(id),
            api_available BOOLEAN DEFAULT false,
            api_documentation_url VARCHAR(500),
            open_source BOOLEAN DEFAULT false,
            self_hosted_available BOOLEAN DEFAULT false,
            tech_stack JSONB DEFAULT '[]',
            supported_languages JSONB DEFAULT '[]',
            supported_formats JSONB DEFAULT '{}',
            integrations JSONB DEFAULT '[]',
            platforms JSONB DEFAULT '[]',
            gdpr_compliant BOOLEAN DEFAULT false,
            soc2_certified BOOLEAN DEFAULT false,
            hipaa_compliant BOOLEAN DEFAULT false,
            data_residency JSONB DEFAULT '[]',
            pricing_details JSONB DEFAULT '{}',
            overall_rating DECIMAL(3,2) DEFAULT 0,
            performance_score INTEGER,
            ease_of_use_score INTEGER,
            value_for_money_score INTEGER,
            support_score INTEGER,
            view_count INTEGER DEFAULT 0,
            review_count INTEGER DEFAULT 0,
            bookmark_count INTEGER DEFAULT 0,
            click_count INTEGER DEFAULT 0,
            meta_title VARCHAR(255),
            meta_description TEXT,
            keywords JSONB DEFAULT '[]',
            features JSONB DEFAULT '[]',
            use_cases JSONB DEFAULT '[]',
            created_by UUID,
            verified_by UUID,
            verified_at TIMESTAMP WITH TIME ZONE,
            featured BOOLEAN DEFAULT false,
            featured_until TIMESTAMP WITH TIME ZONE,
            published_at TIMESTAMP WITH TIME ZONE,
            last_crawled_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            primary_category_id UUID REFERENCES categories(id),
            subcategory_id UUID REFERENCES categories(id),
            category_ids JSONB DEFAULT '[]'
          )
        `
      });
      
      if (createToolError) {
        console.error('Error creating tools table:', createToolError);
      } else {
        console.log('Tools table created successfully');
      }

      // Insert default categories
      const { error: insertCatError } = await supabase
        .from('categories')
        .insert([
          { name: 'Productivity', description: 'Tools for productivity and task management' },
          { name: 'Marketing', description: 'Marketing and sales tools' },
          { name: 'Development', description: 'Software development tools' },
          { name: 'Design', description: 'Design and creative tools' },
          { name: 'Communication', description: 'Communication and collaboration tools' }
        ]);
      
      if (insertCatError) {
        console.error('Error inserting default categories:', insertCatError);
      } else {
        console.log('Default categories inserted successfully');
      }

      // Insert default tags
      const { error: insertTagError } = await supabase
        .from('tags')
        .insert([
          { name: 'AI' },
          { name: 'Automation' },
          { name: 'Analytics' },
          { name: 'Productivity' },
          { name: 'Marketing' },
          { name: 'Development' },
          { name: 'Design' },
          { name: 'Communication' }
        ]);
      
      if (insertTagError) {
        console.error('Error inserting default tags:', insertTagError);
      } else {
        console.log('Default tags inserted successfully');
      }
    }
    
    console.log('Database setup completed!');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

createTables();