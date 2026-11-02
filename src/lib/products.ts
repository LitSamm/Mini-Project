import "server-only";

import { initialProducts, type Product } from "@/lib/merchandise";
import { prisma } from "@/lib/prisma";
import { hasStoreDatabaseConfig } from "@/lib/supabase/config";

export async function getProducts(): Promise<Product[]> {
  if (!hasStoreDatabaseConfig()) {
    return initialProducts;
  }

  const products = await prisma.product.findMany({ orderBy: { sortOrder: "asc" } });
  return products.map((product) => {
    if (product.status !== "Available" && product.status !== "Sold Out") {
      throw new Error(`Product "${product.id}" has an unsupported status.`);
    }

    return {
      id: product.id,
      name: product.name,
      category: product.category,
      status: product.status,
      description: product.description,
      image: product.image,
      imageAlt: product.imageAlt,
      priceIdr: Number(product.priceIdr),
      stock: product.stock,
      variantOptions: product.variantOptions,
    };
  });
}
