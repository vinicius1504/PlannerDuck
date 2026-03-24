import { NextResponse } from "next/server";
import { verifyWebhookSecret } from "@/modules/whatsapp/webhook/security";
import { handleWebhookMessage } from "@/modules/whatsapp/webhook/handler";
import type { EvolutionWebhookPayload } from "@/modules/whatsapp/types";

export async function POST(request: Request) {
  console.log("[Webhook] ← POST received");

  // Log all headers for debugging
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = key === "x-webhook-secret" ? value : value.slice(0, 50);
  });
  console.log("[Webhook] Headers:", JSON.stringify(headers));

  // Verify webhook secret
  const secret = request.headers.get("x-webhook-secret");
  if (!verifyWebhookSecret(secret)) {
    console.warn("[Webhook] ✗ Invalid secret. Got:", JSON.stringify(secret));
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  console.log("[Webhook] ✓ Secret OK");

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    console.error("[Webhook] ✗ Invalid JSON body");
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  console.log("[Webhook] Event:", body.event, "| Instance:", body.instance);

  if (!body.event || !body.data) {
    console.warn("[Webhook] ✗ Missing event or data fields");
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const payload = body as unknown as EvolutionWebhookPayload;

  // Return 200 immediately, process async
  handleWebhookMessage(payload).catch((error) => {
    console.error("[Webhook] ✗ Async error:", error);
  });

  return NextResponse.json({ status: "ok" });
}
