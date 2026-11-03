-- Align the live catalog with the approved RAB and supplied product photos.
-- This intentionally resets available stock to the full RAB quantities.

begin;

do $$
declare
  v_updated_count integer;
begin
  update public.products as product
  set
    price_idr = catalog.price_idr,
    stock = catalog.stock,
    image = catalog.image,
    image_alt = catalog.image_alt,
    status = 'Available',
    updated_at = now()
  from (values
    (
      'team-tee',
      155000::bigint,
      40,
      '/images/workshirt.png',
      'Workshirt hitam Anargya ITS EV Team tampak depan dan belakang'
    ),
    (
      'team-tumbler',
      15000::bigint,
      100,
      '/images/keychain-mobill.png',
      'Koleksi blindpack keychain Anargya ITS dengan beberapa desain dan kemasan warna-warni'
    ),
    (
      'carabiner-car',
      60000::bigint,
      10,
      '/images/carabiner.png',
      'Carabiner hijau Anargya dengan gantungan mobil mini dan manik nama tim'
    ),
    (
      'sticker-pack',
      10000::bigint,
      110,
      '/images/sticker.png',
      'Lembar stiker Anargya ITS EV Team dengan desain mobil dan tim balap'
    ),
    (
      'enamel-pin',
      25000::bigint,
      55,
      '/images/enamel-pin.png',
      'Tiga pin enamel Anargya ITS EV Team dengan kartu desain berwarna'
    )
  ) as catalog(id, price_idr, stock, image, image_alt)
  where product.id = catalog.id;

  get diagnostics v_updated_count = row_count;
  if v_updated_count <> 5 then
    raise exception 'Expected to update 5 RAB products, but updated %.', v_updated_count;
  end if;
end;
$$;

commit;
