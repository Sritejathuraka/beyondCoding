-- =============================================
-- Admin Role Migration
-- Run this AFTER schema.sql in your Supabase SQL Editor
-- =============================================

-- =============================================
-- PROFILES TABLE (with role support)
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'author')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for role lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- =============================================
-- FUNCTION: Check if user is admin
-- =============================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- FUNCTION: Check if user is admin or author
-- =============================================
CREATE OR REPLACE FUNCTION can_write()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'author')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Set admin role for specific email, otherwise default to 'user'
  IF NEW.email = 'sriteja.245@gmail.com' THEN
    user_role := 'admin';
  ELSE
    user_role := 'user';
  END IF;

  INSERT INTO profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =============================================
-- UPDATE ARTICLE POLICIES (Admin-only write)
-- =============================================

-- Drop old policies
DROP POLICY IF EXISTS "Authors can insert own articles" ON articles;
DROP POLICY IF EXISTS "Authors can update own articles" ON articles;
DROP POLICY IF EXISTS "Authors can delete own articles" ON articles;

-- New policies: Only admins/authors can write
CREATE POLICY "Admins can insert articles" ON articles
  FOR INSERT WITH CHECK (can_write());

CREATE POLICY "Admins can update articles" ON articles
  FOR UPDATE USING (can_write());

CREATE POLICY "Admins can delete articles" ON articles
  FOR DELETE USING (can_write());

-- =============================================
-- UPDATE COURSE POLICIES (Admin-only write)
-- =============================================

-- Drop old policies
DROP POLICY IF EXISTS "Authors can insert own courses" ON courses;
DROP POLICY IF EXISTS "Authors can update own courses" ON courses;
DROP POLICY IF EXISTS "Authors can delete own courses" ON courses;

-- New policies: Only admins/authors can write
CREATE POLICY "Admins can insert courses" ON courses
  FOR INSERT WITH CHECK (can_write());

CREATE POLICY "Admins can update courses" ON courses
  FOR UPDATE USING (can_write());

CREATE POLICY "Admins can delete courses" ON courses
  FOR DELETE USING (can_write());

-- =============================================
-- UPDATE COURSE CHAPTERS POLICIES
-- =============================================

-- Drop old policy
DROP POLICY IF EXISTS "Authors can manage own course chapters" ON course_chapters;

-- New policy: Only admins can manage chapters
CREATE POLICY "Admins can manage course chapters" ON course_chapters
  FOR ALL USING (can_write());

-- =============================================
-- ADMIN USER
-- =============================================

-- sriteja.245@gmail.com is automatically set as admin on signup (see handle_new_user function above)

-- To manually promote another user to admin, run:
-- UPDATE profiles SET role = 'admin' WHERE email = 'other-email@example.com';
