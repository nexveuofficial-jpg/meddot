-- Run this in your Supabase SQL Editor to enable all features locally

-- 1. Enable all feature flags
INSERT INTO public.feature_flags (key, is_enabled, description)
VALUES 
    ('enable_chat', true, 'Enable global chat features'),
    ('enable_uploads', true, 'Enable note uploads'),
    ('enable_ask_senior', true, 'Enable Ask a Senior'),
    ('doctor_companion_enabled', true, 'Enable the Doctor Companion avatar')
ON CONFLICT (key) DO UPDATE SET is_enabled = true;

-- 2. Optional: Make the test user an Admin
UPDATE public.profiles
SET role = 'admin'
WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'student@meddot.com'
);

-- 3. Add author_role to notes for filtering
ALTER TABLE public.notes 
ADD COLUMN IF NOT EXISTS author_role text DEFAULT 'student';

-- Backfill existing
UPDATE public.notes 
SET author_role = 'student' 
WHERE author_role IS NULL;
