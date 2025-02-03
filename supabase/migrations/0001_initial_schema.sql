-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Utility functions for performance and security
create or replace function public.get_current_user_id()
returns uuid
language sql stable
as $$
  select auth.uid();
$$;

-- Enum types for better data consistency
create type video_status as enum ('draft', 'published', 'processing', 'failed');
create type overlay_type as enum ('text', 'sticker', 'effect');

-- Users table
create table public.users (
    id uuid references auth.users primary key,
    username text unique not null,
    display_name text,
    avatar_url text,
    bio text,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    
    constraint username_length check (char_length(username) >= 3 and char_length(username) <= 30),
    constraint username_format check (username ~* '^[a-zA-Z0-9_]+$')
);

-- Videos table with improved structure
create table public.videos (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.users(id) on delete cascade not null,
    
    -- Basic metadata
    title text not null,
    description text,
    duration integer not null check (duration > 0),
    
    -- Media URLs (stored in bucket)
    video_url text not null,
    thumbnail_url text,
    
    -- Organization
    category text,
    tags text[] default '{}',
    
    -- Enhancement metadata
    enhancements jsonb default '{}'::jsonb,
    
    -- Status & timestamps
    status video_status default 'draft',
    published_at timestamptz,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    
    -- Metrics (updated via triggers)
    view_count integer default 0,
    like_count integer default 0,
    comment_count integer default 0,

    constraint title_length check (char_length(title) >= 1 and char_length(title) <= 100)
);

-- Create index for faster queries
create index videos_user_id_idx on public.videos(user_id);
create index videos_status_idx on public.videos(status);
create index videos_tags_gin_idx on public.videos using gin(tags);

-- Comments table
create table public.comments (
    id uuid primary key default uuid_generate_v4(),
    video_id uuid references public.videos(id) on delete cascade not null,
    user_id uuid references public.users(id) on delete cascade not null,
    content text not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    
    constraint content_length check (char_length(content) >= 1 and char_length(content) <= 1000)
);

create index comments_video_id_idx on public.comments(video_id);
create index comments_user_id_idx on public.comments(user_id);

-- Video likes (junction table)
create table public.video_likes (
    video_id uuid references public.videos(id) on delete cascade,
    user_id uuid references public.users(id) on delete cascade,
    created_at timestamptz default now(),
    primary key (video_id, user_id)
);

-- User follows (junction table)
create table public.follows (
    follower_id uuid references public.users(id) on delete cascade,
    following_id uuid references public.users(id) on delete cascade,
    created_at timestamptz default now(),
    primary key (follower_id, following_id),
    
    -- Prevent self-following
    constraint no_self_follow check (follower_id != following_id)
);

-- Trigger function to update video metrics
create or replace function public.update_video_metrics()
returns trigger
language plpgsql
security definer
as $$
begin
    if TG_OP = 'INSERT' then
        if TG_TABLE_NAME = 'video_likes' then
            update public.videos
            set like_count = like_count + 1
            where id = NEW.video_id;
        elsif TG_TABLE_NAME = 'comments' then
            update public.videos
            set comment_count = comment_count + 1
            where id = NEW.video_id;
        end if;
    elsif TG_OP = 'DELETE' then
        if TG_TABLE_NAME = 'video_likes' then
            update public.videos
            set like_count = like_count - 1
            where id = OLD.video_id;
        elsif TG_TABLE_NAME = 'comments' then
            update public.videos
            set comment_count = comment_count - 1
            where id = OLD.video_id;
        end if;
    end if;
    return null;
end;
$$;

-- Create triggers for metrics
create trigger update_video_likes_count
after insert or delete on public.video_likes
for each row execute function public.update_video_metrics();

create trigger update_video_comments_count
after insert or delete on public.comments
for each row execute function public.update_video_metrics();

-- Trigger function to update timestamps
create or replace function public.update_updated_at()
returns trigger
language plpgsql
security definer
as $$
begin
    NEW.updated_at = now();
    return NEW;
end;
$$;

-- Create updated_at triggers
create trigger update_users_updated_at
before update on public.users
for each row execute function public.update_updated_at();

create trigger update_videos_updated_at
before update on public.videos
for each row execute function public.update_updated_at();

create trigger update_comments_updated_at
before update on public.comments
for each row execute function public.update_updated_at();
