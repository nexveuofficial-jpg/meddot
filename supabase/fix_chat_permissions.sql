-- Allow authenticated users to create DM rooms
-- This is a fallback permission in case the RPC function is unavailable.

-- 1. Enable RLS on chat_rooms (should already be on)
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;

-- 2. Policy: Allow users to creating rooms where they are a participant and type is 'dm'
CREATE POLICY "Allow users to create DM rooms" ON public.chat_rooms
    FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated' AND
        type = 'dm' AND
        auth.uid() = ANY(participants)
    );

-- 3. Policy: Allow users to see rooms they are part of
-- (This likely exists, but ensuring it covers the new 'dm' type logic)
CREATE POLICY "Allow users to view their rooms" ON public.chat_rooms
    FOR SELECT
    USING (
        auth.uid() = ANY(participants)
    );

-- 4. Grant access to authenticated users if strict mode is on
GRANT ALL ON public.chat_rooms TO authenticated;
