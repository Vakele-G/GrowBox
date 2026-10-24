-- GrowBox — initial schema (PROJECT_SPEC.md §8)
-- Postgres, snake_case, money as integer cents, dates as date/timestamptz.
-- Run via Supabase migrations. RLS scopes every row to the owning business.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- businesses
create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  stage text not null default 'idea'
    check (stage in ('idea', 'launch', 'stable', 'grow', 'enterprise')),
  municipality text,
  language text not null default 'en'
    check (language in ('en', 'zu')),
  monthly_budget_cents integer not null default 0,
  onboarding jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null,
  unit_label text not null default 'unit',
  selling_price_cents integer not null default 0,
  batch_yield integer not null default 1,
  is_active boolean not null default true
);

-- ------------------------------------------------------------- ingredients
create table public.ingredients (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null,
  pack_size integer not null default 0,
  pack_unit text not null default 'unit',
  pack_price_cents integer not null default 0,
  last_price_change_at date,
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------- product_ingredients
create table public.product_ingredients (
  product_id uuid not null references public.products (id) on delete cascade,
  ingredient_id uuid not null references public.ingredients (id) on delete cascade,
  qty_per_unit numeric not null default 0,
  primary key (product_id, ingredient_id)
);

-- --------------------------------------------------------------- transactions
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  occurred_on date not null,
  type text not null check (type in ('sale', 'expense')),
  category text not null default 'other',
  amount_cents integer not null,
  description text not null default '',
  product_id uuid references public.products (id) on delete set null,
  quantity integer,
  source text not null default 'manual'
    check (source in ('manual', 'text', 'fnb')),
  external_id text,
  confidence real,
  created_at timestamptz not null default now()
);

-- Idempotent FNB ingestion: unique (business_id, external_id).
create unique index transactions_business_external_id_idx
  on public.transactions (business_id, external_id)
  where external_id is not null;

-- ----------------------------------------------------------------- plan_items
create table public.plan_items (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  kind text not null check (kind in ('equipment', 'ingredient', 'task')),
  label text not null,
  est_cost_cents integer not null default 0,
  status text not null default 'todo' check (status in ('todo', 'done')),
  sort_order integer not null default 0
);

-- ---------------------------------------------------------- stage_progress
create table public.stage_progress (
  business_id uuid primary key references public.businesses (id) on delete cascade,
  stage text not null default 'idea'
    check (stage in ('idea', 'launch', 'stable', 'grow', 'enterprise')),
  stage_started_at date not null,
  completed_checks jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------------ nudges
create table public.nudges (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  rule_key text not null,
  severity text not null default 'info'
    check (severity in ('info', 'warning', 'critical')),
  payload jsonb not null default '{}'::jsonb,
  message_en text not null default '',
  message_zu text not null default '',
  status text not null default 'new'
    check (status in ('new', 'seen', 'done', 'dismissed')),
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------ health_scores
create table public.health_scores (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  score integer not null,
  components jsonb not null default '{}'::jsonb,
  computed_at timestamptz not null default now()
);

-- --------------------------------------------------------- knowledge_chunks
create table public.knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  jurisdiction text not null,
  topic text not null,
  title text not null,
  requirement text not null,
  source_url text not null,
  last_verified date not null,
  disclaimer text not null default 'Verify with your municipality.',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------- RLS
alter table public.businesses enable row level security;
alter table public.products enable row level security;
alter table public.ingredients enable row level security;
alter table public.product_ingredients enable row level security;
alter table public.transactions enable row level security;
alter table public.plan_items enable row level security;
alter table public.stage_progress enable row level security;
alter table public.nudges enable row level security;
alter table public.health_scores enable row level security;
alter table public.knowledge_chunks enable row level security;

create policy businesses_owner_select on public.businesses
  for select using (auth.uid() = owner_id);
create policy businesses_owner_update on public.businesses
  for update using (auth.uid() = owner_id);
create policy businesses_owner_insert on public.businesses
  for insert with check (auth.uid() = owner_id);

create policy products_biz_owner on public.products
  for all using (auth.uid() = (
    select owner_id from public.businesses b where b.id = products.business_id
  ));
create policy ingredients_biz_owner on public.ingredients
  for all using (auth.uid() = (
    select owner_id from public.businesses b where b.id = ingredients.business_id
  ));
create policy product_ingredients_biz_owner on public.product_ingredients
  for all using (auth.uid() = (
    select owner_id from public.products p
    join public.businesses b on b.id = p.business_id
    where p.id = product_ingredients.product_id
  ));
create policy transactions_biz_owner on public.transactions
  for all using (auth.uid() = (
    select owner_id from public.businesses b where b.id = transactions.business_id
  ));
create policy plan_items_biz_owner on public.plan_items
  for all using (auth.uid() = (
    select owner_id from public.businesses b where b.id = plan_items.business_id
  ));
create policy stage_progress_biz_owner on public.stage_progress
  for all using (auth.uid() = (
    select owner_id from public.businesses b where b.id = stage_progress.business_id
  ));
create policy nudges_biz_owner on public.nudges
  for all using (auth.uid() = (
    select owner_id from public.businesses b where b.id = nudges.business_id
  ));
create policy health_scores_biz_owner on public.health_scores
  for all using (auth.uid() = (
    select owner_id from public.businesses b where b.id = health_scores.business_id
  ));
