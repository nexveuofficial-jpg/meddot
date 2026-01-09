-- POLICY: Admins can DELETE questions
-- First, ensure RLS is enabled on questions (it likely is, but good to be safe)
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can delete questions" ON public.questions;
CREATE POLICY "Admins can delete questions" ON public.questions
FOR DELETE
USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
);

-- POLICY: Seniors can UPDATE their own answers
DROP POLICY IF EXISTS "Seniors can update own answers" ON public.answers;
CREATE POLICY "Seniors can update own answers" ON public.answers
FOR UPDATE
USING (
  auth.uid() = author_id
)
WITH CHECK (
  auth.uid() = author_id
);

-- POLICY: Seniors can DELETE their own answers, Admins can DELETE any
DROP POLICY IF EXISTS "Seniors/Admins can delete answers" ON public.answers;
CREATE POLICY "Seniors/Admins can delete answers" ON public.answers
FOR DELETE
USING (
  auth.uid() = author_id 
  OR 
  auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
);
