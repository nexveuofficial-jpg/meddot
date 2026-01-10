-- Make 'avatars' bucket public
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

-- Drop existing policies to avoid conflicts
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Authenticated Uploads" on storage.objects;
drop policy if exists "Owner Update" on storage.objects;

-- Allow public access to avatars
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- Allow authenticated uploads
create policy "Authenticated Uploads"
  on storage.objects for insert
  with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );

-- Allow users to update their own avatars
create policy "Owner Update"
  on storage.objects for update
  using ( bucket_id = 'avatars' and auth.uid() = owner );
