"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { hasMerchandiseStoreConfig, isAdminEmail } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProductStatus } from "@/lib/merchandise";

const productStatuses: ProductStatus[] = ["Available", "Sold Out"];
const orderStatuses = ["Awaiting Payment", "Paid", "Preparing", "Shipped", "Completed", "Cancelled"] as const;

async function requireAdmin() {
  if (!hasMerchandiseStoreConfig()) {
    throw new Error("Supabase and Prisma database configuration is required.");
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !isAdminEmail(user?.email)) {
    redirect("/admin/login");
  }
}

export async function updateProduct(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const status = String(formData.get("status") ?? "");
  const rawPrice = String(formData.get("price_idr") ?? "").trim();
  const rawStock = String(formData.get("stock") ?? "").trim();
  const rawVariants = String(formData.get("variant_options") ?? "");

  if (!/^[a-z0-9-]{1,60}$/.test(id)
    || name.length < 2 || name.length > 100
    || category.length < 2 || category.length > 60
    || description.length < 5 || description.length > 500
    || !productStatuses.includes(status as ProductStatus)) {
    throw new Error("Invalid product information.");
  }

  const priceIdr = rawPrice === "" ? null : Number(rawPrice);
  const stock = rawStock === "" ? null : Number(rawStock);
  const variantOptions = [...new Set(rawVariants.split(",").map((variant) => variant.trim()).filter(Boolean))];

  if ((priceIdr !== null && (!Number.isSafeInteger(priceIdr) || priceIdr < 1 || priceIdr > 1_000_000_000_000))
    || priceIdr === null
    || (stock !== null && (!Number.isSafeInteger(stock) || stock < 0 || stock > 1_000_000))
    || variantOptions.length > 20
    || variantOptions.some((variant) => variant.length > 40)) {
    throw new Error("Price or stock is outside the supported range.");
  }

  const { count } = await prisma.product.updateMany({
    where: { id },
    data: {
      name,
      category,
      description,
      status,
      priceIdr: BigInt(priceIdr),
      stock,
      variantOptions,
    },
  });

  if (count === 0) {
    throw new Error("The requested product could not be found.");
  }

  revalidatePath("/");
  revalidatePath("/merchandise");
  revalidatePath("/admin");
}

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!/^[0-9a-f-]{36}$/i.test(id) || !orderStatuses.includes(status as (typeof orderStatuses)[number])) {
    throw new Error("Invalid order update.");
  }

  const { error } = await createAdminSupabaseClient().rpc("update_order_status", {
    p_order_id: id,
    p_status: status,
  });

  if (error) {
    throw new Error(`Could not update order: ${error.message}`);
  }

  revalidatePath("/admin");
}

export async function logoutAdmin() {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(`Could not sign out: ${error.message}`);
  }

  redirect("/admin/login");
}
