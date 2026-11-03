"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ArrowRightIcon from "@/components/arrow-right-icon";
import Reveal from "@/components/reveal";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { createOrder, type CheckoutState } from "@/app/merchandise/actions";
import { formatPrice, isProductAvailable, type Product } from "@/lib/merchandise";

const filters = ["Semua produk", "Tersedia", "Stok habis"] as const;
type Filter = (typeof filters)[number];
const initialCheckoutState: CheckoutState = {};

type CartLine = {
  key: string;
  product: Product;
  quantity: number;
  variant: string | null;
};

type MerchandiseExperienceProps = {
  products: Product[];
  orderEnabled: boolean;
};

function ProductArtwork({ product }: { product: Product }) {
  return (
    <div className="product-art">
      <Image
        className="product-photo"
        src={product.image}
        alt={product.imageAlt}
        fill
        sizes="(max-width: 680px) 90vw, (max-width: 900px) 45vw, 29vw"
      />
    </div>
  );
}

export default function MerchandiseExperience({ products, orderEnabled }: MerchandiseExperienceProps) {
  const [filter, setFilter] = useState<Filter>("Semua produk");
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [cart, setCart] = useState<Record<string, CartLine>>({});
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [checkoutState, checkoutAction, isSubmitting] = useActionState(createOrder, initialCheckoutState);

  useEffect(() => {
    if (checkoutState.order?.paymentUrl) {
      window.location.assign(checkoutState.order.paymentUrl);
    }
  }, [checkoutState.order]);

  const visibleProducts = useMemo(
    () =>
      products.filter((product) => (
        filter === "Semua produk"
        || (filter === "Tersedia" && product.status === "Available")
        || (filter === "Stok habis" && product.status === "Sold Out")
      )),
    [filter, products],
  );
  const selected = products.find((product) => product.id === selectedProduct);
  const cartItems = Object.values(cart);
  const cartTotal = cartItems.reduce((total, item) => total + item.product.priceIdr * item.quantity, 0);

  return (
    <>
      <SiteHeader />
      <main className="catalog-page">
        <section className="catalog-intro section-shell">
          <Link className="back-link" href="/#merchandise"><span className="direction-mark" aria-hidden="true">&lt;</span>Back to Anargya</Link>
          <Reveal className="eyebrow">ANARGYA · TEAM GOODS</Reveal>
          <Reveal className="catalog-title-row">
            <h1>Made for the<br /><em>long way around.</em></h1>
            <p>Produk resmi Anargya ITS. Pilih item dan checkout untuk membuat pesanan.</p>
          </Reveal>
          <div className="catalog-meta"><span>THE ANARGYA CATALOGUE</span><span>01 — 05</span></div>
        </section>

        <section className="catalog-list section-shell" aria-label="Merchandise catalogue">
          <Reveal className="catalog-toolbar">
            <p>{visibleProducts.length} {visibleProducts.length === 1 ? "piece" : "pieces"}</p>
            <div className="catalog-filters" aria-label="Filter by availability">
              {filters.map((option) => (
                <button
                  type="button"
                  className={filter === option ? "filter-button is-active" : "filter-button"}
                  key={option}
                  aria-pressed={filter === option}
                  onClick={() => {
                    setFilter(option);
                    setSelectedProduct(null);
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </Reveal>

          {!orderEnabled && (
            <p className="store-setup-note" role="status">
              Checkout belum dikonfigurasi di Vercel. Administrator perlu mengatur NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY, menjalankan schema toko di Supabase, lalu deploy ulang.
            </p>
          )}

          <div className="catalog-grid">
            {visibleProducts.map((product, index) => (
              <Reveal
                className="catalog-reveal"
                key={product.id}
                style={{ transitionDelay: `${index * 90}ms` }}
              >
                <article className="catalog-card">
                  <ProductArtwork product={product} />
                  <div className="catalog-product-info">
                    <div className="catalog-product-topline">
                      <span>{product.category} · 0{index + 1}</span>
                      <span className={`catalog-card-status ${product.status === "Available" ? "is-available" : "is-sold-out"}`}>
                        {product.stock === 0 ? "Stok habis" : product.status === "Available" ? "Tersedia" : "Stok habis"}
                      </span>
                    </div>
                    <h2>{product.name}</h2>
                    <p>{product.description}</p>
                    {product.variantOptions.length > 0 && (
                      <fieldset className="catalog-variant-select">
                        <legend>Pilih ukuran</legend>
                        <div className="catalog-size-options">
                          {product.variantOptions.map((variant) => (
                            <button
                              aria-pressed={selectedVariants[product.id] === variant}
                              className={selectedVariants[product.id] === variant ? "catalog-size-option is-selected" : "catalog-size-option"}
                              disabled={!isProductAvailable(product)}
                              key={variant}
                              onClick={() => setSelectedVariants((current) => ({
                                ...current,
                                [product.id]: variant,
                              }))}
                              type="button"
                            >
                              {variant}
                            </button>
                          ))}
                        </div>
                      </fieldset>
                    )}
                    <div className="catalog-price-row">
                      <p className="catalog-product-price">{formatPrice(product.priceIdr)}</p>
                      <button
                        type="button"
                        className="product-detail-button"
                        aria-label={`${selectedProduct === product.id ? "Tutup detail" : "Lihat detail"} ${product.name}`}
                        aria-expanded={selectedProduct === product.id}
                        onClick={() => setSelectedProduct(selectedProduct === product.id ? null : product.id)}
                      >
                        {selectedProduct === product.id ? "Tutup detail" : "Lihat detail"}
                        {selectedProduct === product.id ? (
                          <span aria-hidden="true">−</span>
                        ) : (
                          <ArrowRightIcon />
                        )}
                      </button>
                    </div>
                    <button
                      className="catalog-add-button"
                      disabled={!orderEnabled
                        || !isProductAvailable(product)
                        || (product.variantOptions.length > 0 && !selectedVariants[product.id])}
                      onClick={() => setCart((current) => {
                        const variant = selectedVariants[product.id] || null;
                        const key = `${product.id}::${variant ?? ""}`;
                        const previous = current[key];
                        return {
                          ...current,
                          [key]: {
                            key,
                            product,
                            variant,
                            quantity: Math.min(
                              (previous?.quantity ?? 0) + 1,
                              product.stock ?? 20,
                              20,
                            ),
                          },
                        };
                      })}
                      type="button"
                    >
                      {!isProductAvailable(product)
                        ? product.stock === 0 ? "Stok habis" : "Belum tersedia"
                        : (product.variantOptions.length > 0 && !selectedVariants[product.id])
                          ? "Pilih ukuran terlebih dahulu"
                          : "Tambah ke keranjang"}
                    </button>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          {selected && (
            <Reveal className="product-detail-panel" aria-live="polite">
              <div>
                <p className="eyebrow">PRODUCT NOTE</p>
                <h2>{selected.name}</h2>
                <p>{selected.description}</p>
              </div>
              <div className="detail-availability">
                <span>Ketersediaan</span><strong>{selected.status === "Available" ? "Tersedia" : "Stok habis"}</strong>
              </div>
              <p className="catalog-note">
                Harga dan stok terbaru ditampilkan pada katalog. Ongkos kirim gratis atau pesanan dapat diambil sendiri.
              </p>
            </Reveal>
          )}

          {checkoutState.order ? (
            <section className="store-checkout store-order-confirmation" aria-live="polite">
              <p className="eyebrow">MENGALIHKAN KE MIDTRANS</p>
              <h2>Lanjutkan pembayaran pesanan.</h2>
              <p>Nomor pesanan <strong>{checkoutState.order.reference.slice(0, 8).toUpperCase()}</strong></p>
              <p>Total pesanan: <strong>{formatPrice(checkoutState.order.totalIdr)}</strong></p>
              <p>Jika halaman pembayaran tidak terbuka, lanjutkan melalui tautan ini.</p>
              <a href={checkoutState.order.paymentUrl}>Buka pembayaran Midtrans</a>
            </section>
          ) : checkoutState.pendingOrder ? (
            <section className="store-checkout store-order-confirmation" aria-live="polite">
              <p className="eyebrow">PEMBAYARAN PERLU DIKONFIRMASI</p>
              <h2>Jangan kirim pesanan ulang dulu.</h2>
              <p>Nomor pesanan <strong>{checkoutState.pendingOrder.reference.slice(0, 8).toUpperCase()}</strong></p>
              <p>{checkoutState.error}</p>
              <a href={`mailto:contact@anargyaits.com?subject=${encodeURIComponent(`Pesanan merchandise ${checkoutState.pendingOrder.reference.slice(0, 8).toUpperCase()}`)}`}>
                Hubungi tim merchandise melalui email
              </a>
            </section>
          ) : cartItems.length > 0 && (
            <section className="store-checkout" aria-labelledby="checkout-heading">
              <div className="store-checkout-heading">
                <p className="eyebrow">YOUR ORDER</p>
                <h2 id="checkout-heading">Keranjang &amp; checkout</h2>
                <p>Pembayaran diproses dengan aman melalui halaman Midtrans. Ongkos kirim gratis atau pesanan dapat diambil sendiri.</p>
              </div>
              <ul className="store-cart-list">
                {cartItems.map(({ key, product, quantity, variant }) => (
                  <li className="store-cart-item" key={key}>
                    <div>
                      <strong>{product.name}</strong>
                      {variant && <span>Ukuran: {variant}</span>}
                      <span>{formatPrice(product.priceIdr)}</span>
                    </div>
                    <label>
                      Jumlah
                      <input
                        aria-label={`Jumlah ${product.name}${variant ? ` ukuran ${variant}` : ""}`}
                        max={Math.min(product.stock ?? 20, 20)}
                        min="0"
                        onChange={(event) => {
                          const quantity = Number(event.target.value);
                          setCart((current) => {
                            const next = { ...current };
                            if (quantity > 0) {
                              next[key] = { ...current[key], quantity };
                            } else {
                              delete next[key];
                            }
                            return next;
                          });
                        }}
                        type="number"
                        value={quantity}
                      />
                    </label>
                  </li>
                ))}
              </ul>
              <p className="store-cart-total">
                <span>Subtotal produk</span>
                <strong>{formatPrice(cartTotal)}</strong>
              </p>
              <p className="store-shipping-note">Biaya pengiriman dihitung dan dikonfirmasi melalui email.</p>
              <form action={checkoutAction} className="store-checkout-form">
                <input name="items" type="hidden" value={JSON.stringify(cartItems.map((product) => ({
                  id: product.product.id,
                  quantity: product.quantity,
                  variant: product.variant,
                })))} />
                <label>
                  Nama lengkap
                  <input autoComplete="name" maxLength={100} name="customer_name" required />
                </label>
                <label>
                  Email untuk konfirmasi
                  <input autoComplete="email" maxLength={254} name="customer_email" required type="email" />
                </label>
                <label>
                  Nomor telepon (opsional)
                  <input autoComplete="tel" maxLength={30} name="customer_phone" type="tel" />
                </label>
                <label className="store-address-field">
                  Alamat pengiriman
                  <textarea autoComplete="street-address" maxLength={500} name="delivery_address" required rows={3} />
                </label>
                <label className="store-address-field">
                  Catatan (opsional)
                  <textarea maxLength={500} name="notes" rows={2} />
                </label>
                {checkoutState.error && <p className="admin-form-error store-checkout-error" role="alert">{checkoutState.error}</p>}
                <button className="catalog-add-button store-submit-button" disabled={isSubmitting || !orderEnabled} type="submit">
                  {isSubmitting ? "Menyiapkan pembayaran..." : orderEnabled ? "Bayar dengan Midtrans" : "Pembayaran belum tersedia"}
                </button>
                <p className="store-privacy-note">
                  Data kontak dan alamat hanya digunakan untuk memproses pesanan ini.
                </p>
              </form>
            </section>
          )}
        </section>

        <Reveal className="catalog-footnote section-shell">
          <span>TEAM GOODS, NOT JUST TEAM GEAR.</span>
          <Link className="text-link" href="https://www.instagram.com/anargya.its/" target="_blank">
            Follow availability updates
          </Link>
        </Reveal>
      </main>
      <SiteFooter />
    </>
  );
}
