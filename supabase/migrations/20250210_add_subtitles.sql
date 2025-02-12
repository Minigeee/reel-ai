-- Create enum for subtitle status
create type subtitle_status as enum ('pending', 'processing', 'completed', 'error');

-- Enable pg_net extension for HTTP requests
create extension if not exists pg_net;

-- Create subtitles table
create table public.subtitles (
    id uuid primary key default uuid_generate_v4(),
    video_id uuid references public.videos(id) on delete cascade not null,
    language text not null default 'en',
    status subtitle_status not null default 'pending',
    error_message text,
    segments jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    -- Ensure one subtitle per language per video
    unique(video_id, language)
);

-- Add updated_at trigger
create trigger update_subtitles_updated_at
    before update on public.subtitles
    for each row
    execute function update_updated_at();

-- Create RLS policies
alter table public.subtitles enable row level security;

create policy "Subtitles are viewable by everyone"
    on public.subtitles
    for select
    using (true);
