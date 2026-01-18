-- Fix Message Sending Permissions

-- 1. Ensure RLS is enabled
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- 2. Drop potential restrictive policies to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated post message" ON public.chat_messages;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.chat_messages;

-- 3. Create a clean, permissive insert policy for authenticated users
-- The only requirement is that you are inserting as yourself (user_id = auth.uid())
CREATE POLICY "Allow authenticated insert" ON public.chat_messages
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 4. Enable Read Access (public)
DROP POLICY IF EXISTS "Allow public read messages" ON public.chat_messages;
CREATE POLICY "Allow public read messages" ON public.chat_messages
    FOR SELECT
    USING (true);

-- 5. Grant permissions to roles (Critical if missing)
GRANT ALL ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;
