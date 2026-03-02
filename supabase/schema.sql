-- =============================================
-- BeyondCoding Database Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- Enable UUID extension (usually enabled by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ARTICLES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  category TEXT NOT NULL,
  author TEXT NOT NULL,
  read_time TEXT,
  featured BOOLEAN DEFAULT FALSE,
  published BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_articles_user_id ON articles(user_id);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);

-- =============================================
-- COURSES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '📚',
  category TEXT NOT NULL,
  author TEXT NOT NULL,
  estimated_time TEXT,
  published BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_courses_user_id ON courses(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(published);

-- =============================================
-- COURSE CHAPTERS TABLE (links courses to articles)
-- =============================================
CREATE TABLE IF NOT EXISTS course_chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  chapter_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_chapters_course_id ON course_chapters(course_id);
CREATE INDEX IF NOT EXISTS idx_chapters_article_id ON course_chapters(article_id);

-- =============================================
-- USER PROGRESS TABLE (tracks completed chapters)
-- =============================================
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  chapter_id UUID REFERENCES course_chapters(id) ON DELETE CASCADE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, chapter_id)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_progress_user_course ON user_progress(user_id, course_id);

-- =============================================
-- TOPICS/CATEGORIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  icon TEXT DEFAULT '📁',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

-- ARTICLES POLICIES
-- Anyone can read published articles
CREATE POLICY "Public can read published articles" ON articles
  FOR SELECT USING (published = TRUE);

-- Authors can CRUD their own articles
CREATE POLICY "Authors can insert own articles" ON articles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authors can update own articles" ON articles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Authors can delete own articles" ON articles
  FOR DELETE USING (auth.uid() = user_id);

-- Authors can read their own unpublished articles
CREATE POLICY "Authors can read own articles" ON articles
  FOR SELECT USING (auth.uid() = user_id);

-- COURSES POLICIES
-- Anyone can read published courses
CREATE POLICY "Public can read published courses" ON courses
  FOR SELECT USING (published = TRUE);

-- Authors can CRUD their own courses
CREATE POLICY "Authors can insert own courses" ON courses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authors can update own courses" ON courses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Authors can delete own courses" ON courses
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Authors can read own courses" ON courses
  FOR SELECT USING (auth.uid() = user_id);

-- COURSE CHAPTERS POLICIES
-- Anyone can read chapters of published courses
CREATE POLICY "Public can read chapters of published courses" ON course_chapters
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = course_chapters.course_id 
      AND courses.published = TRUE
    )
  );

-- Authors can manage chapters of their courses
CREATE POLICY "Authors can manage own course chapters" ON course_chapters
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = course_chapters.course_id 
      AND courses.user_id = auth.uid()
    )
  );

-- USER PROGRESS POLICIES
-- Users can only access their own progress
CREATE POLICY "Users can read own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- TOPICS POLICIES
-- Anyone can read topics
CREATE POLICY "Public can read topics" ON topics
  FOR SELECT USING (TRUE);

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-updating updated_at
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SEED DATA (Optional - uncomment to add)
-- =============================================

-- Insert default topics
INSERT INTO topics (name, icon) VALUES
  ('Android', '📱'),
  ('iOS', '🍎'),
  ('AI Engineering', '🤖'),
  ('Firebase', '🔥'),
  ('Machine Learning', '🧠'),
  ('Performance', '⚡'),
  ('Architecture', '🏗️'),
  ('Career', '🎓')
ON CONFLICT (name) DO NOTHING;
