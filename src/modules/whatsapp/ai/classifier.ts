import type { ClassifierResult, WhatsAppIntent } from "../types";
import { callClassifier } from "./provider";
import { buildClassifierPrompt } from "./prompts";

const VALID_INTENTS: WhatsAppIntent[] = [
  "calendar_today",
  "calendar_week",
  "calendar_upcoming",
  "kanban_summary",
  "kanban_board",
  "kanban_overdue",
  "documents_recent",
  "dashboard_summary",
  "general_greeting",
  "help",
  "unknown",
];

export async function classifyMessage(
  message: string
): Promise<ClassifierResult> {
  try {
    const prompt = buildClassifierPrompt(message);
    const raw = await callClassifier(prompt);
    const parsed = JSON.parse(raw);

    const intent = VALID_INTENTS.includes(parsed.intent)
      ? (parsed.intent as WhatsAppIntent)
      : "unknown";

    return {
      intent,
      params: parsed.params ?? {},
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0,
    };
  } catch {
    return { intent: "unknown", params: {}, confidence: 0 };
  }
}
