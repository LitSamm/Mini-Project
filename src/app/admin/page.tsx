import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { logoutAdmin, updateOrderStatus, updateProduct } from "@/app/admin/actions";
import { getProducts } from "@/lib/products";
import { prisma } from "@/lib/prisma";
import { formatPrice, type ProductStatus } from "@/lib/merchandise";
import { hasMerchandiseStoreConfig, isAdminEmail } from "@/lib/supabase/config";
import { getAdminUser } from "@/lib/supabase/server";

type Order = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  delivery_address: string;
  notes: string;
  total_idr: number;
  status: string;
  created_at: string;
};

type OrderItem = {
  order_id: string;
  product_name: string;
  quantity: number;
  unit_price_idr: number;
  variant: string | null;
};

const productStatuses: ProductStatus[] = ["Available", "Sold Out"];
const orderStatuses = ["Awaiting Payment", "Paid", "Preparing", "Shipped", "Completed", "Cancelled"];

export default function AdminPage() {
  return (
    <Suspense fallback={<main className="admin-page" aria-busy="true">Loading admin dashboard…</main>}>
      <AdminDashboard />
    </Suspense>
  );
}

async function AdminDashboard() {
  await connection();

  if (!hasMerchandiseStoreConfig()) {
    return (
      <main className="admin-page">
        <section className="admin-shell">
          <Link className="admin-back-link" href="/">← Kembali ke Anargya</Link>
          <p className="eyebrow">ANARGYA · STORE MANAGEMENT</p>
          <h1>Admin setup diperlukan</h1>
          <p className="admin-muted">
            Hubungkan project Supabase dan isi environment variables mengikuti panduan di README sebelum mengelola toko.
          </p>
          <Link className="admin-primary-button admin-inline-button" href="/admin/login">Ke halaman masuk</Link>
        </section>
      </main>
    );
  }

  const user = await getAdminUser();
  if (!isAdminEmail(user?.email)) redirect("/admin/login");

  const [products, orders] = await Promise.all([
    getProducts(),
    prisma.order.findMany({
      include: {
        items: {
          select: {
            productName: true,
            quantity: true,
            unitPriceIdr: true,
            variant: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  const typedOrders: Order[] = orders.map((order) => ({
    id: order.id,
    customer_name: order.customerName,
    customer_email: order.customerEmail,
    customer_phone: order.customerPhone,
    delivery_address: order.deliveryAddress,
    notes: order.notes,
    total_idr: Number(order.totalIdr),
    status: order.status,
    created_at: order.createdAt.toISOString(),
  }));
  const itemsByOrder = new Map<string, OrderItem[]>();
  for (const order of orders) {
    const items = order.items.map((item) => ({
      order_id: order.id,
      product_name: item.productName,
      quantity: item.quantity,
      unit_price_idr: Number(item.unitPriceIdr),
      variant: item.variant,
    }));
    itemsByOrder.set(order.id, items);
  }

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <header className="admin-header">
          <div>
            <Link className="admin-back-link" href="/">← Kembali ke Anargya</Link>
            <p className="eyebrow">ANARGYA · STORE MANAGEMENT</p>
            <h1>Admin dashboard</h1>
            <p className="admin-muted">Masuk sebagai {user?.email}</p>
          </div>
          <form action={logoutAdmin}>
            <button className="admin-secondary-button" type="submit">Keluar</button>
          </form>
        </header>

        <section className="admin-section" aria-labelledby="products-heading">
          <div className="admin-section-heading">
            <div>
              <p className="eyebrow">INVENTORY</p>
              <h2 id="products-heading">Produk</h2>
            </div>
            <Link className="admin-secondary-button admin-inline-button" href="/merchandise" target="_blank">
              Lihat katalog
            </Link>
          </div>
          <p className="admin-muted">
            Semua produk berstatus Tersedia dapat dibeli. Harga wajib diisi; stok kosong berarti tidak dibatasi.
          </p>
          <div className="admin-product-list">
            {products.map((product) => (
              <form action={updateProduct} className="admin-product-form" key={product.id}>
                <input name="id" type="hidden" value={product.id} />
                <div className="admin-product-title">
                  <h3>{product.name}</h3>
                  <span>{formatPrice(product.priceIdr)}</span>
                </div>
                <div className="admin-fields-grid">
                  <label>
                    Nama produk
                    <input defaultValue={product.name} maxLength={100} name="name" required />
                  </label>
                  <label>
                    Kategori
                    <input defaultValue={product.category} maxLength={60} name="category" required />
                  </label>
                  <label>
                    Harga (IDR)
                    <input defaultValue={product.priceIdr} min="1" name="price_idr" placeholder="Contoh: 150000" step="1000" type="number" required />
                  </label>
                  <label>
                    Stok
                    <input defaultValue={product.stock ?? ""} min="0" name="stock" placeholder="Kosong = tanpa batas" type="number" />
                  </label>
                  <label>
                    Status
                    <select defaultValue={product.status} name="status">
                      {productStatuses.map((status) => <option key={status} value={status}>{status === "Available" ? "Tersedia" : "Stok habis"}</option>)}
                    </select>
                  </label>
                  <label>
                    Varian (pisahkan dengan koma)
                    <input defaultValue={product.variantOptions.join(", ")} maxLength={200} name="variant_options" placeholder="Contoh: S, M, L, XL" />
                  </label>
                  <label className="admin-description-field">
                    Deskripsi
                    <textarea defaultValue={product.description} maxLength={500} name="description" required rows={2} />
                  </label>
                </div>
                <button className="admin-primary-button" type="submit">Simpan produk</button>
              </form>
            ))}
          </div>
        </section>

        <section className="admin-section" aria-labelledby="orders-heading">
          <div className="admin-section-heading">
            <div>
              <p className="eyebrow">FULFILLMENT</p>
              <h2 id="orders-heading">Pesanan <span className="admin-count">{typedOrders.length}</span></h2>
            </div>
          </div>
          {typedOrders.length === 0 ? (
            <p className="admin-empty-state">Belum ada pesanan masuk.</p>
          ) : (
            <div className="admin-order-list">
              {typedOrders.map((order) => (
                <article className="admin-order-card" key={order.id}>
                  <div className="admin-order-heading">
                    <div>
                      <p className="eyebrow">ORDER · {order.id.slice(0, 8).toUpperCase()}</p>
                      <h3>{order.customer_name}</h3>
                      <time dateTime={order.created_at}>
                        {new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(order.created_at))}
                      </time>
                    </div>
                    <strong>{formatPrice(order.total_idr)}</strong>
                  </div>
                  <p className="admin-order-contact">
                    <a href={`mailto:${encodeURIComponent(order.customer_email)}?subject=${encodeURIComponent(`Pesanan merchandise ${order.id.slice(0, 8).toUpperCase()}`)}`}>
                      {order.customer_email}
                    </a>
                    {order.customer_phone && <span>Telepon: {order.customer_phone}</span>}
                    <span>{order.delivery_address}</span>
                  </p>
                  <ul className="admin-order-items">
                    {(itemsByOrder.get(order.id) ?? []).map((item, index) => (
                      <li key={`${order.id}-${index}`}>
                        {item.product_name}{item.variant ? ` (${item.variant})` : ""} × {item.quantity} · {formatPrice(item.unit_price_idr * item.quantity)}
                      </li>
                    ))}
                  </ul>
                  {order.notes && <p className="admin-muted">Catatan: {order.notes}</p>}
                  <form action={updateOrderStatus} className="admin-order-status-form">
                    <input name="id" type="hidden" value={order.id} />
                    <label>
                      Status pesanan
                      <select defaultValue={order.status} name="status">
                        {orderStatuses.map((status) => <option key={status}>{status}</option>)}
                      </select>
                    </label>
                    <button className="admin-secondary-button" type="submit">Perbarui status</button>
                  </form>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
