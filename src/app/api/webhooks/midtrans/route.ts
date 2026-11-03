import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { hasSupabaseServiceConfig } from "@/lib/supabase/config";
import {
  getMidtransServerKey,
  hasMidtransCheckoutConfig,
  verifyMidtransNotification,
} from "@/lib/midtrans";

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function jsonResponse(message: string, status: number) {
  return Response.json({ message }, { status });
}

export async function POST(request: Request) {
  if (!hasSupabaseServiceConfig() || !hasMidtransCheckoutConfig()) {
    return jsonResponse("Payment notification is not configured.", 503);
  }

  const body = await request.text();
  if (body.length > 64_000) {
    return jsonResponse("Notification body is too large.", 413);
  }

  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return jsonResponse("Invalid notification JSON.", 400);
  }

  if (!isRecord(payload)
    || typeof payload.order_id !== "string"
    || typeof payload.status_code !== "string"
    || typeof payload.gross_amount !== "string"
    || typeof payload.signature_key !== "string"
    || typeof payload.transaction_status !== "string") {
    return jsonResponse("Invalid notification payload.", 400);
  }

  const serverKey = getMidtransServerKey();
  if (!serverKey || !verifyMidtransNotification({
    serverKey,
    orderId: payload.order_id,
    statusCode: payload.status_code,
    grossAmount: payload.gross_amount,
    signatureKey: payload.signature_key,
  })) {
    return jsonResponse("Invalid Midtrans notification signature.", 401);
  }

  if (!/^AN[A-F0-9]{28}$/.test(payload.order_id)) {
    return jsonResponse("Invalid order reference.", 400);
  }

  let grossAmount: number;
  try {
    const parsedAmount = Number(payload.gross_amount);
    if (!Number.isFinite(parsedAmount) || !Number.isSafeInteger(parsedAmount)
      || !/^\d+(?:\.0+)?$/.test(payload.gross_amount)) {
      return jsonResponse("Invalid payment amount.", 400);
    }
    grossAmount = parsedAmount;
  } catch {
    return jsonResponse("Invalid payment amount.", 400);
  }

  const isSuccessful = payload.transaction_status === "settlement"
    || (payload.transaction_status === "capture" && payload.fraud_status === "accept");
  const isTerminalFailure = ["deny", "cancel", "expire", "failure"].includes(payload.transaction_status);
  if (!isSuccessful && !isTerminalFailure) {
    return jsonResponse("Notification acknowledged.", 200);
  }

  const supabase = createAdminSupabaseClient();
  const { data: order, error: lookupError } = await supabase
    .from("orders")
    .select("id, total_idr")
    .eq("payment_reference", payload.order_id)
    .maybeSingle();

  if (lookupError) {
    console.error("Could not look up the Midtrans order.", lookupError.message);
    return jsonResponse("Could not process notification.", 500);
  }

  if (!order) {
    console.error(`Midtrans notification has no matching order: ${payload.order_id}`);
    return jsonResponse("Notification acknowledged.", 200);
  }

  if (Number(order.total_idr) !== grossAmount) {
    console.error(`Midtrans notification amount does not match order ${payload.order_id}.`);
    return jsonResponse("Notification acknowledged.", 200);
  }

  const { error: updateError } = await supabase.rpc("apply_midtrans_payment_event", {
    p_order_id: order.id,
    p_event: isSuccessful ? "Paid" : "Cancelled",
  });

  if (updateError) {
    console.error(
      `Could not apply Midtrans ${payload.transaction_status} event for order ${payload.order_id}.`,
      updateError.message,
    );
    return jsonResponse("Could not process notification.", 500);
  }

  return jsonResponse("Notification processed.", 200);
}
