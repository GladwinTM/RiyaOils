-- Riya home-page insights: oil nutrition profiles + batch quality evaluations.
-- Idempotent: safe to run more than once.
begin;

-- Typical composition per oil type (one row per category).
create table if not exists public.oil_profiles (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null unique references public.categories(id) on delete cascade,
  smoke_point_c integer not null check (smoke_point_c between 50 and 300),
  saturated_pct numeric(5,2) not null check (saturated_pct between 0 and 100),
  mufa_pct numeric(5,2) not null check (mufa_pct between 0 and 100),
  pufa_pct numeric(5,2) not null check (pufa_pct between 0 and 100),
  flavor_note text,
  best_for text,
  source text not null default 'Typical values from published food-composition references',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (saturated_pct + mufa_pct + pufa_pct <= 100)
);

-- Reference limits each lab parameter is evaluated against.
create table if not exists public.quality_parameters (
  key text primary key check (key ~ '^[a-z_]+$'),
  label text not null,
  unit text not null,
  max_limit numeric(10,3) not null check (max_limit > 0),
  description text,
  reference text not null,
  sort_order integer not null default 0
);

-- Lab results for a pressed batch.
create table if not exists public.quality_evaluations (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  batch_code text not null unique,
  tested_on date not null,
  acid_value numeric(6,3) not null check (acid_value >= 0),
  peroxide_value numeric(6,3) not null check (peroxide_value >= 0),
  moisture_pct numeric(6,3) not null check (moisture_pct >= 0),
  lab_name text,
  notes text,
  -- true = placeholder row shipped with the app; the UI labels these as sample data.
  is_sample boolean not null default false,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists quality_evaluations_product_tested_idx
  on public.quality_evaluations(product_id, tested_on desc);

drop trigger if exists oil_profiles_set_updated_at on public.oil_profiles;
create trigger oil_profiles_set_updated_at before update on public.oil_profiles
  for each row execute function public.set_updated_at();
drop trigger if exists quality_evaluations_set_updated_at on public.quality_evaluations;
create trigger quality_evaluations_set_updated_at before update on public.quality_evaluations
  for each row execute function public.set_updated_at();

alter table public.oil_profiles enable row level security;
alter table public.quality_parameters enable row level security;
alter table public.quality_evaluations enable row level security;

drop policy if exists "oil_profiles_public_read" on public.oil_profiles;
create policy "oil_profiles_public_read" on public.oil_profiles
  for select to anon, authenticated using (true);
drop policy if exists "quality_parameters_public_read" on public.quality_parameters;
create policy "quality_parameters_public_read" on public.quality_parameters
  for select to anon, authenticated using (true);
drop policy if exists "quality_evaluations_public_read" on public.quality_evaluations;
create policy "quality_evaluations_public_read" on public.quality_evaluations
  for select to anon, authenticated using (is_published);

grant select on public.oil_profiles, public.quality_parameters, public.quality_evaluations
  to anon, authenticated;

-- Create a CUSTOMER profile automatically when someone signs up through Supabase Auth.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (user_id, name, phone)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), split_part(coalesce(new.email, 'Customer'), '@', 1)),
    new.raw_user_meta_data ->> 'phone'
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Reference data
-- ---------------------------------------------------------------------------
insert into public.quality_parameters (key, label, unit, max_limit, description, reference, sort_order) values
  ('acid_value', 'Acid value', 'mg KOH/g', 4.0, 'Free fatty acids. Lower means fresher seed and gentler pressing.', 'Codex STAN 210 – cold pressed & virgin oils', 1),
  ('peroxide_value', 'Peroxide value', 'meq O₂/kg', 15.0, 'Early oxidation. Lower means the oil has not started to turn rancid.', 'Codex STAN 210 – cold pressed & virgin oils', 2),
  ('moisture_pct', 'Moisture', '%', 0.2, 'Water and volatile matter. Lower keeps the oil stable on the shelf.', 'Codex STAN 210 – matter volatile at 105 °C', 3)
on conflict (key) do update set label = excluded.label, unit = excluded.unit, max_limit = excluded.max_limit,
  description = excluded.description, reference = excluded.reference, sort_order = excluded.sort_order;

insert into public.oil_profiles (category_id, smoke_point_c, saturated_pct, mufa_pct, pufa_pct, flavor_note, best_for)
select c.id, v.smoke, v.sfa, v.mufa, v.pufa, v.flavor, v.best
from (values
  ('gingelly-oil', 177, 14.2, 39.7, 41.7, 'Nutty, toasty aroma', 'Tempering, pickles, kuzhambu'),
  ('groundnut-oil', 160, 16.9, 46.2, 32.0, 'Rich, mildly sweet', 'Deep frying, roasting, poriyal'),
  ('coconut-oil', 177, 86.5, 5.8, 1.8, 'Fresh coconut', 'Avial, Kerala dishes, hair care'),
  ('sunflower-oil', 107, 10.3, 19.5, 65.7, 'Light and neutral', 'Dressings, light sautéing')
) as v(slug, smoke, sfa, mufa, pufa, flavor, best)
join public.categories c on c.slug = v.slug
on conflict (category_id) do update set smoke_point_c = excluded.smoke_point_c, saturated_pct = excluded.saturated_pct,
  mufa_pct = excluded.mufa_pct, pufa_pct = excluded.pufa_pct, flavor_note = excluded.flavor_note, best_for = excluded.best_for;

-- Placeholder batch results (is_sample = true). Replace with real lab reports.
insert into public.quality_evaluations (product_id, batch_code, tested_on, acid_value, peroxide_value, moisture_pct, lab_name, notes, is_sample)
select p.id, v.batch, v.tested::date, v.av, v.pv, v.mo, 'Sample data', 'Placeholder – replace with your lab report', true
from (values
  ('cold-pressed-gingelly-oil',  'SAMPLE-GNG-01', '2026-06-12', 1.42, 4.8, 0.08),
  ('cold-pressed-gingelly-oil',  'SAMPLE-GNG-02', '2026-08-03', 1.21, 4.1, 0.07),
  ('cold-pressed-gingelly-oil',  'SAMPLE-GNG-03', '2026-10-07', 1.05, 3.6, 0.06),
  ('cold-pressed-groundnut-oil', 'SAMPLE-GRD-01', '2026-06-18', 1.88, 5.9, 0.11),
  ('cold-pressed-groundnut-oil', 'SAMPLE-GRD-02', '2026-08-11', 1.64, 5.2, 0.09),
  ('cold-pressed-groundnut-oil', 'SAMPLE-GRD-03', '2026-10-14', 1.47, 4.7, 0.09),
  ('virgin-coconut-oil',         'SAMPLE-VCO-01', '2026-06-25', 0.58, 1.9, 0.10),
  ('virgin-coconut-oil',         'SAMPLE-VCO-02', '2026-08-20', 0.49, 1.6, 0.08),
  ('virgin-coconut-oil',         'SAMPLE-VCO-03', '2026-10-21', 0.44, 1.4, 0.07),
  ('cold-pressed-sunflower-oil', 'SAMPLE-SUN-01', '2026-07-02', 1.12, 6.4, 0.06),
  ('cold-pressed-sunflower-oil', 'SAMPLE-SUN-02', '2026-08-28', 0.97, 5.6, 0.05),
  ('cold-pressed-sunflower-oil', 'SAMPLE-SUN-03', '2026-10-28', 0.91, 5.1, 0.05)
) as v(slug, batch, tested, av, pv, mo)
join public.products p on p.slug = v.slug
on conflict (batch_code) do nothing;

commit;
