-- Enable RLS on feature_flags
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone
CREATE POLICY "Allow public read access" ON feature_flags
FOR SELECT USING (true);

-- Allow full access to admins
CREATE POLICY "Allow admin full access" ON feature_flags
FOR ALL USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- Note: You might need to drop existing policies first if they conflict
-- DROP POLICY IF EXISTS "Allow public read access" ON feature_flags;
-- DROP POLICY IF EXISTS "Allow admin full access" ON feature_flags;
