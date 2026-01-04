-- MEDDOT V3 FINAL CONSOLIDATED SCHEMA CHECK & UPDATE
-- Run this in your Supabase SQL Editor to ensure all features work.

-- 1. PROFILES: Ensure 'username' and 'role' exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'username') THEN 
        ALTER TABLE profiles ADD COLUMN username text; 
        ALTER TABLE profiles ADD CONSTRAINT profiles_username_unique UNIQUE (username);
    END IF; 
    
    -- Backfill usernames if missing
    UPDATE profiles 
    SET username = COALESCE(full_name, split_part(email, '@', 1), 'user_' || substr(id::text, 1, 8))
    WHERE username IS NULL;
END $$;

-- 2. NOTES: Ensure 'views' column exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notes' AND column_name = 'views') THEN 
        ALTER TABLE notes ADD COLUMN views integer DEFAULT 0; 
    END IF; 
END $$;

-- RPC for incrementing views
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

-- 3. CHAT: Ensure DM support
-- Add 'reply_to_id', 'is_edited', 'image_url' to messages
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_messages' AND column_name = 'reply_to_id') THEN 
        ALTER TABLE chat_messages ADD COLUMN reply_to_id uuid REFERENCES chat_messages(id); 
    END IF; 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_messages' AND column_name = 'is_edited') THEN 
        ALTER TABLE chat_messages ADD COLUMN is_edited boolean DEFAULT false; 
    END IF; 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_messages' AND column_name = 'image_url') THEN 
        ALTER TABLE chat_messages ADD COLUMN image_url text; 
    END IF; 
END $$;

-- Update Chat Rooms for DMs (participants array)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_rooms' AND column_name = 'type') THEN 
        ALTER TABLE chat_rooms ADD COLUMN type text DEFAULT 'public'; 
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_rooms' AND column_name = 'participants') THEN 
        ALTER TABLE chat_rooms ADD COLUMN participants uuid[]; 
    END IF;
END $$;

-- Policies for chat_rooms (ensure authenticated users can see/create rooms they are in)
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN 
    DROP POLICY IF EXISTS "Users can view rooms they are in" ON chat_rooms;
    CREATE POLICY "Users can view rooms they are in"
    ON chat_rooms FOR SELECT
    USING (
        type = 'public' 
        OR (participants @> ARRAY[auth.uid()]) 
        OR auth.role() = 'service_role'
    );

    DROP POLICY IF EXISTS "Users can create DM rooms" ON chat_rooms;
    CREATE POLICY "Users can create DM rooms"
    ON chat_rooms FOR INSERT
    WITH CHECK (
        type = 'dm' 
        AND auth.role() = 'authenticated'
        AND participants @> ARRAY[auth.uid()]
    );
END $$;

-- RPC: Get or Create DM Room
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
  INSERT INTO chat_rooms (name, slug, type, participants, is_active)
  VALUES ('DM', 'dm-' || gen_random_uuid(), 'dm', ARRAY[current_user_id, other_user_id], true)
  RETURNING id INTO room_id;

  RETURN room_id;
END;
$$;

-- 4. FRIENDSHIPS: New Table
CREATE TABLE IF NOT EXISTS friendships (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    friend_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    status text DEFAULT 'pending', -- 'pending', 'accepted'
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, friend_id)
);

-- Access Policies for Friendships
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their friendships" ON friendships;
CREATE POLICY "Users can view their friendships" 
ON friendships FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = friend_id);

DROP POLICY IF EXISTS "Users can insert friendship requests" ON friendships;
CREATE POLICY "Users can insert friendship requests" 
ON friendships FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their friendships" ON friendships;
CREATE POLICY "Users can update their friendships" 
ON friendships FOR UPDATE 
USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- 5. STORAGE BUCKET POLICIES (chat-uploads, notes_documents)
-- Ensure policies exist (Run these even if bucket creation is manual)

-- Chat Uploads
CREATE POLICY "Public Chat Read" ON storage.objects FOR SELECT USING ( bucket_id = 'chat-uploads' );
CREATE POLICY "Auth Chat Upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'chat-uploads' AND auth.role() = 'authenticated' );

-- Notes Documents
CREATE POLICY "Public Notes Read" ON storage.objects FOR SELECT USING ( bucket_id = 'notes_documents' );
CREATE POLICY "Auth Notes Upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'notes_documents' AND auth.role() = 'authenticated' );

-- Finished
