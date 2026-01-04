-- 1. Add Support for Replies
ALTER TABLE chat_messages 
ADD COLUMN reply_to_id uuid REFERENCES chat_messages(id);

-- 2. Add Support for Editing
ALTER TABLE chat_messages 
ADD COLUMN is_edited boolean DEFAULT false;

-- 3. Enable Admin/Senior Deletion (RLS Policy)
-- First, drop existing delete policy if it exists to avoid conflicts (optional/safe)
DROP POLICY IF EXISTS "Users can delete own messages" ON chat_messages;
DROP POLICY IF EXISTS "Admins can delete any message" ON chat_messages;

-- Create comprehensive delete policy
CREATE POLICY "Allow delete for owners and admins"
ON chat_messages FOR DELETE
USING (
  auth.uid() = user_id -- Owner
  OR 
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'senior') -- Admin/Senior
);

-- 4. Enable Update policy for Editing (Owner only usually)
CREATE POLICY "Users can edit own messages"
ON chat_messages FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
