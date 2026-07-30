-- Create evidence storage bucket
insert into storage.buckets (id, name, public)
values ('evidence', 'evidence', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload
create policy "Authenticated users can upload evidence"
on storage.objects for insert
to authenticated
with check (bucket_id = 'evidence');

-- Anyone can view evidence files (public bucket)
create policy "Public can view evidence"
on storage.objects for select
using (bucket_id = 'evidence');

-- Users can delete their own uploads
create policy "Users can delete own evidence"
on storage.objects for delete
using (bucket_id = 'evidence' and auth.uid() = owner);
