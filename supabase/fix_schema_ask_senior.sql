-- FIX: Add missing columns to existing 'questions' and 'answers' tables
-- Run this if you encountered errors about missing columns (e.g. asked_by)

-- 1. Fix Questions Table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'asked_by') THEN
        ALTER TABLE public.questions ADD COLUMN asked_by UUID REFERENCES auth.users(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'author_name') THEN
        ALTER TABLE public.questions ADD COLUMN author_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'subject') THEN
        ALTER TABLE public.questions ADD COLUMN subject TEXT DEFAULT 'General';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'tags') THEN
        ALTER TABLE public.questions ADD COLUMN tags TEXT[];
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'is_resolved') THEN
        ALTER TABLE public.questions ADD COLUMN is_resolved BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 2. Fix Answers Table (if it exists)
DO $$
BEGIN
    -- Check if table exists first prevents errors in strict modes, but usually ALTER works FINE if table exists. 
    -- If table doesn't exist, these blocks won't fail strictly if we wrap in DO.
       
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'answers') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'answers' AND column_name = 'responder_id') THEN
            ALTER TABLE public.answers ADD COLUMN responder_id UUID REFERENCES auth.users(id);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'answers' AND column_name = 'responder_role') THEN
            ALTER TABLE public.answers ADD COLUMN responder_role TEXT DEFAULT 'senior';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'answers' AND column_name = 'responder_name') THEN
            ALTER TABLE public.answers ADD COLUMN responder_name TEXT;
        END IF;
         IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'answers' AND column_name = 'is_accepted') THEN
            ALTER TABLE public.answers ADD COLUMN is_accepted BOOLEAN DEFAULT FALSE;
        END IF;
    END IF;
END $$;

-- 3. Re-apply RLS Policies for Questions
DROP POLICY IF EXISTS "Allow public read questions" ON public.questions;
DROP POLICY IF EXISTS "Allow authenticated insert questions" ON public.questions;
DROP POLICY IF EXISTS "Allow author update questions" ON public.questions;

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read questions" ON public.questions
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert questions" ON public.questions
    FOR INSERT WITH CHECK (auth.uid() = asked_by);

CREATE POLICY "Allow author update questions" ON public.questions
    FOR UPDATE USING (auth.uid() = asked_by);

-- 4. Re-apply RLS Policies for Answers (Ensure table exists first or this part fails if table missing)
CREATE TABLE IF NOT EXISTS public.answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
    responder_id UUID REFERENCES auth.users(id) NOT NULL,
    responder_name TEXT,
    responder_role TEXT DEFAULT 'senior',
    body TEXT NOT NULL,
    is_accepted BOOLEAN DEFAULT FALSE,
    upvotes INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP POLICY IF EXISTS "Allow public read answers" ON public.answers;
DROP POLICY IF EXISTS "Allow senior/admin answer" ON public.answers;
DROP POLICY IF EXISTS "Allow author update answers" ON public.answers;

ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read answers" ON public.answers
    FOR SELECT USING (true);

CREATE POLICY "Allow senior/admin answer" ON public.answers
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('senior', 'admin')
        )
    );

CREATE POLICY "Allow author update answers" ON public.answers
    FOR UPDATE USING (auth.uid() = responder_id);
