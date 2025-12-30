-- PHASE 2: CONTENT (Student Notes Upload)

-- 1. Notes Table
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    subject TEXT NOT NULL,
    category TEXT CHECK (category IN ('Anatomy', 'Physiology', 'Biochemistry', 'Pathology', 'Pharmacology', 'Microbiology', 'Medicine', 'Surgery', 'Other')) DEFAULT 'Other',
    file_url TEXT NOT NULL,
    file_path TEXT NOT NULL, -- Storage path
    preview_image_url TEXT, -- Optional thumbnail
    uploader_id UUID REFERENCES auth.users(id) NOT NULL,
    author_name TEXT, -- Denormalized for simpler display
    status TEXT CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'published')) DEFAULT 'pending',
    views INT DEFAULT 0,
    downloads INT DEFAULT 0,
    admin_feedback TEXT, -- Rejection reason
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Notes
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Public can read ONLY published notes
CREATE POLICY "Allow public read published" ON public.notes
    FOR SELECT USING (status = 'published');

-- Authenticated Users can insert (upload) notes
CREATE POLICY "Allow authenticated upload" ON public.notes
    FOR INSERT WITH CHECK (auth.uid() = uploader_id);

-- Users can see their own notes (even if pending/rejected)
CREATE POLICY "Allow individual read own" ON public.notes
    FOR SELECT USING (auth.uid() = uploader_id);

-- Admins can do everything
CREATE POLICY "Allow admin all notes" ON public.notes
    FOR ALL USING (
        auth.jwt() ->> 'email' = 'admin@meddot.com' OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- 2. Storage Buckets (Execute this in SQL Editor or Storage UI)
-- Note: SQL to create buckets is specific to Supabase extensions, standard is via UI usually.
-- We will assume bucket 'notes_documents' exists.

-- Storage Policy Helpers (SQL representation for reference)
-- Policy: "Public Read" -> bucket_id = 'notes_documents'
-- Policy: "Auth Upload" -> bucket_id = 'notes_documents' AND auth.role() = 'authenticated'
