-- PHASE 1: FOUNDATION (Feature Flags & Announcements)

-- 1. Feature Flags Table
CREATE TABLE IF NOT EXISTS public.feature_flags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    is_enabled BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Feature Flags
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Everyone can read flags (so the app knows what to show)
CREATE POLICY "Allow public read access" ON public.feature_flags
    FOR SELECT USING (true);

-- Only Admins can update flags
CREATE POLICY "Allow admin update access" ON public.feature_flags
    FOR UPDATE USING (
        auth.jwt() ->> 'email' = 'admin@meddot.com' -- Simple check for MVP, or use a proper role claim
        OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Seed Default Flags
INSERT INTO public.feature_flags (key, is_enabled, description) VALUES
    ('enable_chat', false, 'Enable subject-wise chat rooms'),
    ('enable_ask_senior', false, 'Enable Senior Q&A section'),
    ('enable_uploads', true, 'Allow students to upload notes'),
    ('enable_private_messages', false, 'Enable 1-to-1 private messaging'),
    ('enable_focus_rooms', false, 'Enable public focus/pomodoro rooms')
ON CONFLICT (key) DO NOTHING;


-- 2. Announcements Table
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    priority TEXT CHECK (priority IN ('normal', 'urgent')) DEFAULT 'normal',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Announcements
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Everyone can read active announcements
CREATE POLICY "Allow public read active" ON public.announcements
    FOR SELECT USING (is_active = true);

-- Admins can do everything
CREATE POLICY "Allow admin all" ON public.announcements
    FOR ALL USING (
        auth.jwt() ->> 'email' = 'admin@meddot.com' OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
