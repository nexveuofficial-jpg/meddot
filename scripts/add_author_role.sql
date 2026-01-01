-- Add author_role column to notes table to identify official vs student notes
ALTER TABLE public.notes 
ADD COLUMN IF NOT EXISTS author_role text DEFAULT 'student';

-- Update existing notes to have 'student' role by default
UPDATE public.notes 
SET author_role = 'student' 
WHERE author_role IS NULL;

-- Optionally, if we know the admin's ID from previous steps, we could update their notes,
-- but for now assuming new uploads will handle it or manual update.
