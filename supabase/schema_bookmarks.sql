-- Bookmark Feature Schema
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    note_id UUID REFERENCES public.notes(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, note_id)
);

-- RLS
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- Users can view their own bookmarks
CREATE POLICY "Users can view own bookmarks" ON public.bookmarks
    FOR SELECT USING (auth.uid() = user_id);

-- Users can add bookmarks
CREATE POLICY "Users can add bookmarks" ON public.bookmarks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own bookmarks
CREATE POLICY "Users can delete own bookmarks" ON public.bookmarks
    FOR DELETE USING (auth.uid() = user_id);
