-- HELPER: Make a User an Admin
-- Replace 'YOUR_EMAIL_HERE' with your actual email address
-- Run this in the Supabase SQL Editor

UPDATE public.profiles
SET role = 'admin'
WHERE id = (
    SELECT id FROM auth.users WHERE email = 'nexveuofficial@gmail.com'
);

-- Verify the change
SELECT * FROM public.profiles WHERE role = 'admin';
