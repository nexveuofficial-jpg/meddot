-- FEATURE 2: ASK SENIOR (Q&A System)

-- Questions Table
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    subject TEXT DEFAULT 'General',
    tags TEXT[], -- Array of strings e.g. ['anatomy', 'exam-prep']
    asked_by UUID REFERENCES auth.users(id) NOT NULL,
    author_name TEXT, -- Denormalized for display
    views INT DEFAULT 0,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Questions
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Allow public read questions" ON public.questions
    FOR SELECT USING (true);

-- Authenticated users can ask questions
CREATE POLICY "Allow authenticated insert questions" ON public.questions
    FOR INSERT WITH CHECK (auth.uid() = asked_by);

-- Authors can update their own questions (e.g. mark resolved)
CREATE POLICY "Allow author update questions" ON public.questions
    FOR UPDATE USING (auth.uid() = asked_by);


-- Answers Table
CREATE TABLE IF NOT EXISTS public.answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
    responder_id UUID REFERENCES auth.users(id) NOT NULL,
    responder_name TEXT, -- Denormalized
    responder_role TEXT DEFAULT 'senior', -- Store role at time of answer
    body TEXT NOT NULL,
    is_accepted BOOLEAN DEFAULT FALSE,
    upvotes INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Answers
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Allow public read answers" ON public.answers
    FOR SELECT USING (true);

-- RESTRICTED INSERT: Only Seniors and Admins can answer
-- This relies on the 'profiles' table having a 'role' column.
CREATE POLICY "Allow senior/admin answer" ON public.answers
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('senior', 'admin')
        )
    );

-- Seniors can edit their own answers
CREATE POLICY "Allow author update answers" ON public.answers
    FOR UPDATE USING (auth.uid() = responder_id);

-- Upvotes Table (Simple tracking to prevent double votes)
CREATE TABLE IF NOT EXISTS public.answer_upvotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    answer_id UUID REFERENCES public.answers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    UNIQUE(answer_id, user_id)
);

ALTER TABLE public.answer_upvotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read upvotes" ON public.answer_upvotes FOR SELECT USING (true);
CREATE POLICY "Allow authenticated vote" ON public.answer_upvotes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow authenticated unvote" ON public.answer_upvotes FOR DELETE USING (auth.uid() = user_id);
