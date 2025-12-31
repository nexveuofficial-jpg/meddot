-- Grant Admin Access to pushprajmehta26@gmail.com
-- Run this in your Supabase SQL Editor

-- 1. Update the profile role to 'admin'
UPDATE public.profiles
SET role = 'admin'
WHERE id = (
    SELECT id FROM auth.users WHERE email = 'pushprajmehta26@gmail.com'
);

-- 2. Verify the change (this should return one row with role 'admin')
SELECT * FROM public.profiles 
WHERE id = (
    SELECT id FROM auth.users WHERE email = 'pushprajmehta26@gmail.com'
);
