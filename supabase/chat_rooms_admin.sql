-- ADMIN CHAT MANAGEMENT & ROLE RESTRICTION

-- 1. Add 'allowed_roles' column to chat_rooms
-- This array will store roles that can access the room (e.g. ['senior']).
-- If empty or null, the room is "public" (open to all students).
ALTER TABLE public.chat_rooms 
ADD COLUMN IF NOT EXISTS allowed_roles TEXT[] DEFAULT '{}';

-- 2. Update RLS for Chat Rooms

-- Allow Admins to do EVERYTHING (Create, Update, Delete)
CREATE POLICY "Allow admin manage rooms" ON public.chat_rooms
    FOR ALL USING (
        auth.jwt() ->> 'email' = 'admin@meddot.com' OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Update the "Read" policy to respect allowed_roles
DROP POLICY IF EXISTS "Allow public read rooms" ON public.chat_rooms;

CREATE POLICY "Allow public/role read rooms" ON public.chat_rooms
    FOR SELECT USING (
        -- Admin can see everything
        (auth.jwt() ->> 'email' = 'admin@meddot.com' OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
        OR
        -- Room is public (empty roles)
        (allowed_roles IS NULL OR allowed_roles = '{}')
        OR
        -- User has one of the allowed roles
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = ANY(public.chat_rooms.allowed_roles)
        )
    );

-- 3. Ensure Chat Messages inherit this security
-- (Technically RLS on messages checks 'true' right now, relying on UI to not show room. 
--  For strict security, we should check room access, but for this MVP asking admins, 
--  we'll stick to room visibility hiding as the primary barrier, adding a check here for safety.)

DROP POLICY IF EXISTS "Allow public read messages" ON public.chat_messages;

CREATE POLICY "Allow authorized read messages" ON public.chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat_rooms
            WHERE id = public.chat_messages.room_id
            AND (
                -- Same logic as above: Admin OR Public OR Role Match
                allowed_roles IS NULL OR allowed_roles = '{}' OR
                EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'admin' OR role = ANY(allowed_roles)))
            )
        )
    );
