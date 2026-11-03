import { Suspense } from "react";
import { connection } from "next/server";
import LoadingScreen from "@/components/loading-screen";
import HomeExperience from "@/components/home-experience";
import { getProducts } from "@/lib/products";

export default function Home() {
  return (
    <Suspense fallback={<LoadingScreen label="Loading Anargya..." />}>
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
  await connection();
  const products = await getProducts();

  return <HomeExperience products={products} />;
}
