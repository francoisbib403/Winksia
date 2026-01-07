-- =====================================================
-- MIGRATION: Add user authentication & chat features
-- Run this after the base schema (tools, users tables exist)
-- =====================================================

-- =====================================================
-- ALTER USERS TABLE - Add profile & preferences fields
-- =====================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS website VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS company VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS job_title VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_public_profile BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) DEFAULT 'fr';
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS push_notifications BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS theme VARCHAR(20) DEFAULT 'light';
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;

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

-- =====================================================
-- USER LIKED TOOLS
-- =====================================================
CREATE TABLE IF NOT EXISTS user_liked_tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, tool_id)
);

CREATE INDEX IF NOT EXISTS idx_user_liked_tools_user ON user_liked_tools(user_id);

-- =====================================================
-- USER FAVORITES
-- =====================================================
CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    note TEXT,
    folder_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, tool_id)
);

CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorites(user_id);

-- =====================================================
-- USER REVIEWS SUMMARY
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
-- USER REVIEWS - Add social columns to existing table
-- =====================================================
ALTER TABLE user_reviews ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;
ALTER TABLE user_reviews ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0;
ALTER TABLE user_reviews ADD COLUMN IF NOT EXISTS report_count INTEGER DEFAULT 0;
ALTER TABLE user_reviews ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_user_reviews_user ON user_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_tool ON user_reviews(tool_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_rating ON user_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_user_reviews_created ON user_reviews(created_at);

-- =====================================================
-- REVIEWS: LIKES (Like/Unlike reviews)
-- =====================================================
CREATE TABLE IF NOT EXISTS review_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES user_reviews(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_like BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(review_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_review_likes_review ON review_likes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_likes_user ON review_likes(user_id);

-- =====================================================
-- REVIEWS: COMMENTS (Comments on reviews - like Instagram)
-- =====================================================
CREATE TABLE IF NOT EXISTS review_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES user_reviews(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES review_comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    like_count INTEGER DEFAULT 0,
    report_count INTEGER DEFAULT 0,
    is_edited BOOLEAN DEFAULT false,
    is_hidden BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_review_comments_review ON review_comments(review_id);
CREATE INDEX IF NOT EXISTS idx_review_comments_parent ON review_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_review_comments_user ON review_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_review_comments_created ON review_comments(created_at);

-- =====================================================
-- REVIEWS: COMMENT LIKES
-- =====================================================
CREATE TABLE IF NOT EXISTS review_comment_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID REFERENCES review_comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_review_comment_likes_comment ON review_comment_likes(comment_id);

-- =====================================================
-- REVIEWS: SHARES
-- =====================================================
CREATE TABLE IF NOT EXISTS review_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES user_reviews(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(50),
    share_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_review_shares_review ON review_shares(review_id);

-- =====================================================
-- REVIEWS: REPORTS
-- =====================================================
CREATE TABLE IF NOT EXISTS review_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES user_reviews(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    moderated_by UUID REFERENCES users(id),
    moderated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_review_reports_review ON review_reports(review_id);
CREATE INDEX IF NOT EXISTS idx_review_reports_status ON review_reports(status);

-- =====================================================
-- SOCIAL: FOLLOWERS / FOLLOWING (Like Instagram)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);

-- =====================================================
-- SOCIAL: NOTIFICATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);

-- =====================================================
-- SOCIAL: USER MENTIONS (Tag users in reviews/comments)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_mentions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    mentioned_by UUID REFERENCES users(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_mentions_user ON user_mentions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_mentions_entity ON user_mentions(entity_type, entity_id);

-- =====================================================
-- SOCIAL: USER BADGES (Gamification - like Instagram badges)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    badge_type VARCHAR(50) NOT NULL,
    badge_name VARCHAR(100) NOT NULL,
    badge_icon VARCHAR(255),
    description TEXT,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);

-- =====================================================
-- SOCIAL: USER ACHIEVEMENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    points INTEGER DEFAULT 0,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);

-- =====================================================
-- USER COMPARISON LISTS
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
    tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(comparison_list_id, tool_id)
);

CREATE INDEX IF NOT EXISTS idx_comparison_lists_user ON user_comparison_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_comparison_list_tools_list ON user_comparison_list_tools(comparison_list_id);

-- =====================================================
-- USER SEARCH HISTORY
-- =====================================================
CREATE TABLE IF NOT EXISTS user_search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    query VARCHAR(500) NOT NULL,
    filters JSONB DEFAULT '{}',
    results_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_history_user ON user_search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created ON user_search_history(created_at);

-- =====================================================
-- USER ACTIVITY LOG
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

CREATE INDEX IF NOT EXISTS idx_user_activity_user ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_created ON user_activity(created_at);

-- =====================================================
-- CHAT SESSIONS
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

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_active ON chat_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_last_message ON chat_sessions(last_message_at);

-- =====================================================
-- CHAT MESSAGES
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

CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at);

-- =====================================================
-- CHAT SUGGESTED TOOLS
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_suggested_tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
    tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    tool_name VARCHAR(255),
    relevance_score DECIMAL(3,2),
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, tool_id)
);

CREATE INDEX IF NOT EXISTS idx_chat_suggested_tools_message ON chat_suggested_tools(message_id);

-- =====================================================
-- CHAT TOOL INTERACTIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_tool_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_tool_interactions_session ON chat_tool_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_tool_interactions_tool ON chat_tool_interactions(tool_id);
CREATE INDEX IF NOT EXISTS idx_chat_tool_interactions_user ON chat_tool_interactions(user_id);

-- =====================================================
-- VIEWS
-- =====================================================

-- Drop existing views if they exist to recreate them
DROP VIEW IF EXISTS user_profiles;
DROP VIEW IF EXISTS reviews_feed;
DROP VIEW IF EXISTS notifications_detail;
DROP VIEW IF EXISTS chat_sessions_detail;

CREATE OR REPLACE VIEW user_profiles AS
SELECT 
    u.id, u.email, u.first_name, u.last_name, u.avatar_url,
    u.bio, u.website, u.company, u.job_title, u.role,
    u.is_public_profile, u.preferred_language, u.theme,
    u.created_at, u.last_login_at,
    COALESCE(urs.total_reviews, 0) as total_reviews,
    COALESCE(urs.average_rating, 0) as average_rating,
    (SELECT COUNT(*) FROM user_liked_tools WHERE user_id = u.id) as liked_tools_count,
    (SELECT COUNT(*) FROM user_favorites WHERE user_id = u.id) as favorites_count,
    (SELECT COUNT(*) FROM chat_sessions WHERE user_id = u.id) as chat_sessions_count,
    (SELECT COUNT(*) FROM user_follows WHERE following_id = u.id) as followers_count,
    (SELECT COUNT(*) FROM user_follows WHERE follower_id = u.id) as following_count
FROM users u
LEFT JOIN user_reviews_summary urs ON urs.user_id = u.id;

CREATE OR REPLACE VIEW reviews_feed AS
SELECT 
    r.id, r.user_id, r.tool_id, r.rating, r.title, r.comment,
    r.helpful_count, r.comment_count, r.share_count, r.is_edited,
    r.created_at, r.updated_at,
    t.name as tool_name, t.slug as tool_slug, t.logo_file_id,
    u.first_name, u.last_name, u.avatar_url, u.bio,
    (SELECT COUNT(*) FROM review_likes WHERE review_id = r.id AND is_like = true) as likes_count,
    (SELECT COUNT(*) FROM review_likes WHERE review_id = r.id AND is_like = false) as dislikes_count
FROM user_reviews r
LEFT JOIN tools t ON t.id = r.tool_id
LEFT JOIN users u ON u.id = r.user_id
WHERE r.status = 'published'
ORDER BY r.created_at DESC;

CREATE OR REPLACE VIEW notifications_detail AS
SELECT 
    n.id, n.user_id, n.type, n.title, n.message, n.data,
    n.is_read, n.read_at, n.created_at,
    n.data->>'review_id' as review_id,
    n.data->>'comment_id' as comment_id,
    n.data->>'from_user_id' as from_user_id
FROM notifications n
ORDER BY n.created_at DESC;

CREATE OR REPLACE VIEW chat_sessions_detail AS
SELECT 
    cs.id, cs.user_id, cs.title, cs.message_count, cs.is_active,
    cs.created_at, cs.last_message_at,
    u.email, u.first_name, u.last_name, u.avatar_url,
    (SELECT content FROM chat_messages WHERE session_id = cs.id ORDER BY created_at DESC LIMIT 1) as last_message
FROM chat_sessions cs
LEFT JOIN users u ON u.id = cs.user_id;

-- =====================================================
-- COMPLETED
-- =====================================================
