create extension if not exists pgcrypto;

do $$
begin
  create type public.transaction_type as enum ('WAGE', 'ADVANCE', 'DEDUCTION');
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  join_date date not null,
  initial_advance numeric(12, 2) not null default 0 check (initial_advance >= 0),
  default_rate numeric(12, 2) not null default 0 check (default_rate >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists employees_name_unique_idx
on public.employees (lower(btrim(name)));

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  transaction_date date not null,
  transaction_type public.transaction_type not null,
  amount numeric(12, 2) not null check (amount > 0),
  bricks_produced integer check (bricks_produced >= 0),
  rate_used numeric(12, 2) check (rate_used >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint wage_requires_production check (
    (transaction_type <> 'WAGE')
    or (bricks_produced is not null and bricks_produced > 0 and rate_used is not null and rate_used > 0)
  ),
  constraint non_wage_fields_blank check (
    (transaction_type = 'WAGE')
    or (bricks_produced is null and rate_used is null)
  )
);

alter table public.transactions
drop constraint if exists transactions_employee_id_fkey;

alter table public.transactions
add constraint transactions_employee_id_fkey
foreign key (employee_id) references public.employees(id) on delete cascade;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists employees_set_updated_at on public.employees;
create trigger employees_set_updated_at
before update on public.employees
for each row execute procedure public.set_updated_at();

drop trigger if exists transactions_set_updated_at on public.transactions;
create trigger transactions_set_updated_at
before update on public.transactions
for each row execute procedure public.set_updated_at();

alter table public.employees enable row level security;
alter table public.transactions enable row level security;

drop policy if exists "authenticated employees access" on public.employees;
create policy "authenticated employees access"
on public.employees
for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated transactions access" on public.transactions;
create policy "authenticated transactions access"
on public.transactions
for all
to authenticated
using (true)
with check (true);
