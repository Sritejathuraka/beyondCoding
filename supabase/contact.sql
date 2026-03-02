-- =============================================
-- Contact Form Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_contact_created_at ON contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_read ON contact_submissions(read);

-- Enable RLS
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert (submit contact form)
CREATE POLICY "Anyone can submit contact form" ON contact_submissions
  FOR INSERT WITH CHECK (true);

-- Policy: Only authenticated admins can read submissions
-- (For now, allow select for service role only - you'll read via Supabase dashboard or Edge Function)
CREATE POLICY "Service role can read submissions" ON contact_submissions
  FOR SELECT USING (auth.role() = 'service_role');

-- =============================================
-- Email Notification Function (Optional)
-- This triggers an email when a new submission is created
-- =============================================

-- Create a function to notify on new submission
CREATE OR REPLACE FUNCTION notify_contact_submission()
RETURNS TRIGGER AS $$
BEGIN
  -- This uses pg_net extension to call Edge Function
  -- Make sure pg_net is enabled in your Supabase project
  PERFORM net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/notify-contact',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := jsonb_build_object(
      'id', NEW.id,
      'name', NEW.name,
      'email', NEW.email,
      'subject', NEW.subject,
      'message', NEW.message
    )
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Don't fail the insert if notification fails
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Uncomment this trigger after setting up the Edge Function and pg_net
-- CREATE TRIGGER on_contact_submission
--   AFTER INSERT ON contact_submissions
--   FOR EACH ROW
--   EXECUTE FUNCTION notify_contact_submission();
