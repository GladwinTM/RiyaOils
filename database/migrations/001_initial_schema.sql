-- Riya e-commerce core schema. Apply through Supabase CLI/MCP, never by hand in Studio.
create extension if not exists pgcrypto;

create type public.app_role as enum ('CUSTOMER', 'ADMIN');
create type public.order_status as enum ('PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED');
create type public.payment_method as enum ('COD');
create type public.payment_status as enum ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 120),
  phone text,
  role public.app_role not null default 'CUSTOMER',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 120),
  slug text not null unique check (slug = lower(slug) and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 180),
  slug text not null unique check (slug = lower(slug) and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text not null,
  short_description text not null,
  category_id uuid not null references public.categories(id) on delete restrict,
  weight text,
  ingredients text,
  thumbnail_url text,
  images jsonb not null default '[]'::jsonb check (jsonb_typeof(images) = 'array'),
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  size numeric(10,2) not null check (size > 0),
  unit text not null check (unit in ('ml', 'L', 'g', 'kg')),
  sku text not null unique,
  price numeric(12,2) not null check (price >= 0),
  sale_price numeric(12,2) check (sale_price >= 0 and sale_price <= price),
  stock integer not null default 0 check (stock >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, size, unit)
);

create table public.store_settings (
  id uuid primary key default gen_random_uuid(),
  store_name text not null default 'Riya',
  currency text not null default 'INR' check (currency ~ '^[A-Z]{3}$'),
  shipping_fee numeric(12,2) not null default 0 check (shipping_fee >= 0),
  free_shipping_threshold numeric(12,2) not null default 0 check (free_shipping_threshold >= 0),
  support_phone text,
  support_email text,
  updated_at timestamptz not null default now()
);

create table public.contact_settings (
  id uuid primary key default gen_random_uuid(),
  business_name text not null default 'Riya',
  phone text,
  email text,
  whatsapp text,
  address text,
  google_maps_url text,
  instagram_url text,
  facebook_url text,
  business_hours text,
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique check (order_number ~ '^RIYA-[0-9]+$'),
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text not null,
  shipping_address text not null,
  city text not null,
  district text not null,
  state text not null,
  pincode text not null check (pincode ~ '^[0-9]{6}$'),
  subtotal numeric(12,2) not null check (subtotal >= 0),
  shipping_fee numeric(12,2) not null check (shipping_fee >= 0),
  total numeric(12,2) not null check (total = subtotal + shipping_fee),
  payment_method public.payment_method not null default 'COD',
  payment_status public.payment_status not null default 'PENDING',
  status public.order_status not null default 'PENDING',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  variant_id uuid not null references public.product_variants(id) on delete restrict,
  product_name text not null,
  variant_name text not null,
  quantity integer not null check (quantity > 0 and quantity <= 100),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  total_price numeric(12,2) not null check (total_price = quantity * unit_price),
  created_at timestamptz not null default now()
);

create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status public.order_status not null,
  note text,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index products_category_id_idx on public.products(category_id);
create index products_active_idx on public.products(id) where is_active;
create index product_variants_product_id_idx on public.product_variants(product_id);
create index product_variants_active_idx on public.product_variants(product_id) where is_active;
create index orders_user_id_idx on public.orders(user_id) where user_id is not null;
create index orders_status_created_at_idx on public.orders(status, created_at desc);
create index orders_pending_created_at_idx on public.orders(created_at desc) where status = 'PENDING';
create index order_items_order_id_idx on public.order_items(order_id);
create index order_items_product_id_idx on public.order_items(product_id);
create index order_items_variant_id_idx on public.order_items(variant_id);
create index order_status_history_order_id_idx on public.order_status_history(order_id, created_at asc);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger categories_set_updated_at before update on public.categories for each row execute function public.set_updated_at();
create trigger products_set_updated_at before update on public.products for each row execute function public.set_updated_at();
create trigger product_variants_set_updated_at before update on public.product_variants for each row execute function public.set_updated_at();
create trigger store_settings_set_updated_at before update on public.store_settings for each row execute function public.set_updated_at();
create trigger contact_settings_set_updated_at before update on public.contact_settings for each row execute function public.set_updated_at();
create trigger orders_set_updated_at before update on public.orders for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.store_settings enable row level security;
alter table public.contact_settings enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;

create policy "profiles_select_own" on public.profiles for select to authenticated using (user_id = (select auth.uid()));
create policy "categories_public_read" on public.categories for select to anon, authenticated using (is_active);
create policy "products_public_read" on public.products for select to anon, authenticated using (is_active);
create policy "variants_public_read" on public.product_variants for select to anon, authenticated using (is_active);
create policy "store_settings_public_read" on public.store_settings for select to anon, authenticated using (true);
create policy "contact_settings_public_read" on public.contact_settings for select to anon, authenticated using (true);
create policy "orders_select_own" on public.orders for select to authenticated using (user_id = (select auth.uid()));
create policy "order_items_select_own" on public.order_items for select to authenticated using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = (select auth.uid())));
create policy "order_history_select_own" on public.order_status_history for select to authenticated using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = (select auth.uid())));

grant usage on schema public to anon, authenticated;
grant select on public.categories, public.products, public.product_variants, public.store_settings, public.contact_settings to anon, authenticated;
grant select on public.profiles to authenticated;
grant select on public.orders, public.order_items, public.order_status_history to authenticated;

insert into storage.buckets (id, name, public) values ('product-images', 'product-images', false)
on conflict (id) do nothing;
