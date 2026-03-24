import type { EvolutionWebhookPayload } from "../types";
import { getUserByPhone, getActiveConfigForGroup, logMessage } from "../queries";
import { classifyMessage } from "../ai/classifier";
import { executeIntent } from "../ai/intents";
import { formatResponse } from "../ai/formatter";
import { STATIC_RESPONSES } from "../ai/prompts";
import { checkRateLimit } from "./rate-limiter";
import { sendWhatsAppMessage } from "./evolution-api";

function extractMessageText(payload: EvolutionWebhookPayload): string | null {
  const msg = payload.data.message;
  if (!msg) return null;
  return msg.conversation ?? msg.extendedTextMessage?.text ?? null;
}

function extractPhoneFromJid(jid: string): string {
  return jid.split("@")[0];
}

export async function handleWebhookMessage(
  payload: EvolutionWebhookPayload
): Promise<void> {
  try {
    const event = payload.event.toLowerCase();
    console.log("[Handler] Step 1 - Event:", event);

    if (event !== "messages.upsert" && event !== "messages_upsert") {
      console.log("[Handler] ✗ Skipped: not a message event");
      return;
    }

    if (payload.data.key.fromMe) {
      console.log("[Handler] ✗ Skipped: fromMe=true (own message)");
      return;
    }

    const messageText = extractMessageText(payload);
    console.log("[Handler] Step 2 - Message text:", messageText);
    if (!messageText) {
      console.log("[Handler] ✗ Skipped: no text in message. messageType:", payload.data.messageType);
      console.log("[Handler] Raw message:", JSON.stringify(payload.data.message));
      return;
    }

    const groupJid = payload.data.key.remoteJid;
    const isGroup = groupJid.endsWith("@g.us");
    console.log("[Handler] Step 3 - remoteJid:", groupJid, "| isGroup:", isGroup);

    const senderJid = isGroup
      ? payload.data.key.participant
      : payload.data.key.remoteJid;
    if (!senderJid) {
      console.log("[Handler] ✗ Skipped: no sender JID (participant is null in group)");
      return;
    }

    const phoneNumber = extractPhoneFromJid(senderJid);
    console.log("[Handler] Step 4 - Phone:", phoneNumber);

    // Check if group is authorized
    const config = await getActiveConfigForGroup(groupJid);
    console.log("[Handler] Step 5 - Config found:", !!config, config ? `(instance: ${config.instanceName})` : "(group not in allowedGroups)");
    if (!config) {
      console.log("[Handler] ✗ Skipped: group not authorized. groupJid:", groupJid);
      return;
    }

    // Rate limit
    if (!checkRateLimit(phoneNumber)) {
      console.log("[Handler] ✗ Skipped: rate limited for", phoneNumber);
      return;
    }

    // Find user
    const user = await getUserByPhone(phoneNumber);
    const userId = user?.id;
    const userName = user?.name ?? payload.data.pushName;
    console.log("[Handler] Step 6 - User found:", !!user, userId ? `(${userName})` : "(unknown phone)");

    // Classify
    console.log("[Handler] Step 7 - Classifying message...");
    const classification = await classifyMessage(messageText);
    console.log("[Handler] Step 7 - Intent:", classification.intent, "| Confidence:", classification.confidence, "| Params:", JSON.stringify(classification.params));

    let responseText: string;

    const staticResponse = STATIC_RESPONSES[classification.intent];
    if (staticResponse) {
      responseText = staticResponse;
      console.log("[Handler] Step 8 - Using static response");
    } else if (!userId) {
      responseText =
        "Nao consegui te identificar. Pede pro admin vincular seu telefone no PlannerDuck em Settings > WhatsApp.";
      console.log("[Handler] Step 8 - User not identified, sending fallback");
    } else {
      console.log("[Handler] Step 8 - Executing intent query...");
      const queryResult = await executeIntent(classification, userId);
      console.log("[Handler] Step 8 - Query result data type:", typeof queryResult.data, Array.isArray(queryResult.data) ? `(array len=${(queryResult.data as unknown[]).length})` : "");

      console.log("[Handler] Step 9 - Formatting response with AI...");
      responseText = await formatResponse(
        queryResult.intent,
        queryResult.data,
        userName ?? undefined
      );
      console.log("[Handler] Step 9 - Formatted response length:", responseText.length);
    }

    console.log("[Handler] Step 10 - Sending to WhatsApp...", config.instanceName, groupJid);
    const sent = await sendWhatsAppMessage(config.instanceName, groupJid, responseText);
    console.log("[Handler] Step 10 - Send result:", sent ? "✓ OK" : "✗ FAILED");

    // Log to DB
    await logMessage({
      phoneNumber,
      groupJid,
      message: messageText,
      intent: classification.intent,
      response: responseText,
      userId,
    });
    console.log("[Handler] Step 11 - ✓ Logged to DB. Done!");
  } catch (error) {
    console.error("[Handler] ✗ Error:", error);
  }
}
