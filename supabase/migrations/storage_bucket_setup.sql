-- Create a new storage bucket for answer attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('answer_attachments', 'answer_attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS (Commented out as this often causes permission errors and is enabled by default)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow public read access to the bucket
DROP POLICY IF EXISTS "Public can view answer attachments" ON storage.objects;
CREATE POLICY "Public can view answer attachments"
ON storage.objects FOR SELECT
USING ( bucket_id = 'answer_attachments' );

-- Allow authenticated users (Seniors/Admins mainly, but let's allow auth users generally or restricted)
-- Since only Seniors see the UI, broadly allowing auth users to upload to this bucket is acceptable for simplicity,
-- or we can restrict to Seniors. Let's restrict to Seniors/Admins to match the feature.
DROP POLICY IF EXISTS "Seniors can upload attachments" ON storage.objects;
CREATE POLICY "Seniors can upload attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'answer_attachments' 
  AND auth.role() = 'authenticated'
  AND (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'senior' OR role = 'admin'))
  )
);

-- Allow users to delete their own uploads (optional but good)
DROP POLICY IF EXISTS "Users can delete own attachments" ON storage.objects;
CREATE POLICY "Users can delete own attachments"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'answer_attachments'
    AND auth.uid() = owner
);
