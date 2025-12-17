-- Tabela de Perfis de Usuário (Estendendo auth.users)
create table public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  address_cep text,
  address_street text,
  address_neighborhood text,
  address_city text,
  address_state text,
  address_number text,
  address_complement text,
  updated_at timestamp with time zone,
  
  constraint username_length check (char_length(full_name) >= 3)
);

-- Habilitar RLS (Row Level Security)
alter table public.profiles enable row level security;

-- Políticas de acesso
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Tabela de Vistorias
create table public.inspections (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  plate text not null,
  vin text not null,
  status text check (status in ('pending', 'completed', 'failed')) default 'pending',
  risk_score integer,
  summary text,
  
  -- Dados Geo
  latitude double precision,
  longitude double precision,
  
  -- JSONs complexos retornados pelo n8n
  owner_data jsonb,
  fines_data jsonb,
  restrictions_data jsonb,
  ai_analysis text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS
alter table public.inspections enable row level security;

-- Políticas de acesso
create policy "Users can view own inspections."
  on inspections for select
  using ( auth.uid() = user_id );

create policy "Users can create inspections."
  on inspections for insert
  with check ( auth.uid() = user_id );

-- Função para criar perfil automaticamente ao cadastrar (Optional Trigger)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
