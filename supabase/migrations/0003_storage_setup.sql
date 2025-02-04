-- Create storage buckets for videos and thumbnails
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('videos', 'videos', true, 104857600, array[
    'video/mp4',
    'video/quicktime', 
    'video/x-m4v',
    'video/webm',
    'video/ogg',
    'video/x-matroska',
    'video/avi',
    'video/mpeg',
    'video/3gpp'
  ]),  -- 100MB limit
  ('thumbnails', 'thumbnails', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']); -- 5MB limit

-- Storage policies for videos bucket
create policy "Videos are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'videos' );

create policy "Authenticated users can upload videos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'videos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update their own videos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'videos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own videos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'videos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage policies for thumbnails bucket
create policy "Thumbnails are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'thumbnails' );

create policy "Authenticated users can upload thumbnails"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'thumbnails'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update their own thumbnails"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'thumbnails'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own thumbnails"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'thumbnails'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Trigger to automatically delete storage objects when video is deleted
create or replace function public.handle_video_deletion()
returns trigger as $$
begin
  -- Delete video file
  delete from storage.objects
  where bucket_id = 'videos'
  and (storage.foldername(name))[1] = old.user_id::text
  and name like '%' || old.id::text || '%';
  
  -- Delete thumbnail
  delete from storage.objects
  where bucket_id = 'thumbnails'
  and (storage.foldername(name))[1] = old.user_id::text
  and name like '%' || old.id::text || '%';
  
  return old;
end;
$$ language plpgsql security definer;

create trigger on_video_deleted
  after delete on public.videos
  for each row
  execute function public.handle_video_deletion(); 