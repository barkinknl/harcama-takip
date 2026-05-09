-- ============================================================
-- 0002_reset — Eski tabloları temizle, baştan yarat
-- Mevcut Supabase projesinde önceki kurulumlardan kalan
-- profiles şeması olduğu için TÜMÜNÜ drop edip yeniden kuruyoruz.
-- DİKKAT: Bu komut tüm uygulama verilerini siler.
-- ============================================================

-- 1) Tetikleyici ve fonksiyonları temizle
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.set_updated_at() cascade;
drop function if exists public.carry_over_to_next_month(uuid, text) cascade;

-- 2) Tablolar — bağımlılıkları cascade ile temizle
drop table if exists public.transactions cascade;
drop table if exists public.other_earnings cascade;
drop table if exists public.monthly_settings cascade;
drop table if exists public.categories cascade;
drop table if exists public.profiles cascade;

-- ============================================================
-- Şimdi 0001_init.sql içeriği — temiz kurulum
-- ============================================================

create extension if not exists "uuid-ossp";

-- profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  currency text not null default 'TRY',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- categories
create table public.categories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  color text not null default '#7dbb7c',
  icon text not null default 'tag',
  is_default boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index categories_user_idx on public.categories(user_id);

alter table public.categories enable row level security;

create policy "categories_select_own" on public.categories
  for select using (auth.uid() = user_id);
create policy "categories_insert_own" on public.categories
  for insert with check (auth.uid() = user_id);
create policy "categories_update_own" on public.categories
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "categories_delete_own" on public.categories
  for delete using (auth.uid() = user_id);

-- transactions
create table public.transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(14, 2) not null check (amount >= 0),
  type text not null check (type in ('income', 'expense')),
  category_id uuid references public.categories(id) on delete set null,
  date date not null,
  description text,
  is_recurring boolean not null default false,
  recurring_day int check (recurring_day between 1 and 31),
  month_key text generated always as (
    lpad(extract(year from date)::int::text, 4, '0') || '-' ||
    lpad(extract(month from date)::int::text, 2, '0')
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index transactions_user_month_idx on public.transactions(user_id, month_key);
create index transactions_date_idx on public.transactions(date desc);

alter table public.transactions enable row level security;

create policy "transactions_select_own" on public.transactions
  for select using (auth.uid() = user_id);
create policy "transactions_insert_own" on public.transactions
  for insert with check (auth.uid() = user_id);
create policy "transactions_update_own" on public.transactions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "transactions_delete_own" on public.transactions
  for delete using (auth.uid() = user_id);

-- other_earnings
create table public.other_earnings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(14, 2) not null check (amount >= 0),
  date date not null,
  description text,
  month_key text generated always as (
    lpad(extract(year from date)::int::text, 4, '0') || '-' ||
    lpad(extract(month from date)::int::text, 2, '0')
  ) stored,
  created_at timestamptz not null default now()
);

create index other_earnings_user_month_idx on public.other_earnings(user_id, month_key);

alter table public.other_earnings enable row level security;

create policy "other_earnings_select_own" on public.other_earnings
  for select using (auth.uid() = user_id);
create policy "other_earnings_insert_own" on public.other_earnings
  for insert with check (auth.uid() = user_id);
create policy "other_earnings_update_own" on public.other_earnings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "other_earnings_delete_own" on public.other_earnings
  for delete using (auth.uid() = user_id);

-- monthly_settings
create table public.monthly_settings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month_key text not null,
  income numeric(14, 2) not null default 0,
  last_month_debit numeric(14, 2) not null default 0,
  next_pay_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, month_key)
);

create index monthly_settings_user_month_idx on public.monthly_settings(user_id, month_key);

alter table public.monthly_settings enable row level security;

create policy "monthly_settings_select_own" on public.monthly_settings
  for select using (auth.uid() = user_id);
create policy "monthly_settings_insert_own" on public.monthly_settings
  for insert with check (auth.uid() = user_id);
create policy "monthly_settings_update_own" on public.monthly_settings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "monthly_settings_delete_own" on public.monthly_settings
  for delete using (auth.uid() = user_id);

-- updated_at fonksiyonu + tetikleyiciler
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger transactions_set_updated_at
  before update on public.transactions
  for each row execute function public.set_updated_at();

create trigger monthly_settings_set_updated_at
  before update on public.monthly_settings
  for each row execute function public.set_updated_at();

-- Yeni kullanıcı: profil + 10 default kategori
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  insert into public.categories (user_id, name, type, color, icon, is_default, sort_order) values
    (new.id, 'Maaş',       'income',  '#4a8350', 'wallet',          true, 0),
    (new.id, 'Diğer Gelir','income',  '#7dbb7c', 'plus-circle',     true, 1),
    (new.id, 'Kira',       'expense', '#cd5848', 'home',            true, 0),
    (new.id, 'Faturalar',  'expense', '#d97757', 'zap',             true, 1),
    (new.id, 'Market',     'expense', '#7dbb7c', 'shopping-cart',   true, 2),
    (new.id, 'Ulaşım',     'expense', '#629c8f', 'car',             true, 3),
    (new.id, 'Eğlence',    'expense', '#a87dbb', 'music',           true, 4),
    (new.id, 'Sağlık',     'expense', '#ecc36b', 'heart',           true, 5),
    (new.id, 'Yemek',      'expense', '#e0a162', 'utensils',        true, 6),
    (new.id, 'Diğer',      'expense', '#94a3b8', 'tag',             true, 7);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Ay sonu otomatik devir
create or replace function public.carry_over_to_next_month(target_user uuid, source_month text)
returns void language plpgsql security definer set search_path = public as $$
declare
  next_month text;
  source_settings record;
  total_expense numeric(14, 2);
  total_other_earnings numeric(14, 2);
  total_income_tx numeric(14, 2);
  this_month_balance numeric(14, 2);
  left_to_spend numeric(14, 2);
  carry numeric(14, 2);
begin
  next_month := to_char(
    (to_date(source_month || '-01', 'YYYY-MM-DD') + interval '1 month'),
    'YYYY-MM'
  );

  select * into source_settings
  from public.monthly_settings
  where user_id = target_user and month_key = source_month;

  if source_settings is null then
    return;
  end if;

  select coalesce(sum(amount), 0) into total_expense
  from public.transactions
  where user_id = target_user and month_key = source_month and type = 'expense';

  select coalesce(sum(amount), 0) into total_income_tx
  from public.transactions
  where user_id = target_user and month_key = source_month and type = 'income';

  select coalesce(sum(amount), 0) into total_other_earnings
  from public.other_earnings
  where user_id = target_user and month_key = source_month;

  this_month_balance := source_settings.income - source_settings.last_month_debit;
  left_to_spend := this_month_balance + total_other_earnings + total_income_tx - total_expense;
  carry := greatest(-left_to_spend, 0);

  insert into public.monthly_settings (user_id, month_key, income, last_month_debit)
  values (target_user, next_month, source_settings.income, carry)
  on conflict (user_id, month_key) do update
    set last_month_debit = excluded.last_month_debit;
end;
$$;
