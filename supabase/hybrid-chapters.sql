-- =============================================
-- Hybrid Chapters Migration
-- Allows course chapters to be either:
-- 1. Linked to an existing article (article_id)
-- 2. Standalone with their own content (content field)
-- =============================================

-- Step 1: Make article_id nullable (for standalone chapters)
ALTER TABLE course_chapters 
  ALTER COLUMN article_id DROP NOT NULL;

-- Step 2: Add content column for standalone chapters
ALTER TABLE course_chapters 
  ADD COLUMN IF NOT EXISTS content TEXT;

-- Step 3: Add description column for standalone chapters
ALTER TABLE course_chapters 
  ADD COLUMN IF NOT EXISTS description TEXT;

-- Step 4: Add check constraint to ensure either article_id OR content is provided
-- (A chapter must have content from somewhere)
ALTER TABLE course_chapters 
  ADD CONSTRAINT chapter_has_content 
  CHECK (article_id IS NOT NULL OR content IS NOT NULL);

-- Step 5: Update RLS policy to allow reading standalone chapters
-- (Existing policy should still work since it checks course.published)

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'course_chapters';
