-- FIX: Add missing columns to existing 'notes' table
-- Run this if you encountered errors about missing columns (e.g. uploader_id)

-- 1. Add uploader_id if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notes' AND column_name = 'uploader_id') THEN
        ALTER TABLE public.notes ADD COLUMN uploader_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- 2. Add other potential missing columns
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notes' AND column_name = 'status') THEN
        ALTER TABLE public.notes ADD COLUMN status TEXT CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'published')) DEFAULT 'pending';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notes' AND column_name = 'file_url') THEN
        ALTER TABLE public.notes ADD COLUMN file_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notes' AND column_name = 'file_path') THEN
        ALTER TABLE public.notes ADD COLUMN file_path TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notes' AND column_name = 'author_name') THEN
        ALTER TABLE public.notes ADD COLUMN author_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notes' AND column_name = 'category') THEN
        ALTER TABLE public.notes ADD COLUMN category TEXT DEFAULT 'Other';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notes' AND column_name = 'admin_feedback') THEN
        ALTER TABLE public.notes ADD COLUMN admin_feedback TEXT;
    END IF;
END $$;

-- 3. Now re-apply RLS policies (drop first to avoid conflicts)
DROP POLICY IF EXISTS "Allow public read published" ON public.notes;
DROP POLICY IF EXISTS "Allow authenticated upload" ON public.notes;
DROP POLICY IF EXISTS "Allow individual read own" ON public.notes;
DROP POLICY IF EXISTS "Allow admin all notes" ON public.notes;

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read published" ON public.notes
    FOR SELECT USING (status = 'published');

CREATE POLICY "Allow authenticated upload" ON public.notes
    FOR INSERT WITH CHECK (auth.uid() = uploader_id);

CREATE POLICY "Allow individual read own" ON public.notes
    FOR SELECT USING (auth.uid() = uploader_id);

CREATE POLICY "Allow admin all notes" ON public.notes
    FOR ALL USING (
        auth.jwt() ->> 'email' = 'admin@meddot.com' OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
