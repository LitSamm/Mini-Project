import { Suspense } from "react";
import { connection } from "next/server";
import HomeExperience from "@/components/home-experience";
import { getProducts } from "@/lib/products";

export default function Home() {
  return (
    <Suspense fallback={<main className="page-loading" aria-busy="true">Loading Anargya…</main>}>
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
  await connection();
  const products = await getProducts();

  return <HomeExperience products={products} />;
}
