-- Demo-only data. Run after 001_initial_schema.sql with:
-- supabase db execute --file database/seed/development.sql
-- It is safe to run more than once and never creates customer/auth records.

insert into public.categories (name, slug, description, image_url)
values
  ('Gingelly Oil', 'gingelly-oil', 'Traditional cold-pressed sesame oil.', 'https://placehold.co/800x800?text=Gingelly+Oil'),
  ('Groundnut Oil', 'groundnut-oil', 'Fresh cold-pressed groundnut oil.', 'https://placehold.co/800x800?text=Groundnut+Oil'),
  ('Coconut Oil', 'coconut-oil', 'Pure coconut oil for cooking and care.', 'https://placehold.co/800x800?text=Coconut+Oil'),
  ('Sunflower Oil', 'sunflower-oil', 'Light everyday cooking oil.', 'https://placehold.co/800x800?text=Sunflower+Oil')
on conflict (slug) do update set name = excluded.name, description = excluded.description, image_url = excluded.image_url;

insert into public.products (name, slug, description, short_description, category_id, weight, ingredients, thumbnail_url, images, is_featured)
select v.name, v.slug, v.description, v.short_description, c.id, 'Available in multiple sizes', v.ingredients, v.thumbnail_url, jsonb_build_array(v.thumbnail_url), v.is_featured
from (values
  ('Cold Pressed Gingelly Oil', 'cold-pressed-gingelly-oil', 'Aromatic sesame oil, cold pressed in small batches for everyday South Indian cooking.', 'Pure cold-pressed sesame oil.', 'gingelly-oil', '100% sesame seeds', 'https://placehold.co/800x800?text=Gingelly+Oil', true),
  ('Cold Pressed Groundnut Oil', 'cold-pressed-groundnut-oil', 'Nutty, naturally filtered groundnut oil for frying, roasting and daily cooking.', 'Pure cold-pressed groundnut oil.', 'groundnut-oil', '100% groundnuts', 'https://placehold.co/800x800?text=Groundnut+Oil', true),
  ('Virgin Coconut Oil', 'virgin-coconut-oil', 'Clean coconut oil with a fresh aroma, suited for cooking and hair care.', 'Fresh virgin coconut oil.', 'coconut-oil', '100% coconuts', 'https://placehold.co/800x800?text=Coconut+Oil', false),
  ('Cold Pressed Sunflower Oil', 'cold-pressed-sunflower-oil', 'A light and versatile oil for everyday family meals.', 'Light cold-pressed sunflower oil.', 'sunflower-oil', '100% sunflower seeds', 'https://placehold.co/800x800?text=Sunflower+Oil', false)
) as v(name, slug, description, short_description, category_slug, ingredients, thumbnail_url, is_featured)
join public.categories c on c.slug = v.category_slug
on conflict (slug) do update set name = excluded.name, description = excluded.description, short_description = excluded.short_description, category_id = excluded.category_id, ingredients = excluded.ingredients, thumbnail_url = excluded.thumbnail_url, images = excluded.images, is_featured = excluded.is_featured;

insert into public.product_variants (product_id, name, size, unit, sku, price, sale_price, stock)
select p.id, v.name, v.size, v.unit, v.sku, v.price, v.sale_price, v.stock
from (values
  ('cold-pressed-gingelly-oil', '500ml', 500, 'ml', 'DEMO-GING-500', 210, 199, 40), ('cold-pressed-gingelly-oil', '1L', 1, 'L', 'DEMO-GING-1L', 390, 375, 50), ('cold-pressed-gingelly-oil', '5L', 5, 'L', 'DEMO-GING-5L', 1650, 1599, 15),
  ('cold-pressed-groundnut-oil', '500ml', 500, 'ml', 'DEMO-GROUND-500', 190, null, 45), ('cold-pressed-groundnut-oil', '1L', 1, 'L', 'DEMO-GROUND-1L', 360, 345, 50), ('cold-pressed-groundnut-oil', '5L', 5, 'L', 'DEMO-GROUND-5L', 1550, 1499, 20),
  ('virgin-coconut-oil', '500ml', 500, 'ml', 'DEMO-COCO-500', 280, 265, 30), ('virgin-coconut-oil', '1L', 1, 'L', 'DEMO-COCO-1L', 520, 499, 35),
  ('cold-pressed-sunflower-oil', '500ml', 500, 'ml', 'DEMO-SUN-500', 160, null, 60), ('cold-pressed-sunflower-oil', '1L', 1, 'L', 'DEMO-SUN-1L', 300, 285, 55)
) as v(product_slug, name, size, unit, sku, price, sale_price, stock)
join public.products p on p.slug = v.product_slug
on conflict (sku) do update set price = excluded.price, sale_price = excluded.sale_price, stock = excluded.stock, is_active = true;

insert into public.store_settings (store_name, currency, shipping_fee, free_shipping_threshold, support_phone, support_email)
select 'Riya Demo Store', 'INR', 50, 999, '9876543210', 'support@riya.demo'
where not exists (select 1 from public.store_settings);

insert into public.contact_settings (business_name, phone, email, whatsapp, address, google_maps_url, instagram_url, facebook_url, business_hours)
select 'Riya Demo Store', '9876543210', 'hello@riya.demo', '919876543210', '123 Market Road, Coimbatore, Tamil Nadu - 641001', 'https://maps.google.com', 'https://instagram.com/riya.demo', 'https://facebook.com/riya.demo', 'Mon-Sat, 9:00 AM - 6:00 PM'
where not exists (select 1 from public.contact_settings);
