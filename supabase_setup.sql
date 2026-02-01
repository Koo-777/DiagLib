-- Enable Storage
insert into storage.buckets (id, name, public) 
values ('diagram-assets', 'diagram-assets', true)
on conflict (id) do nothing;

-- Create Diagrams Table
create table if not exists public.diagrams (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  tags text[] default '{}',
  colors jsonb default '[]',
  svg_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Full Text Search Setup (Trigger Method - Most Robust)

-- 1. Add the column (standard column, not generated)
alter table public.diagrams 
add column if not exists fts tsvector;

-- 2. Create index
drop index if exists diagrams_fts_idx;
create index diagrams_fts_idx on public.diagrams using gin (fts);

-- 3. Create function to update fts
create or replace function public.handle_diagram_fts()
returns trigger as $$
begin
  new.fts := to_tsvector('english', 
    new.title || ' ' || 
    coalesce(new.description, '') || ' ' || 
    array_to_string(new.tags, ' ')
  );
  return new;
end;
$$ language plpgsql;

-- 4. Create trigger
drop trigger if exists on_diagram_fts_update on public.diagrams;
create trigger on_diagram_fts_update
  before insert or update on public.diagrams
  for each row execute procedure public.handle_diagram_fts();

-- 5. Backfill existing data if any (optional, safe to run)
update public.diagrams set fts = to_tsvector('english', 
    title || ' ' || 
    coalesce(description, '') || ' ' || 
    array_to_string(tags, ' ')
) where fts is null;

-- RLS Policies For Tables
alter table public.diagrams enable row level security;

-- Drop existing policies to allow re-running script
drop policy if exists "Allow public read access" on public.diagrams;
drop policy if exists "Allow authenticated upsert" on public.diagrams;
drop policy if exists "Allow authenticated update" on public.diagrams;
drop policy if exists "Allow authenticated delete" on public.diagrams;

-- Allow public read access
create policy "Allow public read access"
on public.diagrams for select
to anon
using (true);

-- Allow authenticated insert/update/delete (Admin only)
create policy "Allow authenticated upsert"
on public.diagrams for insert
to authenticated
with check (true);

create policy "Allow authenticated update"
on public.diagrams for update
to authenticated
using (true);

create policy "Allow authenticated delete"
on public.diagrams for delete
to authenticated
using (true);

-- RLS Policies For Storage
drop policy if exists "Allow public read access" on storage.objects;
drop policy if exists "Allow authenticated upload" on storage.objects;
drop policy if exists "Allow authenticated update" on storage.objects;
drop policy if exists "Allow authenticated delete" on storage.objects;

create policy "Allow public read access"
on storage.objects for select
to anon
using ( bucket_id = 'diagram-assets' );

create policy "Allow authenticated upload"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'diagram-assets' );

create policy "Allow authenticated update"
on storage.objects for update
to authenticated
with check ( bucket_id = 'diagram-assets' );

create policy "Allow authenticated delete"
on storage.objects for delete
to authenticated
using ( bucket_id = 'diagram-assets' );
