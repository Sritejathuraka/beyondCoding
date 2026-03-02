-- =============================================
-- Newsletter & Subscribers Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- =============================================
-- SUBSCRIBERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  verified BOOLEAN DEFAULT FALSE,
  verification_token UUID DEFAULT uuid_generate_v4(),
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_verified ON subscribers(verified);

-- Enable RLS
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to subscribe (insert)
CREATE POLICY "Anyone can subscribe" ON subscribers
  FOR INSERT WITH CHECK (true);

-- Policy: Only admins can read subscribers
CREATE POLICY "Admins can read subscribers" ON subscribers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Policy: Allow unsubscribe via token
CREATE POLICY "Users can unsubscribe via email" ON subscribers
  FOR UPDATE USING (true)
  WITH CHECK (true);

-- =============================================
-- NOTIFICATION LOG TABLE
-- Track sent notifications to prevent duplicates
-- =============================================
CREATE TABLE IF NOT EXISTS notification_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type TEXT NOT NULL, -- 'article' or 'course'
  content_id UUID NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  subscriber_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' -- 'pending', 'sent', 'failed'
);

-- Prevent duplicate notifications
CREATE UNIQUE INDEX IF NOT EXISTS idx_notification_content 
  ON notification_log(content_type, content_id);

-- Enable RLS
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write
CREATE POLICY "Admins can manage notification log" ON notification_log
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- =============================================
-- FUNCTION: Get active subscribers count
-- =============================================
CREATE OR REPLACE FUNCTION get_subscriber_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) FROM subscribers 
    WHERE verified = TRUE 
    AND unsubscribed_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
