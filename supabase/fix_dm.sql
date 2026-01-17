-- FIX: Add missing DM support to 'chat_rooms' and create RPC function

-- 1. Add 'type' and 'participants' columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_rooms' AND column_name = 'type') THEN
        ALTER TABLE public.chat_rooms ADD COLUMN type TEXT DEFAULT 'group';
        -- Optional: Add check constraint if you want to strictly enforce types, but 'text' is flexible
        -- ALTER TABLE public.chat_rooms ADD CONSTRAINT check_chat_type CHECK (type IN ('group', 'dm'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_rooms' AND column_name = 'participants') THEN
        ALTER TABLE public.chat_rooms ADD COLUMN participants UUID[] DEFAULT '{}';
    END IF;
    
    -- Add last_message_at for sorting
     IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_rooms' AND column_name = 'last_message_at') THEN
        ALTER TABLE public.chat_rooms ADD COLUMN last_message_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- 2. Create Index for faster array searching (participants)
CREATE INDEX IF NOT EXISTS idx_chat_rooms_participants ON public.chat_rooms USING GIN (participants);


-- 3. Create/Replace RPC Function: get_or_create_dm_room
-- This function finds an existing DM room between two users or creates a new one.
CREATE OR REPLACE FUNCTION public.get_or_create_dm_room(other_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER -- Runs as owner (admin) to bypass RLS during creation if needed, or ensuring consistency
SET search_path = public
AS $$
DECLARE
    room_id UUID;
    current_user_id UUID;
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- 1. Try to find existing room
    -- We look for a room of type 'dm' that contains BOTH users.
    -- The @> operator checks if the array contains the other array.
    -- We construct an array of the two IDs.
    SELECT id INTO room_id
    FROM public.chat_rooms
    WHERE type = 'dm'
    AND participants @> ARRAY[current_user_id, other_user_id]
    AND array_length(participants, 1) = 2 -- Ensure exactly 2 participants (optional safety)
    LIMIT 1;

    -- 2. If found, return it
    IF room_id IS NOT NULL THEN
        RETURN room_id;
    END IF;

    -- 3. If not found, create new room
    INSERT INTO public.chat_rooms (name, subject, type, participants, is_active)
    VALUES (
        'Direct Message', -- Generic name, frontend hides this for DMs usually
        'DM',
        'dm',
        ARRAY[current_user_id, other_user_id],
        TRUE
    )
    RETURNING id INTO room_id;

    RETURN room_id;
END;
$$;
