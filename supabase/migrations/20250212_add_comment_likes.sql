-- Add like_count to comments table
alter table public.comments
add column like_count integer default 0;

-- Create comment likes table
create table public.comment_likes (
    comment_id uuid references public.comments(id) on delete cascade,
    user_id uuid references public.users(id) on delete cascade,
    created_at timestamptz default now(),
    primary key (comment_id, user_id)
);

-- Create index for faster queries
create index comment_likes_user_id_idx on public.comment_likes(user_id);

-- Update trigger function to handle comment likes
create or replace function public.update_comment_metrics()
returns trigger
language plpgsql
security definer
as $$
begin
    if TG_OP = 'INSERT' then
        update public.comments
        set like_count = like_count + 1
        where id = NEW.comment_id;
    elsif TG_OP = 'DELETE' then
        update public.comments
        set like_count = like_count - 1
        where id = OLD.comment_id;
    end if;
    return null;
end;
$$;

-- Create trigger for comment likes
create trigger update_comment_likes_count
after insert or delete on public.comment_likes
for each row execute function public.update_comment_metrics();

-- Add RLS policies for comment likes
alter table public.comment_likes enable row level security;

create policy "Anyone can read comment likes"
  on public.comment_likes for select
  using (true);

create policy "Authenticated users can insert comment likes"
  on public.comment_likes for insert
  with check (auth.role() = 'authenticated');

create policy "Users can delete their own comment likes"
  on public.comment_likes for delete
  using (auth.uid() = user_id);
