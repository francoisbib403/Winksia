const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://xbldukqqduyifeucgies.supabase.co';
const supabaseKey = 'sb_secret_CeuYmu3f1NsIvR1zba9Pjg_lXSwg0te';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// SQL statements to create tables
const createTablesSQL = `
-- Create categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create files table
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
);

-- Create tools table
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
);

-- Create junction tables
CREATE TABLE tools_categories (
    tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (tool_id, category_id)
);

CREATE TABLE tools_screenshots (
    tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
    file_id UUID REFERENCES files(id) ON DELETE CASCADE,
    PRIMARY KEY (tool_id, file_id)
);

CREATE TABLE tools_videos (
    tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
    file_id UUID REFERENCES files(id) ON DELETE CASCADE,
    PRIMARY KEY (tool_id, file_id)
);

-- Create other tables
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
    user_id UUID,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    is_active BOOLEAN DEFAULT false,
    activation_code VARCHAR(255),
    activation_code_expires_at TIMESTAMP WITH TIME ZONE,
    reset_password_code VARCHAR(255),
    reset_password_code_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE tools_tags (
    tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (tool_id, tag_id)
);

CREATE TABLE secteur (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE metier (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE tache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE session (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default data
INSERT INTO categories (id, name, description) VALUES 
    (gen_random_uuid(), 'Productivity', 'Tools for productivity and task management'),
    (gen_random_uuid(), 'Marketing', 'Marketing and sales tools'),
    (gen_random_uuid(), 'Development', 'Software development tools'),
    (gen_random_uuid(), 'Design', 'Design and creative tools'),
    (gen_random_uuid(), 'Communication', 'Communication and collaboration tools')
ON CONFLICT DO NOTHING;

INSERT INTO tags (id, name) VALUES 
    (gen_random_uuid(), 'AI'),
    (gen_random_uuid(), 'Automation'),
    (gen_random_uuid(), 'Analytics'),
    (gen_random_uuid(), 'Productivity'),
    (gen_random_uuid(), 'Marketing'),
    (gen_random_uuid(), 'Development'),
    (gen_random_uuid(), 'Design'),
    (gen_random_uuid(), 'Communication')
ON CONFLICT DO NOTHING;
`;

async function initializeDatabase() {
  try {
    console.log('Initializing database tables...');
    
    // Execute the SQL to create tables
    const { data, error } = await supabase.rpc('exec', { sql: createTablesSQL });
    
    if (error) {
      console.error('Error creating tables:', error);
      process.exit(1);
    }
    
    console.log('Database initialization completed successfully!');
    console.log('Response:', data);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

initializeDatabase();