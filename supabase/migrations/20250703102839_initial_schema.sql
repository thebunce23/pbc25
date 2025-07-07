-- Initial schema for PBC25 Pickleball Club Platform

-- Users table for authentication and profiles
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  first_name text,
  last_name text,
  phone text,
  skill_level text check (skill_level in ('beginner', 'intermediate', 'advanced', 'pro')),
  membership_status text check (membership_status in ('active', 'inactive', 'pending')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Courts table
create table public.courts (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  is_active boolean default true,
  hourly_rate decimal(10,2),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Bookings table
create table public.bookings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  court_id uuid references public.courts(id) on delete cascade not null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  status text check (status in ('confirmed', 'cancelled', 'pending')) default 'confirmed',
  total_amount decimal(10,2),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Events table for tournaments, clinics, etc.
create table public.events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  event_type text check (event_type in ('tournament', 'clinic', 'social', 'meeting')) not null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  max_participants integer,
  registration_fee decimal(10,2) default 0,
  is_active boolean default true,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Event registrations
create table public.event_registrations (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  registration_date timestamp with time zone default timezone('utc'::text, now()) not null,
  status text check (status in ('registered', 'cancelled', 'waitlist')) default 'registered',
  unique(event_id, user_id)
);

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.courts enable row level security;
alter table public.bookings enable row level security;
alter table public.events enable row level security;
alter table public.event_registrations enable row level security;

-- RLS Policies
-- Users can read their own profile
create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

-- Anyone can view active courts
create policy "Anyone can view active courts" on public.courts
  for select using (is_active = true);

-- Users can view their own bookings
create policy "Users can view own bookings" on public.bookings
  for select using (auth.uid() = user_id);

-- Users can create their own bookings
create policy "Users can create own bookings" on public.bookings
  for insert with check (auth.uid() = user_id);

-- Users can update their own bookings
create policy "Users can update own bookings" on public.bookings
  for update using (auth.uid() = user_id);

-- Anyone can view active events
create policy "Anyone can view active events" on public.events
  for select using (is_active = true);

-- Users can view their own event registrations
create policy "Users can view own registrations" on public.event_registrations
  for select using (auth.uid() = user_id);

-- Users can create their own event registrations
create policy "Users can register for events" on public.event_registrations
  for insert with check (auth.uid() = user_id);

-- Create indexes for better performance
create index idx_users_email on public.users(email);
create index idx_bookings_user_id on public.bookings(user_id);
create index idx_bookings_court_id on public.bookings(court_id);
create index idx_bookings_start_time on public.bookings(start_time);
create index idx_events_start_time on public.events(start_time);
create index idx_event_registrations_event_id on public.event_registrations(event_id);
create index idx_event_registrations_user_id on public.event_registrations(user_id);

-- Function to handle user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, first_name, last_name)
  values (new.id, new.email, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to automatically create user profile
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Insert sample courts
insert into public.courts (name, description, hourly_rate) values
  ('Court 1', 'Main outdoor court with lighting', 25.00),
  ('Court 2', 'Secondary outdoor court', 20.00),
  ('Court 3', 'Indoor court for all-weather play', 30.00);
