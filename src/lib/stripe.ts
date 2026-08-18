// Minimal Stripe Checkout helpers using the raw REST API (no SDK dependency,
// matching the repo's minimal-deps ethos). Only two calls are needed for the
// pay-per-posting flow: create a Checkout Session and read one back.

const STRIPE_API = "https://api.stripe.com/v1";

async function stripeFetch(
  secretKey: string,
  path: string,
  init: RequestInit,
): Promise<{ status: number; body: unknown }> {
  const res = await fetch(`${STRIPE_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
      ...(init.headers ?? {}),
    },
  });
  const body = (await res.json().catch(() => null)) as unknown;
  return { status: res.status, body };
}

function formEncode(params: Record<string, string>): string {
  return Object.entries(params)
    .map(
      ([k, v]) =>
        `${encodeURIComponent(k)}=${encodeURIComponent(v)}`,
    )
    .join("&");
}

export interface CheckoutSessionInput {
  amountChf: number;
  company: string;
  jobTitle: string;
  successUrl: string;
  cancelUrl: string;
  metadata: Record<string, string>;
}

export interface CheckoutSessionResult {
  id: string;
  url: string;
}

export async function createCheckoutSession(
  secretKey: string,
  input: CheckoutSessionInput,
): Promise<CheckoutSessionResult> {
  const params: Record<string, string> = {
    mode: "payment",
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "chf",
    "line_items[0][price_data][unit_amount]": String(input.amountChf * 100),
    "line_items[0][price_data][product_data][name]": `${input.jobTitle} — ${input.company}`,
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
  };
  for (const [key, value] of Object.entries(input.metadata)) {
    params[`metadata[${key}]`] = value;
  }

  const { status, body } = await stripeFetch(secretKey, "/checkout/sessions", {
    method: "POST",
    body: formEncode(params),
  });

  if (status !== 200) {
    throw new Error(
      `Stripe checkout creation failed (${status}): ${JSON.stringify(body)}`,
    );
  }

  const session = body as { id: string; url: string | null };
  if (!session.id || !session.url) {
    throw new Error(`Stripe checkout returned no session URL: ${JSON.stringify(body)}`);
  }
  return { id: session.id, url: session.url };
}

export interface CheckoutSessionStatus {
  paymentStatus: string;
  metadata: Record<string, string>;
}

export async function getCheckoutSession(
  secretKey: string,
  sessionId: string,
): Promise<CheckoutSessionStatus> {
  const { status, body } = await stripeFetch(
    secretKey,
    `/checkout/sessions/${encodeURIComponent(sessionId)}`,
    { method: "GET" },
  );

  if (status !== 200) {
    throw new Error(
      `Stripe session lookup failed (${status}): ${JSON.stringify(body)}`,
    );
  }

  const session = body as {
    payment_status: string;
    metadata?: Record<string, string> | null;
  };
  return {
    paymentStatus: session.payment_status,
    metadata: session.metadata ?? {},
  };
}