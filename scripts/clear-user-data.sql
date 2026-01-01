-- ⚠️ DANGER: This script deletes ALL user data.
-- Run this in your Supabase SQL Editor.

BEGIN;

-- 1. Truncate User Content
TRUNCATE TABLE public.notes CASCADE;
TRUNCATE TABLE public.announcements CASCADE; 
TRUNCATE TABLE public.chat_messages CASCADE;
-- (Add other user tables here if they exist)

-- 2. Delete Profiles (Fixes FK constraint violation)
DELETE FROM public.profiles;

-- 3. Delete All Users (Cascades to public.profiles if configured, but manual delete is safer)
DELETE FROM auth.users;

COMMIT;

-- Verification
SELECT count(*) as user_count FROM auth.users;
SELECT count(*) as note_count FROM public.notes;
