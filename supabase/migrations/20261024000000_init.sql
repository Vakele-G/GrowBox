-- GrowBox Initial Schema Migration
-- Matches PROJECT_SPEC.md Section 8 and MILESTONES.md M02

-- 1. Businesses
create table if not exists public.businesses (
  id text primary key,
  owner_id uuid references auth.users(id) on delete cascade,
  name text not null,
  stage text not null default 'idea' check (stage in ('idea', 'launch', 'stable', 'grow', 'enterprise')),
  municipality text not null,
  language text not null default 'en' check (language in ('en', 'zu')),
  monthly_budget_cents bigint not null default 0,
  onboarding jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- 2. Products
create table if not exists public.products (
  id text primary key,
  business_id text not null references public.businesses(id) on delete cascade,
  name text not null,
  unit_label text not null,
  selling_price_cents bigint not null,
  batch_yield integer not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 3. Ingredients
create table if not exists public.ingredients (
  id text primary key,
  business_id text not null references public.businesses(id) on delete cascade,
  name text not null,
  pack_size numeric not null,
  pack_unit text not null,
  pack_price_cents bigint not null,
  last_price_change_at timestamptz,
  created_at timestamptz not null default now()
);

-- 4. Product Ingredients (recipe linking)
create table if not exists public.product_ingredients (
  product_id text not null references public.products(id) on delete cascade,
  ingredient_id text not null references public.ingredients(id) on delete cascade,
  qty_per_unit numeric not null,
  primary key (product_id, ingredient_id)
);

-- 5. Transactions (sales and expenses)
create table if not exists public.transactions (
  id text primary key,
  business_id text not null references public.businesses(id) on delete cascade,
  occurred_on date not null,
  type text not null check (type in ('sale', 'expense')),
  category text not null,
  amount_cents bigint not null,
  description text not null,
  product_id text references public.products(id) on delete set null,
  quantity numeric,
  source text not null check (source in ('manual', 'text', 'fnb')),
  external_id text,
  confidence numeric,
  created_at timestamptz not null default now(),
  constraint uq_transactions_business_external unique (business_id, external_id)
);

create index if not exists idx_transactions_business_date
  on public.transactions(business_id, occurred_on desc);

-- 6. Plan Items (startup checklist / equipment)
create table if not exists public.plan_items (
  id text primary key,
  business_id text not null references public.businesses(id) on delete cascade,
  kind text not null check (kind in ('equipment', 'ingredient', 'task')),
  label text not null,
  est_cost_cents bigint not null default 0,
  status text not null default 'todo' check (status in ('todo', 'done')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 7. Stage Progress
create table if not exists public.stage_progress (
  business_id text primary key references public.businesses(id) on delete cascade,
  stage text not null check (stage in ('idea', 'launch', 'stable', 'grow', 'enterprise')),
  stage_started_at timestamptz not null default now(),
  completed_checks jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- 8. Nudges
create table if not exists public.nudges (
  id text primary key,
  business_id text not null references public.businesses(id) on delete cascade,
  rule_key text not null,
  severity text not null check (severity in ('info', 'warning', 'critical')),
  payload jsonb not null default '{}'::jsonb,
  message_en text not null,
  message_zu text not null,
  status text not null default 'new' check (status in ('new', 'seen', 'done', 'dismissed')),
  created_at timestamptz not null default now()
);

create index if not exists idx_nudges_business_status
  on public.nudges(business_id, status);

-- 9. Health Scores
create table if not exists public.health_scores (
  id text primary key,
  business_id text not null references public.businesses(id) on delete cascade,
  score integer not null check (score between 0 and 100),
  components jsonb not null default '{}'::jsonb,
  computed_at timestamptz not null default now()
);

create index if not exists idx_health_scores_business_computed
  on public.health_scores(business_id, computed_at desc);

-- 10. Knowledge Chunks (compliance & guidance)
create table if not exists public.knowledge_chunks (
  id text primary key,
  jurisdiction text not null,
  topic text not null,
  title text not null,
  requirement text not null,
  source_url text not null,
  last_verified text not null,
  disclaimer text not null
);

-- Row-Level Security (RLS) Setup
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

-- Policies: Businesses (owner access)
create policy "Users can view their own businesses"
  on public.businesses for select
  using (auth.uid() = owner_id);

create policy "Users can insert their own businesses"
  on public.businesses for insert
  with check (auth.uid() = owner_id);

create policy "Users can update their own businesses"
  on public.businesses for update
  using (auth.uid() = owner_id);

-- Policies: Products
create policy "Users can view products of their businesses"
  on public.products for select
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Users can manage products of their businesses"
  on public.products for all
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));

-- Policies: Ingredients
create policy "Users can view ingredients of their businesses"
  on public.ingredients for select
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Users can manage ingredients of their businesses"
  on public.ingredients for all
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));

-- Policies: Product Ingredients
create policy "Users can view product ingredients of their businesses"
  on public.product_ingredients for select
  using (product_id in (
    select p.id from public.products p
    join public.businesses b on b.id = p.business_id
    where b.owner_id = auth.uid()
  ));

create policy "Users can manage product ingredients of their businesses"
  on public.product_ingredients for all
  using (product_id in (
    select p.id from public.products p
    join public.businesses b on b.id = p.business_id
    where b.owner_id = auth.uid()
  ));

-- Policies: Transactions
create policy "Users can view transactions of their businesses"
  on public.transactions for select
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Users can manage transactions of their businesses"
  on public.transactions for all
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));

-- Policies: Plan Items
create policy "Users can view plan items of their businesses"
  on public.plan_items for select
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Users can manage plan items of their businesses"
  on public.plan_items for all
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));

-- Policies: Stage Progress
create policy "Users can view stage progress of their businesses"
  on public.stage_progress for select
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Users can manage stage progress of their businesses"
  on public.stage_progress for all
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));

-- Policies: Nudges
create policy "Users can view nudges of their businesses"
  on public.nudges for select
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Users can manage nudges of their businesses"
  on public.nudges for all
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));

-- Policies: Health Scores
create policy "Users can view health scores of their businesses"
  on public.health_scores for select
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Users can manage health scores of their businesses"
  on public.health_scores for all
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));

-- Policies: Knowledge Chunks (public read-only)
create policy "Everyone can view compliance knowledge"
  on public.knowledge_chunks for select
  using (true);
