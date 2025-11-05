-- Roles & RLS for OAuth pivot (admin | contributor | reader)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  role text not null default 'reader' check (role in ('admin','contributor','reader')),
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- Users can select their own profile
create policy if not exists profiles_self_select on public.profiles
  for select using (auth.uid() = id);

-- Admins can select all
create policy if not exists profiles_admin_select_all on public.profiles
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Only admins can update roles
create policy if not exists profiles_admin_update on public.profiles
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email,
          case when lower(new.email) = 'malsicario@malsicario.com' then 'admin' else 'reader' end)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();