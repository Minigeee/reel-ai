-- Create follows table
create table if not exists public.follows (
    follower_id uuid references public.users(id) on delete cascade not null,
    following_id uuid references public.users(id) on delete cascade not null,
    created_at timestamptz default now(),
    primary key (follower_id, following_id),
    constraint no_self_follow check (follower_id != following_id)
);

-- Create indexes for better query performance
create index follows_follower_id_idx on public.follows(follower_id);
create index follows_following_id_idx on public.follows(following_id);

-- Create functions to get follower and following counts
create or replace function public.get_follower_count(user_id uuid)
returns bigint
language sql stable
as $$
    select count(*) from public.follows where following_id = user_id;
$$;

create or replace function public.get_following_count(user_id uuid)
returns bigint
language sql stable
as $$
    select count(*) from public.follows where follower_id = user_id;
$$;

-- Add RLS policies
alter table public.follows enable row level security;

create policy "Users can see who follows who"
    on public.follows for select
    to authenticated
    using (true);

create policy "Users can follow others"
    on public.follows for insert
    to authenticated
    with check (follower_id = auth.uid());

create policy "Users can unfollow others"
    on public.follows for delete
    to authenticated
    using (follower_id = auth.uid());
