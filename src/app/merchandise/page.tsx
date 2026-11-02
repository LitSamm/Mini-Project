import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import MerchandiseExperience from "@/components/merchandise-experience";
import { getProducts } from "@/lib/products";
import { hasMerchandiseStoreConfig } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Merchandise — Anargya ITS",
  description: "Explore the Anargya ITS Formula EV Team merchandise catalogue.",
};

export default function MerchandisePage() {
  return (
    <Suspense fallback={<main className="page-loading" aria-busy="true">Loading catalogue…</main>}>
      <MerchandiseContent />
    </Suspense>
  );
}

async function MerchandiseContent() {
  await connection();
  const products = await getProducts();
  const orderEnabled = hasMerchandiseStoreConfig();

  return <MerchandiseExperience orderEnabled={orderEnabled} products={products} />;
}
