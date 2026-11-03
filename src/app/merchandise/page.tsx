import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import LoadingScreen from "@/components/loading-screen";
import MerchandiseExperience from "@/components/merchandise-experience";
import { getProducts } from "@/lib/products";
import { hasMerchandiseCheckoutConfig } from "@/lib/supabase/config";
import { hasMidtransCheckoutConfig } from "@/lib/midtrans";

export const metadata: Metadata = {
  title: "Merchandise — Anargya ITS",
  description: "Explore the Anargya ITS Formula EV Team merchandise catalogue.",
};

export default function MerchandisePage() {
  return (
    <Suspense fallback={<LoadingScreen label="Loading catalogue..." />}>
      <MerchandiseContent />
    </Suspense>
  );
}

async function MerchandiseContent() {
  await connection();
  const products = await getProducts();
  const orderEnabled = hasMerchandiseCheckoutConfig() && hasMidtransCheckoutConfig();

  return <MerchandiseExperience orderEnabled={orderEnabled} products={products} />;
}
