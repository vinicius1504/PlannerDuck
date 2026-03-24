import type { WhatsAppIntent } from "../types";
import { callFormatter } from "./provider";
import { buildFormatterPrompt, STATIC_RESPONSES } from "./prompts";

export async function formatResponse(
  intent: WhatsAppIntent,
  data: unknown,
  userName?: string
): Promise<string> {
  const staticResponse = STATIC_RESPONSES[intent];
  if (staticResponse) return staticResponse;

  try {
    const prompt = buildFormatterPrompt(intent, data, userName);
    const response = await callFormatter(prompt);
    return response.trim() || "Desculpa, tive um problema ao formatar a resposta.";
  } catch {
    return "Desculpa, tive um problema ao processar sua mensagem. Tenta de novo?";
  }
}
