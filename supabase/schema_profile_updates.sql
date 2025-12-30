-- FEATURE: USER PROFILE SETTINGS

-- 1. Extend Profiles Table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'college') THEN
        ALTER TABLE public.profiles ADD COLUMN college TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'year_of_study') THEN
        ALTER TABLE public.profiles ADD COLUMN year_of_study TEXT; -- '1st Year', 'Intern', etc.
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'bio') THEN
        ALTER TABLE public.profiles ADD COLUMN bio TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
    END IF;
    
    -- Add updated_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- 2. Storage for Avatars
-- (This SQL just documents user intent, actual bucket creation is usually UI or extension based)
-- Bucket Name: 'avatars'
-- Policy: Public Read, Auth Upload/Update User's own file.

-- 3. RLS Check (Profiles should be updatable by owner)
-- Ensure this policy exists:
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);
