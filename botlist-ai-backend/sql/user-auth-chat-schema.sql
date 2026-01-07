-- =====================================================
-- USER AUTHENTICATION & CHAT HISTORY SCHEMA
-- Database initialization for Winksia application
-- =====================================================

-- =====================================================
-- USERS TABLE (Enhanced for authentication & profile)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url VARCHAR(500),
    bio TEXT,
    website VARCHAR(255),
    company VARCHAR(255),
    job_title VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    is_active BOOLEAN DEFAULT false,
    is_public_profile BOOLEAN DEFAULT true,
    preferred_language VARCHAR(10) DEFAULT 'fr',
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT false,
    theme VARCHAR(20) DEFAULT 'light',
    activation_code VARCHAR(255),
    activation_code_expires_at TIMESTAMP WITH TIME ZONE,
    reset_password_code VARCHAR(255),
    reset_password_code_expires_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- USER SESSIONS (JWT Tokens management)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255),
    device_type VARCHAR(50),
    device_name VARCHAR(100),
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- =====================================================
-- USER DATA: LIKED TOOLS
-- =====================================================
CREATE TABLE IF NOT EXISTS user_liked_tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tool_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, tool_id)
);

CREATE INDEX IF NOT EXISTS idx_user_liked_tools_user_id ON user_liked_tools(user_id);
CREATE INDEX IF NOT EXISTS idx_user_liked_tools_tool_id ON user_liked_tools(tool_id);
CREATE INDEX IF NOT EXISTS idx_user_liked_tools_created_at ON user_liked_tools(created_at);

-- =====================================================
-- USER DATA: FAVORITES
-- =====================================================
CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tool_id UUID NOT NULL,
    note TEXT,
    folder_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, tool_id)
);

CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_tool_id ON user_favorites(tool_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_folder ON user_favorites(folder_name);

-- =====================================================
-- USER DATA: REVIEWS SUMMARY
-- =====================================================
CREATE TABLE IF NOT EXISTS user_reviews_summary (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_reviews INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    five_star_count INTEGER DEFAULT 0,
    four_star_count INTEGER DEFAULT 0,
    three_star_count INTEGER DEFAULT 0,
    two_star_count INTEGER DEFAULT 0,
    one_star_count INTEGER DEFAULT 0,
    helpful_votes INTEGER DEFAULT 0,
    last_review_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- USER DATA: REVIEWS LIST (Detailed review history)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tool_id UUID NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'published',
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_reviews_user_id ON user_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_tool_id ON user_reviews(tool_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_rating ON user_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_user_reviews_created_at ON user_reviews(created_at);

-- =====================================================
-- USER DATA: COMPARISON LISTS
-- =====================================================
CREATE TABLE IF NOT EXISTS user_comparison_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    share_token VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_comparison_list_tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comparison_list_id UUID REFERENCES user_comparison_lists(id) ON DELETE CASCADE,
    tool_id UUID NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(comparison_list_id, tool_id)
);

CREATE INDEX IF NOT EXISTS idx_user_comparison_lists_user_id ON user_comparison_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_user_comparison_list_tools_list_id ON user_comparison_list_tools(comparison_list_id);

-- =====================================================
-- USER DATA: SEARCH HISTORY
-- =====================================================
CREATE TABLE IF NOT EXISTS user_search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    query VARCHAR(500) NOT NULL,
    filters JSONB DEFAULT '{}',
    results_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_search_history_user_id ON user_search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_search_history_query ON user_search_history(query);
CREATE INDEX IF NOT EXISTS idx_user_search_history_created_at ON user_search_history(created_at);

-- =====================================================
-- USER DATA: ACTIVITY LOG
-- =====================================================
CREATE TABLE IF NOT EXISTS user_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    metadata JSONB DEFAULT '{}',
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_action ON user_activity(action);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity(created_at);

-- =====================================================
-- CHAT HISTORY: SESSIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    context JSONB DEFAULT '{}',
    system_prompt TEXT,
    message_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_active ON chat_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_last_message ON chat_sessions(last_message_at);

-- =====================================================
-- CHAT HISTORY: MESSAGES
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    tokens_used INTEGER,
    model VARCHAR(100),
    processing_time_ms INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_role ON chat_messages(role);

-- =====================================================
-- CHAT HISTORY: SUGGESTED TOOLS
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_suggested_tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
    tool_id UUID NOT NULL,
    tool_name VARCHAR(255),
    relevance_score DECIMAL(3,2),
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, tool_id)
);

CREATE INDEX IF NOT EXISTS idx_chat_suggested_tools_message ON chat_suggested_tools(message_id);
CREATE INDEX IF NOT EXISTS idx_chat_suggested_tools_tool ON chat_suggested_tools(tool_id);

-- =====================================================
-- CHAT HISTORY: TOOL INTERACTIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_tool_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    tool_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_tool_interactions_session ON chat_tool_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_tool_interactions_tool ON chat_tool_interactions(tool_id);
CREATE INDEX IF NOT EXISTS idx_chat_tool_interactions_user ON chat_tool_interactions(user_id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update trigger to relevant tables
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at'
        AND table_schema = 'public'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON %I', t, t);
        EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t, t);
    END LOOP;
END;
$$;

-- Update chat session message count and last_message_at
CREATE OR REPLACE FUNCTION update_chat_session_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE chat_sessions 
        SET message_count = message_count + 1,
            last_message_at = NOW()
        WHERE id = NEW.session_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER chat_messages_stats_trigger
AFTER INSERT ON chat_messages
FOR EACH ROW EXECUTE FUNCTION update_chat_session_stats();

-- =====================================================
-- VIEWS
-- =====================================================

-- User profile view with stats
CREATE OR REPLACE VIEW user_profiles AS
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.avatar_url,
    u.bio,
    u.website,
    u.company,
    u.job_title,
    u.role,
    u.is_public_profile,
    u.preferred_language,
    u.theme,
    u.created_at,
    u.last_login_at,
    COALESCE(urs.total_reviews, 0) as total_reviews,
    COALESCE(urs.average_rating, 0) as average_rating,
    COALESCE((SELECT COUNT(*) FROM user_liked_tools WHERE user_id = u.id), 0) as liked_tools_count,
    COALESCE((SELECT COUNT(*) FROM user_favorites WHERE user_id = u.id), 0) as favorites_count,
    COALESCE((SELECT COUNT(*) FROM chat_sessions WHERE user_id = u.id), 0) as chat_sessions_count
FROM users u
LEFT JOIN user_reviews_summary urs ON urs.user_id = u.id;

-- Chat session detail view
CREATE OR REPLACE VIEW chat_sessions_detail AS
SELECT 
    cs.id,
    cs.user_id,
    cs.title,
    cs.message_count,
    cs.is_active,
    cs.created_at,
    cs.last_message_at,
    u.email,
    u.first_name,
    u.last_name,
    (
        SELECT content 
        FROM chat_messages 
        WHERE session_id = cs.id 
        ORDER BY created_at DESC 
        LIMIT 1
    ) as last_message_preview
FROM chat_sessions cs
LEFT JOIN users u ON u.id = cs.user_id;
