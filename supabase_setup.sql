-- Enable Storage
insert into storage.buckets (id, name, public) values ('diagram-assets', 'diagram-assets', true);

-- Create Diagrams Table
create table public.diagrams (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  tags text[] default '{}',
  svg_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies For Tables
alter table public.diagrams enable row level security;

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
