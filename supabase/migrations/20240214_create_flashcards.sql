-- Create flashcards table
create table if not exists public.flashcards (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    word text not null,
    language text not null default 'en',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    last_reviewed_at timestamp with time zone,
    review_count integer default 0,
    -- Enables efficient lookups for duplicate words per user
    constraint unique_user_word_language unique (user_id, word, language)
);

-- Set up RLS policies
alter table public.flashcards enable row level security;

create policy "Users can view their own flashcards"
    on public.flashcards for select
    using (auth.uid() = user_id);

create policy "Users can insert their own flashcards"
    on public.flashcards for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own flashcards"
    on public.flashcards for update
    using (auth.uid() = user_id);

create policy "Users can delete their own flashcards"
    on public.flashcards for delete
    using (auth.uid() = user_id);

-- Create indexes
create index flashcards_user_id_idx on public.flashcards(user_id);
create index flashcards_word_language_idx on public.flashcards(word, language);
