-- Fix User Deletion Issues (Corrected Column Names)
-- This script adds ON DELETE CASCADE to foreign keys so user deletion works.

-- 1. QUESTIONS (author_id)
DO $$
BEGIN
    -- Check if constraint exists, drop it
    ALTER TABLE public.questions DROP CONSTRAINT IF EXISTS questions_author_id_fkey;
    -- Re-add with CASCADE
    ALTER TABLE public.questions
    ADD CONSTRAINT questions_author_id_fkey
    FOREIGN KEY (author_id)
    REFERENCES public.profiles(id)
    ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Skipping questions: %', SQLERRM;
END $$;

-- 2. ANSWERS (author_id)
DO $$
BEGIN
    ALTER TABLE public.answers DROP CONSTRAINT IF EXISTS answers_author_id_fkey;
    ALTER TABLE public.answers
    ADD CONSTRAINT answers_author_id_fkey
    FOREIGN KEY (author_id)
    REFERENCES public.profiles(id)
    ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Skipping answers: %', SQLERRM;
END $$;

-- 3. CHAT MESSAGES (user_id)
DO $$
BEGIN
    ALTER TABLE public.chat_messages DROP CONSTRAINT IF EXISTS chat_messages_user_id_fkey;
    -- Note: chat_messages might reference auth.users(id) or public.profiles(id). 
    -- schema_phase3_chat.sql says: REFERENCES auth.users(id)
    ALTER TABLE public.chat_messages
    ADD CONSTRAINT chat_messages_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Skipping chat_messages: %', SQLERRM;
END $$;

-- 4. NOTES (uploader_id)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notes' AND column_name = 'uploader_id') THEN
        ALTER TABLE public.notes DROP CONSTRAINT IF EXISTS notes_uploader_id_fkey;
        -- Often named via auto-gen, let's try generic or specific
        -- If constraint name is unknown, it's safer to just ADD valid one if possible or try to drop guessed name
        -- schema_phase2.sql defines: uploader_id UUID REFERENCES auth.users(id)
        -- We will attempt to drop a likely name, then add our own.
        
        ALTER TABLE public.notes DROP CONSTRAINT IF EXISTS notes_user_id_fkey; -- Try common name
        
        ALTER TABLE public.notes
        ADD CONSTRAINT notes_uploader_id_fkey_cascade
        FOREIGN KEY (uploader_id)
        REFERENCES auth.users(id)
        ON DELETE CASCADE;
    END IF;
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Skipping notes: %', SQLERRM;
END $$;

-- 5. FRIENDSHIPS (If exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'friendships') THEN
        ALTER TABLE public.friendships DROP CONSTRAINT IF EXISTS friendships_user_id_fkey;
        ALTER TABLE public.friendships ADD CONSTRAINT friendships_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

        ALTER TABLE public.friendships DROP CONSTRAINT IF EXISTS friendships_friend_id_fkey;
        ALTER TABLE public.friendships ADD CONSTRAINT friendships_friend_id_fkey
        FOREIGN KEY (friend_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Skipping friendships: %', SQLERRM;
END $$;

-- 6. PROFILES (id)
DO $$
BEGIN
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
    ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_id_fkey
    FOREIGN KEY (id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Skipping profiles: %', SQLERRM;
END $$;
