create table if not exists public.products (
  id text primary key,
  name text not null,
  category text not null,
  status text not null check (status in ('Available', 'Sold Out')),
  description text not null,
  image text not null,
  image_alt text not null,
  price_idr bigint not null check (price_idr between 1 and 1000000000000),
  stock integer check (stock is null or stock >= 0),
  variant_options text[] not null default '{}',
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  payment_reference text unique,
  customer_name text not null,
  customer_email text not null default '',
  customer_phone text,
  delivery_address text not null,
  notes text not null default '',
  total_idr bigint not null check (total_idr > 0),
  status text not null default 'Awaiting Payment'
    check (status in ('Awaiting Payment', 'Paid', 'Preparing', 'Shipped', 'Completed', 'Cancelled')),
  created_at timestamptz not null default now()
);

alter table public.orders add column if not exists payment_reference text;
create unique index if not exists orders_payment_reference_key
  on public.orders (payment_reference);

create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null references public.products(id),
  product_name text not null,
  quantity integer not null check (quantity between 1 and 20),
  unit_price_idr bigint not null check (unit_price_idr > 0),
  variant text
);

alter table public.products add column if not exists variant_options text[] not null default '{}';
alter table public.orders add column if not exists customer_email text not null default '';
alter table public.orders alter column customer_phone drop not null;
alter table public.orders alter column total_idr drop not null;
alter table public.order_items add column if not exists variant text;
alter table public.order_items alter column unit_price_idr drop not null;

alter table public.products drop constraint if exists products_status_check;
update public.products
set status = 'Available'
where status in ('Coming Soon', 'Open Pre-Order', 'Sold Out');
update public.products
set price_idr = case id
  when 'team-tee' then 155000
  when 'team-tumbler' then 15000
  when 'sticker-pack' then 10000
  when 'carabiner-car' then 60000
  when 'enamel-pin' then 25000
  else price_idr
end
where id in ('team-tee', 'team-tumbler', 'sticker-pack', 'carabiner-car', 'enamel-pin')
  and price_idr is null;
alter table public.products alter column price_idr set not null;
alter table public.products add constraint products_status_check
  check (status in ('Available', 'Sold Out'));

alter table public.orders drop constraint if exists orders_status_check;
update public.orders
set status = case status
  when 'Pending' then 'Awaiting Payment'
  when 'Confirmed' then 'Paid'
  when 'Awaiting Price' then 'Awaiting Payment'
  else status
end;
update public.order_items oi
set unit_price_idr = p.price_idr
from public.products p
where oi.product_id = p.id and oi.unit_price_idr is null;
update public.orders o
set total_idr = coalesce((
  select sum(oi.quantity * oi.unit_price_idr)
  from public.order_items oi
  where oi.order_id = o.id
), o.total_idr, 1)
where o.total_idr is null;
alter table public.orders alter column total_idr set not null;
alter table public.orders alter column status set default 'Awaiting Payment';
alter table public.orders drop constraint if exists orders_total_positive;
alter table public.orders add constraint orders_total_positive check (total_idr > 0);
alter table public.orders add constraint orders_status_check
  check (status in ('Awaiting Payment', 'Paid', 'Preparing', 'Shipped', 'Completed', 'Cancelled'));
alter table public.order_items alter column unit_price_idr set not null;
alter table public.order_items drop constraint if exists order_items_unit_price_positive;
alter table public.order_items add constraint order_items_unit_price_positive check (unit_price_idr > 0);

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

grant select, insert, update, delete on public.products, public.orders, public.order_items to service_role;
grant usage, select on sequence public.order_items_id_seq to service_role;

insert into public.products (
  id, name, category, status, description, image, image_alt, price_idr, stock, variant_options, sort_order
) values
  (
    'team-tee', 'Workshirt', 'Apparel', 'Available',
    'Workshirt resmi Anargya ITS EV Team dengan desain Mark 6.0.',
    '/images/workshirt.png', 'Workshirt hitam Anargya ITS EV Team tampak depan dan belakang',
    155000, 40, '{}', 1
  ),
  (
    'team-tumbler', 'Blindpack keychain', 'Accessories', 'Available',
    'Gantungan kunci blindpack bertema mobil Formula EV Anargya.',
    '/images/keychain-mobill.png', 'Koleksi blindpack keychain Anargya ITS dengan beberapa desain dan kemasan warna-warni',
    15000, 100, '{}', 2
  ),
  (
    'carabiner-car', 'Carabiner car', 'Accessories', 'Available',
    'Gantungan carabiner mobil Formula EV Anargya.',
    '/images/carabiner.png', 'Carabiner hijau Anargya dengan gantungan mobil mini dan manik nama tim',
    60000, 10, '{}', 3
  ),
  (
    'sticker-pack', 'Sticker', 'Accessories', 'Available',
    'Koleksi stiker Anargya ITS EV Team bertema mobil dan balap.',
    '/images/sticker.png', 'Lembar stiker Anargya ITS EV Team dengan desain mobil dan tim balap',
    10000, 110, '{}', 4
  ),
  (
    'enamel-pin', 'Enamel pin', 'Accessories', 'Available',
    'Pin enamel Anargya ITS EV Team dengan beberapa desain tim.',
    '/images/enamel-pin.png', 'Tiga pin enamel Anargya ITS EV Team dengan kartu desain berwarna',
    25000, 55, '{}', 5
  )
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  status = excluded.status,
  description = excluded.description,
  image = excluded.image,
  image_alt = excluded.image_alt,
  price_idr = excluded.price_idr,
  stock = excluded.stock,
  variant_options = excluded.variant_options,
  sort_order = excluded.sort_order,
  updated_at = now();

drop function if exists public.create_order(text, text, text, text, jsonb);
drop function if exists public.create_order(text, text, text, text, text, jsonb);
create or replace function public.create_order(
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_delivery_address text,
  p_notes text,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item jsonb;
  v_product public.products%rowtype;
  v_order_id uuid;
  v_payment_reference text;
  v_quantity integer;
  v_product_quantity integer;
  v_total bigint := 0;
  v_count integer := 0;
begin
  if length(trim(coalesce(p_customer_name, ''))) not between 2 and 100
    or length(trim(coalesce(p_customer_email, ''))) not between 5 and 254
    or p_customer_email !~ '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$'
    or length(coalesce(p_customer_phone, '')) > 30
    or length(trim(coalesce(p_delivery_address, ''))) not between 5 and 500
    or length(coalesce(p_notes, '')) > 500 then
    raise exception 'Please check the customer and delivery details.';
  end if;

  if p_items is null
    or jsonb_typeof(p_items) <> 'array'
    or jsonb_array_length(p_items) not between 1 and 20 then
    raise exception 'The cart is empty or contains too many products.';
  end if;

  if (
    select count(distinct (item->>'id') || ':' || coalesce(item->>'variant', ''))
    from jsonb_array_elements(p_items) as items(item)
  ) <> jsonb_array_length(p_items) then
    raise exception 'Each product may only appear once in the cart.';
  end if;

  for v_item in
    select value from jsonb_array_elements(p_items)
  loop
    if jsonb_typeof(v_item) <> 'object'
      or coalesce(v_item->>'id', '') !~ '^[a-z0-9-]{1,60}$'
      or coalesce(v_item->>'quantity', '') !~ '^[1-9][0-9]?$'
      or (v_item->'variant' is not null and jsonb_typeof(v_item->'variant') not in ('null', 'string'))
      or length(coalesce(v_item->>'variant', '')) > 40 then
      raise exception 'A product or quantity is invalid.';
    end if;

    if (v_item->>'quantity')::integer > 20 then
      raise exception 'A maximum of 20 units may be ordered per product.';
    end if;
  end loop;

  for v_item in
    select value from jsonb_array_elements(p_items) order by value->>'id'
  loop
    v_quantity := (v_item->>'quantity')::integer;

    select * into v_product
    from public.products
    where id = v_item->>'id'
    for update;

    if not found or v_product.status <> 'Available' then
      raise exception 'A product in your cart is not available for purchase.';
    end if;

    select sum((item->>'quantity')::integer)
    into v_product_quantity
    from jsonb_array_elements(p_items) as items(item)
    where item->>'id' = v_product.id;

    if (
      cardinality(v_product.variant_options) = 0 and nullif(v_item->>'variant', '') is not null
    ) or (
      cardinality(v_product.variant_options) > 0
      and not coalesce(nullif(v_item->>'variant', '') = any(v_product.variant_options), false)
    ) then
      raise exception 'The selected product has an invalid variant.';
    end if;

    if v_product.stock is not null and v_product.stock < v_product_quantity then
      raise exception 'A product in your cart does not have enough stock.';
    end if;

    v_total := v_total + v_product.price_idr * v_quantity;
    v_count := v_count + 1;
  end loop;

  loop
    v_payment_reference := 'AN' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 28));
    exit when not exists (
      select 1 from public.orders where payment_reference = v_payment_reference
    );
  end loop;

  insert into public.orders (
    payment_reference, customer_name, customer_email, customer_phone, delivery_address, notes, total_idr, status
  ) values (
    v_payment_reference,
    trim(p_customer_name),
    lower(trim(p_customer_email)),
    trim(p_customer_phone),
    trim(p_delivery_address),
    trim(coalesce(p_notes, '')),
    v_total,
    'Awaiting Payment'
  ) returning id into v_order_id;

  for v_item in
    select value from jsonb_array_elements(p_items) order by value->>'id'
  loop
    v_quantity := (v_item->>'quantity')::integer;

    select * into v_product
    from public.products
    where id = v_item->>'id'
    for update;

    insert into public.order_items (
      order_id, product_id, product_name, quantity, unit_price_idr, variant
    ) values (
      v_order_id, v_product.id, v_product.name, v_quantity, v_product.price_idr,
      nullif(v_item->>'variant', '')
    );

    if v_product.stock is not null then
      update public.products
      set stock = stock - v_quantity, updated_at = now()
      where id = v_product.id;
    end if;
  end loop;

  return jsonb_build_object(
    'order_id', v_order_id,
    'payment_reference', v_payment_reference,
    'total_idr', v_total,
    'item_count', v_count
  );
end;
$$;

create or replace function public.apply_midtrans_payment_event(
  p_order_id uuid,
  p_event text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_item record;
begin
  if p_event not in ('Paid', 'Cancelled') then
    raise exception 'The Midtrans payment event is invalid.';
  end if;

  select * into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'The requested order could not be found.';
  end if;

  if p_event = 'Paid' then
    if v_order.status = 'Awaiting Payment' then
      update public.orders set status = 'Paid' where id = p_order_id;
    elsif v_order.status = 'Cancelled' then
      raise exception 'Midtrans reported payment for a cancelled order.';
    end if;
    return;
  end if;

  if v_order.status <> 'Awaiting Payment' then
    return;
  end if;

  for v_item in
    select product_id, quantity
    from public.order_items
    where order_id = p_order_id
    order by product_id
  loop
    update public.products
    set stock = stock + v_item.quantity, updated_at = now()
    where id = v_item.product_id and stock is not null;
  end loop;

  update public.orders set status = 'Cancelled' where id = p_order_id;
end;
$$;

create or replace function public.update_order_status(
  p_order_id uuid,
  p_status text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_item record;
begin
  if p_status not in ('Awaiting Payment', 'Paid', 'Preparing', 'Shipped', 'Completed', 'Cancelled') then
    raise exception 'The requested order status is invalid.';
  end if;

  select * into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'The requested order could not be found.';
  end if;

  if v_order.status = 'Cancelled' and p_status <> 'Cancelled' then
    for v_item in
      select product_id, quantity
      from public.order_items
      where order_id = p_order_id
      order by product_id
    loop
      update public.products
      set stock = stock - v_item.quantity, updated_at = now()
      where id = v_item.product_id
        and stock is not null
        and stock >= v_item.quantity;

      if not found and exists (
        select 1 from public.products
        where id = v_item.product_id and stock is not null
      ) then
        raise exception 'There is not enough stock to reopen this order.';
      end if;
    end loop;
  elsif v_order.status <> 'Cancelled' and p_status = 'Cancelled' then
    for v_item in
      select product_id, quantity
      from public.order_items
      where order_id = p_order_id
      order by product_id
    loop
      update public.products
      set stock = stock + v_item.quantity, updated_at = now()
      where id = v_item.product_id and stock is not null;
    end loop;
  end if;

  update public.orders
  set status = p_status
  where id = p_order_id;
end;
$$;

revoke all on function public.create_order(text, text, text, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.create_order(text, text, text, text, text, jsonb) to service_role;
revoke all on function public.update_order_status(uuid, text) from public, anon, authenticated;
grant execute on function public.update_order_status(uuid, text) to service_role;
drop function if exists public.apply_doku_payment_event(uuid, text);
revoke all on function public.apply_midtrans_payment_event(uuid, text) from public, anon, authenticated;
grant execute on function public.apply_midtrans_payment_event(uuid, text) to service_role;
