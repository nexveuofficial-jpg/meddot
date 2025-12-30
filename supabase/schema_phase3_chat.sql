-- PHASE 3: ENGAGEMENT (Realtime Chat)

-- 1. Chat Rooms Table
CREATE TABLE IF NOT EXISTS public.chat_rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL, -- e.g. "Anatomy Dissection Hall"
    subject TEXT NOT NULL, -- e.g. "Anatomy"
    description TEXT,
    icon TEXT, -- Lucide icon name or emoji
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Chat Rooms
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Allow public read rooms" ON public.chat_rooms
    FOR SELECT USING (true);

-- Admin only modification
CREATE POLICY "Allow admin all rooms" ON public.chat_rooms
    FOR ALL USING (
        auth.jwt() ->> 'email' = 'admin@meddot.com' OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );


-- 2. Chat Messages Table
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    user_name TEXT, -- Denormalized for simpler list rendering
    role TEXT DEFAULT 'student', -- To show badges in chat
    content TEXT NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE, -- Soft delete
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Public read access (live chat needs fast reads)
CREATE POLICY "Allow public read messages" ON public.chat_messages
    FOR SELECT USING (true);

-- Authenticated users can post
CREATE POLICY "Allow authenticated post message" ON public.chat_messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own messages
CREATE POLICY "Allow author delete message" ON public.chat_messages
    FOR UPDATE USING (auth.uid() = user_id);


-- 3. Seed Default Rooms
INSERT INTO public.chat_rooms (name, subject, description, icon) VALUES
('Anatomy Hall', 'Anatomy', 'Discuss structures, dissections, and histology.', 'Bone'),
('Physiology Lab', 'Physiology', 'Mechanisms of body functions and systems.', 'Activity'),
('Biochem Bay', 'Biochemistry', 'Metabolism, enzymes, and molecular biology.', 'FlaskConical'),
('Pathology Center', 'Pathology', 'Disease mechanisms and lab findings.', 'Microscope'),
('Pharma Dispensary', 'Pharmacology', 'Drugs, kinetics, and dynamics.', 'Pill'),
('General Lounge', 'General', 'Chill vibes, non-academic discussions.', 'Coffee')
ON CONFLICT DO NOTHING;
