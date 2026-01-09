-- Fix Security Advisor Warnings: "Function Search Path Mutable"
-- This script sets the search_path to 'public' for SECURITY DEFINER functions.
-- This prevents malicious users from hijacking the function by creating objects in other schemas.

-- 1. handle_new_user (Auth Trigger)
-- Assuming zero arguments as it is a trigger function
ALTER FUNCTION public.handle_new_user() SET search_path = public;

-- 2. update_answer_count (Likely Trigger to update questions count)
-- Assuming zero arguments as it is likely a trigger function
DO $$
BEGIN
    -- Wrap in block to handle potential signature mismatch if it's not ()
    BEGIN
        ALTER FUNCTION public.update_answer_count() SET search_path = public;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not update update_answer_count() with no args. It might have a different signature or not exist.';
    END;
END $$;

-- 3. increment_note_views (RPC)
-- Signature: (note_id uuid)
ALTER FUNCTION public.increment_note_views(uuid) SET search_path = public;

-- 4. get_or_create_dm_room (RPC)
-- Signature: (other_user_id uuid)
ALTER FUNCTION public.get_or_create_dm_room(uuid) SET search_path = public;

-- Instructions:
-- Run this script in the Supabase SQL Editor.
-- Then go back to Security Advisor and click "Rerun linter" or wait for it to refresh.
