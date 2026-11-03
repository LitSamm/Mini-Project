import Link from "next/link";

export default function MerchandisePaymentResultPage() {
  return (
    <main className="catalog-page">
      <section className="store-checkout store-order-confirmation section-shell" aria-labelledby="payment-result-heading">
        <p className="eyebrow">PEMBAYARAN MIDTRANS</p>
        <h1 id="payment-result-heading">Terima kasih atas pesananmu.</h1>
        <p>
          Status pembayaran akan diperbarui otomatis setelah Midtrans mengirim konfirmasi.
          Halaman ini bukan bukti pembayaran berhasil.
        </p>
        <Link className="text-link" href="/merchandise">Kembali ke merchandise</Link>
      </section>
    </main>
  );
}
