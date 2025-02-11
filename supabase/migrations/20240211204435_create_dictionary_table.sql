
-- Create dictionary table
create table if not exists dictionary (
  id uuid primary key default gen_random_uuid(),
  language text not null,
  word text not null,
  definitions jsonb not null, -- Array of definitions
  part_of_speech text not null,
  extra jsonb, -- Language specific info like readings for Japanese
  metadata jsonb, -- Additional language specific metadata
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  -- Create index on commonly searched columns
  constraint dictionary_language_word_unique unique (language, word)
);

-- Create index for faster lookups
create index dictionary_language_word_idx on dictionary (language, word);

-- Add RLS policies
alter table dictionary enable row level security;

-- Allow read access to all authenticated users
create policy "Allow read access to dictionary for all authenticated users"
on dictionary
for select
to authenticated
using (true);

-- Allow public read access since dictionary data is not sensitive
create policy "Allow public read access to dictionary"
on dictionary
for select
to anon
using (true);

-- Create trigger for updated_at
create trigger set_updated_at
  before update on dictionary
  for each row
  execute function update_updated_at();
