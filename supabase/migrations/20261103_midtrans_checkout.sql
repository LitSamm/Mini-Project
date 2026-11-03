-- Safe upgrade for an existing store. Unlike schema.sql, this migration does
-- not reseed products or overwrite inventory.

alter table public.orders
  add column if not exists payment_reference text;

create unique index if not exists orders_payment_reference_key
  on public.orders (payment_reference);

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

revoke all on function public.create_order(text, text, text, text, text, jsonb)
  from public, anon, authenticated;
grant execute on function public.create_order(text, text, text, text, text, jsonb)
  to service_role;
revoke all on function public.apply_midtrans_payment_event(uuid, text)
  from public, anon, authenticated;
grant execute on function public.apply_midtrans_payment_event(uuid, text)
  to service_role;
