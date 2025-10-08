-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create artifact types enum
create type artifact_type as enum ('distortion', 'reverb', 'bandlimit');

-- Create version types enum
create type version_type as enum ('original', 'subtractive', 'generative');

-- Audio samples table
create table public.audio_samples (
  id uuid default uuid_generate_v4() primary key,
  artifact_type artifact_type not null,
  version_type version_type not null,
  file_url text not null,
  file_name text not null,
  file_size bigint,
  mime_type text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(artifact_type, version_type)
);

-- Spectrograms table
create table public.spectrograms (
  id uuid default uuid_generate_v4() primary key,
  artifact_type artifact_type not null,
  version_type version_type not null,
  image_url text not null,
  file_name text not null,
  file_size bigint,
  mime_type text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(artifact_type, version_type)
);

-- Create updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add triggers for updated_at
create trigger set_audio_samples_updated_at
  before update on public.audio_samples
  for each row
  execute procedure public.handle_updated_at();

create trigger set_spectrograms_updated_at
  before update on public.spectrograms
  for each row
  execute procedure public.handle_updated_at();

-- Enable Row Level Security
alter table public.audio_samples enable row level security;
alter table public.spectrograms enable row level security;

-- Policies for public read access
create policy "Audio samples are viewable by everyone"
  on public.audio_samples for select
  using (true);

create policy "Spectrograms are viewable by everyone"
  on public.spectrograms for select
  using (true);

-- Policies for authenticated admin write access
create policy "Audio samples are insertable by authenticated users"
  on public.audio_samples for insert
  with check (auth.role() = 'authenticated');

create policy "Audio samples are updatable by authenticated users"
  on public.audio_samples for update
  using (auth.role() = 'authenticated');

create policy "Audio samples are deletable by authenticated users"
  on public.audio_samples for delete
  using (auth.role() = 'authenticated');

create policy "Spectrograms are insertable by authenticated users"
  on public.spectrograms for insert
  with check (auth.role() = 'authenticated');

create policy "Spectrograms are updatable by authenticated users"
  on public.spectrograms for update
  using (auth.role() = 'authenticated');

create policy "Spectrograms are deletable by authenticated users"
  on public.spectrograms for delete
  using (auth.role() = 'authenticated');

-- Create storage buckets
insert into storage.buckets (id, name, public)
values
  ('audio', 'audio', true),
  ('spectrograms', 'spectrograms', true);

-- Storage policies for public read
create policy "Audio files are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'audio');

create policy "Spectrogram images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'spectrograms');

-- Storage policies for authenticated upload
create policy "Authenticated users can upload audio files"
  on storage.objects for insert
  with check (bucket_id = 'audio' and auth.role() = 'authenticated');

create policy "Authenticated users can upload spectrograms"
  on storage.objects for insert
  with check (bucket_id = 'spectrograms' and auth.role() = 'authenticated');

-- Storage policies for authenticated delete
create policy "Authenticated users can delete audio files"
  on storage.objects for delete
  using (bucket_id = 'audio' and auth.role() = 'authenticated');

create policy "Authenticated users can delete spectrograms"
  on storage.objects for delete
  using (bucket_id = 'spectrograms' and auth.role() = 'authenticated');
