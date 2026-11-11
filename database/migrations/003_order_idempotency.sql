-- Lets checkout retry safely: the same key always maps to the same order.
alter table public.orders add column if not exists idempotency_key uuid;
create unique index if not exists orders_idempotency_key_idx
  on public.orders(idempotency_key) where idempotency_key is not null;
