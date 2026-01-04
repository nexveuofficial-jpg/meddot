-- Safe Schema Updates
-- 1. Add 'reply_to_id' (if not exists)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_messages' AND column_name = 'reply_to_id') THEN 
        ALTER TABLE chat_messages ADD COLUMN reply_to_id uuid REFERENCES chat_messages(id); 
    END IF; 
END $$;

-- 2. Add 'is_edited' (if not exists)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_messages' AND column_name = 'is_edited') THEN 
        ALTER TABLE chat_messages ADD COLUMN is_edited boolean DEFAULT false; 
    END IF; 
END $$;

-- 3. Update Policies (Safe drop & recreate)
DROP POLICY IF EXISTS "Users can delete own messages" ON chat_messages;
DROP POLICY IF EXISTS "Admins can delete any message" ON chat_messages;
DROP POLICY IF EXISTS "Allow delete for owners and admins" ON chat_messages; -- Drop the one we want to create too, just in case

CREATE POLICY "Allow delete for owners and admins"
ON chat_messages FOR DELETE
USING (
  auth.uid() = user_id 
  OR 
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'senior')
);

DROP POLICY IF EXISTS "Users can edit own messages" ON chat_messages;

CREATE POLICY "Users can edit own messages"
ON chat_messages FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Add 'image_url' (if not exists)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_messages' AND column_name = 'image_url') THEN 
        ALTER TABLE chat_messages ADD COLUMN image_url text; 
    END IF; 
END $$;

-- 5. Storage Policies (chat-uploads)
-- Note: Bucket creation must be done via Dashboard or Storage API usually, but policies can be SQL if bucket exists.
-- We assume user creates bucket 'chat-uploads' public.

-- Allow public read (Optional if bucket is public, but good for safety)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'chat-uploads' );

-- Allow authenticated upload
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'chat-uploads' AND auth.role() = 'authenticated' );

-- MAINTENANCE: Clear all chat history
-- Run this to delete all messages
-- TRUNCATE TABLE chat_messages;

-- 6. Notes Views
-- Add views column if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notes' AND column_name = 'views') THEN 
        ALTER TABLE notes ADD COLUMN views integer DEFAULT 0; 
    END IF; 
END $$;

-- RPC to increment views safely
CREATE OR REPLACE FUNCTION increment_note_views(note_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE notes
  SET views = views + 1
  WHERE id = note_id;
END;
$$;

-- 7. Username Feature
-- Add username column to profiles
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'username') THEN 
        ALTER TABLE profiles ADD COLUMN username text; 
        ALTER TABLE profiles ADD CONSTRAINT profiles_username_unique UNIQUE (username);
    END IF; 
END $$;

-- Populate existing usernames from full_name or email
UPDATE profiles 
SET username = COALESCE(full_name, split_part(email, '@', 1))
WHERE username IS NULL;

-- 8. Social Features: Friendships & DMs

-- Friendships Table
CREATE TABLE IF NOT EXISTS friendships (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    friend_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    status text DEFAULT 'pending', -- 'pending', 'accepted'
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, friend_id)
);

-- Policies for friendships
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own friendships" 
ON friendships FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can insert friendship requests" 
ON friendships FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own friendships" 
ON friendships FOR UPDATE 
USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Update Chat Rooms for DMs
-- Add 'type' and 'participants' to chat_rooms if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_rooms' AND column_name = 'type') THEN 
        ALTER TABLE chat_rooms ADD COLUMN type text DEFAULT 'public'; 
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_rooms' AND column_name = 'participants') THEN 
        ALTER TABLE chat_rooms ADD COLUMN participants uuid[]; 
    END IF;
END $$;

-- RPC to Create or Get DM Room
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

  -- If found, return it
  IF room_id IS NOT NULL THEN
    RETURN room_id;
  END IF;

  -- Else create new
  INSERT INTO chat_rooms (name, type, participants, is_active)
  VALUES ('DM', 'dm', ARRAY[current_user_id, other_user_id], true)
  RETURNING id INTO room_id;

  RETURN room_id;
END;
$$;
