-- FIX FOR: value in column "slug" violates not-null constraint
-- Run this small script to update the function.

CREATE OR REPLACE FUNCTION get_or_create_dm_room(other_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  room_id uuid;
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  -- Check if a DM room already exists between these two
  SELECT id INTO room_id
  FROM chat_rooms
  WHERE type = 'dm' 
  AND participants @> ARRAY[current_user_id, other_user_id]
  AND participants @> ARRAY[other_user_id, current_user_id]
  LIMIT 1;

  IF room_id IS NOT NULL THEN
    RETURN room_id;
  END IF;

  -- Create new DM room
  -- generating a unique slug helps avoid the not-null constraint error
  INSERT INTO chat_rooms (name, slug, type, participants, is_active)
  VALUES ('DM', 'dm-' || gen_random_uuid(), 'dm', ARRAY[current_user_id, other_user_id], true)
  RETURNING id INTO room_id;

  RETURN room_id;
END;
$$;
