export function verifyWebhookSecret(headerSecret: string | null): boolean {
  const secret = process.env.WHATSAPP_WEBHOOK_SECRET;
  if (!secret) return false;
  return headerSecret === secret;
}
