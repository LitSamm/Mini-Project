import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";

const checkoutPath = "/snap/v1/transactions";
const notificationPath = "/api/webhooks/midtrans";

type MidtransConfig = {
  serverKey: string;
  apiUrl: string;
  siteUrl: URL;
  notificationUrl: URL;
};

export class MidtransPaymentRequestError extends Error {
  constructor(
    message: string,
    readonly definitelyRejected: boolean,
  ) {
    super(message);
    this.name = "MidtransPaymentRequestError";
  }
}

function getMidtransConfig(): MidtransConfig | null {
  const serverKey = process.env.MIDTRANS_SERVER_KEY?.trim();
  const mode = process.env.MIDTRANS_ENVIRONMENT ?? "sandbox";
  const siteUrlValue = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const notificationUrlValue = process.env.MIDTRANS_NOTIFICATION_URL?.trim();

  if (!serverKey || !siteUrlValue || !notificationUrlValue) return null;
  if (mode !== "sandbox" && mode !== "production") return null;

  let siteUrl: URL;
  let notificationUrl: URL;
  try {
    siteUrl = new URL(siteUrlValue);
    notificationUrl = new URL(notificationUrlValue);
  } catch {
    return null;
  }

  if (!["http:", "https:"].includes(siteUrl.protocol)
    || notificationUrl.protocol !== "https:"
    || notificationUrl.pathname !== notificationPath
    || notificationUrl.search
    || notificationUrl.hash) {
    return null;
  }

  return {
    serverKey,
    apiUrl: mode === "sandbox"
      ? "https://app.sandbox.midtrans.com"
      : "https://app.midtrans.com",
    siteUrl,
    notificationUrl,
  };
}

export function hasMidtransCheckoutConfig() {
  return getMidtransConfig() !== null;
}

export async function createMidtransCheckoutPayment(input: {
  amount: number;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
}) {
  const config = getMidtransConfig();
  if (!config) {
    throw new Error("Midtrans checkout is not configured correctly.");
  }

  const resultUrl = new URL("/merchandise/payment-result", config.siteUrl);
  resultUrl.searchParams.set("reference", input.orderId);

  const body = JSON.stringify({
    transaction_details: {
      order_id: input.orderId,
      gross_amount: input.amount,
    },
    customer_details: {
      first_name: input.customerName,
      email: input.customerEmail,
      ...(input.customerPhone ? { phone: input.customerPhone } : {}),
    },
    callbacks: {
      finish: resultUrl.toString(),
    },
  });

  const response = await fetch(`${config.apiUrl}${checkoutPath}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${config.serverKey}:`).toString("base64")}`,
    },
    body,
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new MidtransPaymentRequestError(
      `Midtrans rejected the checkout request with HTTP ${response.status}.`,
      response.status < 500 && response.status !== 408,
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new MidtransPaymentRequestError(
      "Midtrans returned an unreadable checkout response; the order remains pending.",
      false,
    );
  }

  if (typeof payload !== "object" || payload === null
    || !("redirect_url" in payload) || typeof payload.redirect_url !== "string") {
    throw new MidtransPaymentRequestError(
      "Midtrans returned an invalid checkout response; the order remains pending.",
      false,
    );
  }

  let paymentUrl: URL;
  try {
    paymentUrl = new URL(payload.redirect_url);
  } catch {
    throw new MidtransPaymentRequestError(
      "Midtrans returned an invalid payment URL; the order remains pending.",
      false,
    );
  }

  if (paymentUrl.protocol !== "https:" || !paymentUrl.hostname.endsWith(".midtrans.com")) {
    throw new MidtransPaymentRequestError(
      "Midtrans returned an untrusted payment URL; the order remains pending.",
      false,
    );
  }

  return paymentUrl.toString();
}

export function verifyMidtransNotification(input: {
  serverKey: string;
  orderId: string;
  statusCode: string;
  grossAmount: string;
  signatureKey: string;
}) {
  const expected = createHash("sha512")
    .update(`${input.orderId}${input.statusCode}${input.grossAmount}${input.serverKey}`)
    .digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  const providedBuffer = Buffer.from(input.signatureKey, "hex");
  return expectedBuffer.length === providedBuffer.length
    && timingSafeEqual(expectedBuffer, providedBuffer);
}

export function getMidtransServerKey() {
  return getMidtransConfig()?.serverKey ?? null;
}
