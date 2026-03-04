-- =============================================
-- Likes & Comments Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- =============================================
-- HELPER FUNCTION: Auto-update updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- ARTICLE LIKES TABLE
-- =============================================
DROP TABLE IF EXISTS article_likes CASCADE;
CREATE TABLE article_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(article_id, user_id)
);

-- Indexes
CREATE INDEX idx_likes_article_id ON article_likes(article_id);
CREATE INDEX idx_likes_user_id ON article_likes(user_id);

-- Enable RLS
ALTER TABLE article_likes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can read likes" ON article_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own likes" ON article_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes" ON article_likes
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- ARTICLE COMMENTS TABLE
-- =============================================
DROP TABLE IF EXISTS article_comments CASCADE;
CREATE TABLE article_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  edited BOOLEAN DEFAULT FALSE,
  parent_id UUID REFERENCES article_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_comments_article_id ON article_comments(article_id);
CREATE INDEX idx_comments_user_id ON article_comments(user_id);
CREATE INDEX idx_comments_parent_id ON article_comments(parent_id);

-- Enable RLS
ALTER TABLE article_comments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can read comments" ON article_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can insert comments" ON article_comments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND (
      parent_id IS NULL OR
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
      )
    )
  );

CREATE POLICY "Users can update own comments" ON article_comments
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users and admins can delete comments" ON article_comments
  FOR DELETE USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Trigger for auto-updating updated_at
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON article_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- COMMENT LIKES TABLE
-- =============================================
DROP TABLE IF EXISTS comment_likes CASCADE;
CREATE TABLE comment_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID REFERENCES article_comments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- Indexes
CREATE INDEX idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX idx_comment_likes_user_id ON comment_likes(user_id);

-- Enable RLS
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can read comment likes" ON comment_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own comment likes" ON comment_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comment likes" ON comment_likes
  FOR DELETE USING (auth.uid() = user_id);
