"use server";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { hasMerchandiseCheckoutConfig } from "@/lib/supabase/config";
import {
  createMidtransCheckoutPayment,
  hasMidtransCheckoutConfig,
  MidtransPaymentRequestError,
} from "@/lib/midtrans";

export type CheckoutState = {
  error?: string;
  pendingOrder?: {
    reference: string;
  };
  order?: {
    reference: string;
    totalIdr: number;
    paymentUrl: string;
  };
};

type CartItem = {
  id: string;
  quantity: number;
  variant: string | null;
};

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) return false;
  if (!("id" in value) || typeof value.id !== "string" || !/^[a-z0-9-]{1,60}$/.test(value.id)) return false;
  if (!("quantity" in value) || typeof value.quantity !== "number"
    || !Number.isInteger(value.quantity) || value.quantity < 1 || value.quantity > 20) return false;
  if (!("variant" in value)) return false;

  return value.variant === null
    || (typeof value.variant === "string" && value.variant.length <= 40);
}

export async function createOrder(_previousState: CheckoutState, formData: FormData): Promise<CheckoutState> {
  if (!hasMerchandiseCheckoutConfig() || !hasMidtransCheckoutConfig()) {
    return { error: "Checkout belum tersedia. Silakan coba beberapa saat lagi." };
  }

  const customerName = String(formData.get("customer_name") ?? "").trim();
  const customerEmail = String(formData.get("customer_email") ?? "").trim().toLowerCase();
  const customerPhone = String(formData.get("customer_phone") ?? "").trim();
  const deliveryAddress = String(formData.get("delivery_address") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const rawItems = String(formData.get("items") ?? "");

  if (customerName.length < 2 || customerName.length > 100
    || customerEmail.length > 254
    || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)
    || customerPhone.length > 30
    || (customerPhone && !/^\+?[\d\s().-]{8,30}$/.test(customerPhone))
    || deliveryAddress.length < 5 || deliveryAddress.length > 500
    || notes.length > 500) {
    return { error: "Periksa kembali nama, email, nomor telepon, alamat, dan catatan pesanan." };
  }

  let items: CartItem[];
  try {
    const parsed: unknown = JSON.parse(rawItems);
    if (!Array.isArray(parsed) || parsed.length < 1 || parsed.length > 20 || !parsed.every(isCartItem)) {
      return { error: "Isi keranjang tidak valid. Muat ulang halaman dan coba lagi." };
    }

    items = parsed;
  } catch {
    return { error: "Isi keranjang tidak valid. Muat ulang halaman dan coba lagi." };
  }

  if (new Set(items.map((item) => `${item.id}:${item.variant ?? ""}`)).size !== items.length) {
    return { error: "Varian produk yang sama hanya dapat dicantumkan satu kali dalam keranjang." };
  }

  const supabase = createAdminSupabaseClient();
  const { data: result, error } = await supabase.rpc("create_order", {
    p_customer_name: customerName,
    p_customer_email: customerEmail,
    p_customer_phone: customerPhone || null,
    p_delivery_address: deliveryAddress,
    p_notes: notes,
    p_items: items,
  });

  if (error) {
    if (error.message.includes("not available for purchase")) {
      return { error: "Produk dalam keranjang tidak lagi tersedia. Periksa katalog dan coba lagi." };
    }
    if (error.message.includes("not have enough stock")) {
      return { error: "Stok tidak cukup untuk jumlah yang dipilih. Kurangi jumlah lalu coba lagi." };
    }
    if (error.message.includes("invalid variant")) {
      return { error: "Varian produk tidak valid. Perbarui pilihan dan coba lagi." };
    }

    throw new Error(`Could not create order: ${error.message}`);
  }

  if (typeof result !== "object" || result === null
    || !("order_id" in result) || !("total_idr" in result) || !("payment_reference" in result)) {
    throw new Error("The order service returned an invalid response.");
  }

  if (typeof result.order_id !== "string" || typeof result.total_idr !== "number"
    || typeof result.payment_reference !== "string") {
    throw new Error("The order service returned invalid order details.");
  }

  let paymentUrl: string;
  try {
    paymentUrl = await createMidtransCheckoutPayment({
      amount: result.total_idr,
      orderId: result.payment_reference,
      customerName,
      customerEmail,
      customerPhone: customerPhone || null,
    });
  } catch (paymentError) {
    if (paymentError instanceof MidtransPaymentRequestError && paymentError.definitelyRejected) {
      const { error: cancelError } = await supabase.rpc("update_order_status", {
        p_order_id: result.order_id,
        p_status: "Cancelled",
      });
      if (cancelError) {
        throw new Error(
          `Midtrans rejected the payment request and the order could not be cancelled: ${cancelError.message}`,
        );
      }

      return { error: "Midtrans belum dapat memulai pembayaran. Pesanan dibatalkan; silakan coba lagi." };
    }

    if (paymentError instanceof MidtransPaymentRequestError) {
      console.error(paymentError.message);
    } else {
      console.error("Could not confirm whether Midtrans created the checkout session.", paymentError);
    }

    return {
      error: "Status pembayaran belum dapat dipastikan. Jangan membuat pesanan ulang; hubungi tim Anargya dengan nomor pesanan ini.",
      pendingOrder: { reference: result.payment_reference },
    };
  }

  return {
    order: {
      reference: result.payment_reference,
      totalIdr: result.total_idr,
      paymentUrl,
    },
  };
}
