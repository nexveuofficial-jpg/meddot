-- Enable Uploads Filter
UPDATE public.feature_flags
SET is_enabled = true
WHERE key = 'enable_uploads';

-- Ensure Admin User exists and has role
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@meddot.com';

-- Seed a test note if none exist
INSERT INTO public.notes (title, subject, category, description, status, author_role, uploader_id, created_at)
SELECT 'System Start Guide', 'General', 'Medicine', 'Welcome to Meddot!', 'approved', 'admin', id, NOW()
FROM auth.users WHERE email = 'admin@meddot.com'
AND NOT EXISTS (SELECT 1 FROM public.notes WHERE title = 'System Start Guide');
