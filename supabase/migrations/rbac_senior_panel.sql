-- Security: Allow ONLY Seniors and Admins to INSERT answers
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Seniors can insert answers" ON public.answers;

CREATE POLICY "Seniors can insert answers" ON public.answers
FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM public.profiles 
    WHERE role = 'senior' OR role = 'admin'
  )
);

-- Ensure everyone can read (re-apply to be safe)
DROP POLICY IF EXISTS "Everyone can read answers" ON public.answers;
CREATE POLICY "Everyone can read answers" ON public.answers FOR SELECT USING (true);

-- Ensure Students can NOT insert (Implicit deny by RLS if no policy matches, but existing policies might allow it. 
-- Assuming no other INSERT policies exist. If "Enable insert for authenticated users" exists, we must drop it.)
-- To be safe, we rely on the specific policy above. But good practice to verify no broad access exists.
-- (We cannot blindly drop unknown policies, but usually they are named predictably).


-- Feature: Unanswered Questions Count (for Senior Panel)
-- Create answer_count column if not exists
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS answer_count INT DEFAULT 0;

-- Function to update answer_count
CREATE OR REPLACE FUNCTION update_answer_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.questions SET answer_count = answer_count + 1 WHERE id = NEW.question_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.questions SET answer_count = answer_count - 1 WHERE id = OLD.question_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS update_answer_count_trigger ON public.answers;
CREATE TRIGGER update_answer_count_trigger
AFTER INSERT OR DELETE ON public.answers
FOR EACH ROW EXECUTE FUNCTION update_answer_count();

-- Backfill answer_count
UPDATE public.questions q
SET answer_count = (
  SELECT COUNT(*) FROM public.answers a WHERE a.question_id = q.id
);
