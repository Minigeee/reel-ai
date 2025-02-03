-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.videos enable row level security;
alter table public.comments enable row level security;
alter table public.video_likes enable row level security;
alter table public.follows enable row level security;

-- Utility functions for security checks
create or replace function public.is_video_owner(video_id uuid)
returns boolean
language sql security definer
as $$
    select exists (
        select 1 from public.videos
        where id = video_id and user_id = auth.uid()
    );
$$;

create or replace function public.is_comment_owner(comment_id uuid)
returns boolean
language sql security definer
as $$
    select exists (
        select 1 from public.comments
        where id = comment_id and user_id = auth.uid()
    );
$$;

-- Users policies
create policy "Users are viewable by everyone"
    on public.users for select
    using (true);

create policy "Users can update own profile"
    on public.users for update
    using (auth.uid() = id)
    with check (auth.uid() = id);

-- Videos policies
create policy "Videos are viewable by everyone when published"
    on public.videos for select
    using (status = 'published' or user_id = auth.uid());

create policy "Users can insert own videos"
    on public.videos for insert
    with check (auth.uid() = user_id);

create policy "Users can update own videos"
    on public.videos for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete own videos"
    on public.videos for delete
    using (auth.uid() = user_id);

-- Comments policies
create policy "Comments are viewable by everyone"
    on public.comments for select
    using (true);

create policy "Authenticated users can insert comments"
    on public.comments for insert
    with check (auth.uid() = user_id);

create policy "Users can update own comments"
    on public.comments for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete own comments"
    on public.comments for delete
    using (auth.uid() = user_id);

-- Video likes policies
create policy "Video likes are viewable by everyone"
    on public.video_likes for select
    using (true);

create policy "Authenticated users can insert likes"
    on public.video_likes for insert
    with check (auth.uid() = user_id);

create policy "Users can delete own likes"
    on public.video_likes for delete
    using (auth.uid() = user_id);

-- Follows policies
create policy "Follows are viewable by everyone"
    on public.follows for select
    using (true);

create policy "Authenticated users can follow others"
    on public.follows for insert
    with check (auth.uid() = follower_id);

create policy "Users can unfollow"
    on public.follows for delete
    using (auth.uid() = follower_id);

-- Create helper functions for common operations
create or replace function public.toggle_video_like(video_id uuid)
returns void
language plpgsql security definer
as $$
begin
    if exists (
        select 1 from public.video_likes
        where video_id = toggle_video_like.video_id
        and user_id = auth.uid()
    ) then
        delete from public.video_likes
        where video_id = toggle_video_like.video_id
        and user_id = auth.uid();
    else
        insert into public.video_likes (video_id, user_id)
        values (toggle_video_like.video_id, auth.uid());
    end if;
end;
$$;

create or replace function public.toggle_follow(target_user_id uuid)
returns void
language plpgsql security definer
as $$
begin
    if exists (
        select 1 from public.follows
        where follower_id = auth.uid()
        and following_id = target_user_id
    ) then
        delete from public.follows
        where follower_id = auth.uid()
        and following_id = target_user_id;
    else
        insert into public.follows (follower_id, following_id)
        values (auth.uid(), target_user_id);
    end if;
end;
$$; 