-- FIX: Add missing columns to 'chat_rooms' and 'chat_messages'
-- Run this if you saw errors like 'column "subject" does not exist' or 'null value in column "slug"'

-- 1. Fix Chat Rooms Table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_rooms' AND column_name = 'subject') THEN
        ALTER TABLE public.chat_rooms ADD COLUMN subject TEXT DEFAULT 'General';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_rooms' AND column_name = 'description') THEN
        ALTER TABLE public.chat_rooms ADD COLUMN description TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_rooms' AND column_name = 'icon') THEN
        ALTER TABLE public.chat_rooms ADD COLUMN icon TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_rooms' AND column_name = 'is_active') THEN
        ALTER TABLE public.chat_rooms ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
    
    -- Ensure slug exists (it seems it does, but just in case for fresh DBs)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_rooms' AND column_name = 'slug') THEN
        ALTER TABLE public.chat_rooms ADD COLUMN slug TEXT;
    END IF;
END $$;

-- 2. Fix Chat Messages Table (Safe check)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_messages') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_messages' AND column_name = 'user_name') THEN
            ALTER TABLE public.chat_messages ADD COLUMN user_name TEXT;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_messages' AND column_name = 'role') THEN
            ALTER TABLE public.chat_messages ADD COLUMN role TEXT DEFAULT 'student';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_messages' AND column_name = 'is_deleted') THEN
            ALTER TABLE public.chat_messages ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
        END IF;
    END IF;
END $$;

-- 3. Re-seed Rooms WITH SLUG
-- Warning: The existing table has 'slug' NOT NULL, so we MUST provide it.

INSERT INTO public.chat_rooms (name, slug, subject, description, icon)
SELECT 'Anatomy Hall', 'anatomy-hall', 'Anatomy', 'Discuss structures, dissections, and histology.', 'Bone'
WHERE NOT EXISTS (SELECT 1 FROM public.chat_rooms WHERE name = 'Anatomy Hall');

INSERT INTO public.chat_rooms (name, slug, subject, description, icon)
SELECT 'Physiology Lab', 'physiology-lab', 'Physiology', 'Mechanisms of body functions and systems.', 'Activity'
WHERE NOT EXISTS (SELECT 1 FROM public.chat_rooms WHERE name = 'Physiology Lab');

INSERT INTO public.chat_rooms (name, slug, subject, description, icon)
SELECT 'Biochem Bay', 'biochem-bay', 'Biochemistry', 'Metabolism, enzymes, and molecular biology.', 'FlaskConical'
WHERE NOT EXISTS (SELECT 1 FROM public.chat_rooms WHERE name = 'Biochem Bay');

INSERT INTO public.chat_rooms (name, slug, subject, description, icon)
SELECT 'Pathology Center', 'pathology-center', 'Pathology', 'Disease mechanisms and lab findings.', 'Microscope'
WHERE NOT EXISTS (SELECT 1 FROM public.chat_rooms WHERE name = 'Pathology Center');

INSERT INTO public.chat_rooms (name, slug, subject, description, icon)
SELECT 'Pharma Dispensary', 'pharma-dispensary', 'Pharmacology', 'Drugs, kinetics, and dynamics.', 'Pill'
WHERE NOT EXISTS (SELECT 1 FROM public.chat_rooms WHERE name = 'Pharma Dispensary');

INSERT INTO public.chat_rooms (name, slug, subject, description, icon)
SELECT 'General Lounge', 'general-lounge', 'General', 'Chill vibes, non-academic discussions.', 'Coffee'
WHERE NOT EXISTS (SELECT 1 FROM public.chat_rooms WHERE name = 'General Lounge');
