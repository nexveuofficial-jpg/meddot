-- Add category column to questions
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';
-- Note: Check constraint avoided for flexibility, or can be added if strict enum needed.

-- Add upvotes and is_accepted to answers
ALTER TABLE public.answers ADD COLUMN IF NOT EXISTS upvotes INT DEFAULT 0;
ALTER TABLE public.answers ADD COLUMN IF NOT EXISTS is_accepted BOOLEAN DEFAULT FALSE;

-- Create table to track user upvotes on answers to prevent duplicates
CREATE TABLE IF NOT EXISTS public.answer_upvotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  answer_id UUID REFERENCES public.answers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, answer_id)
);

-- RLS for answer_upvotes
ALTER TABLE public.answer_upvotes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid errors on re-run
DROP POLICY IF EXISTS "Users can insert their own upvotes" ON public.answer_upvotes;
DROP POLICY IF EXISTS "Users can delete their own upvotes" ON public.answer_upvotes;
DROP POLICY IF EXISTS "Everyone can read upvotes" ON public.answer_upvotes;

CREATE POLICY "Users can insert their own upvotes" ON public.answer_upvotes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own upvotes" ON public.answer_upvotes
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Everyone can read upvotes" ON public.answer_upvotes
  FOR SELECT USING (true);
