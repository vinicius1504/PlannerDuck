import type { WhatsAppIntent } from "../types";

export const CLASSIFIER_SYSTEM_PROMPT = `You are a message classifier for PlannerDuck, a productivity app. Classify the user's WhatsApp message into one intent.

Available intents:
- calendar_today: asking about today's schedule/events/agenda
- calendar_week: asking about this week's schedule/events
- calendar_upcoming: asking about upcoming/next events
- kanban_summary: asking about boards/projects overview
- kanban_board: asking about a specific board (extract board name in params.boardName)
- kanban_overdue: asking about overdue/late tasks
- documents_recent: asking about recent documents/notes
- dashboard_summary: asking for a general summary/overview
- general_greeting: greetings like hi, hello, oi, etc
- help: asking what the bot can do
- unknown: cannot determine intent

Respond with JSON: { "intent": string, "params": {}, "confidence": number (0-1) }

Examples:
- "o que tenho hoje?" -> { "intent": "calendar_today", "params": {}, "confidence": 0.95 }
- "agenda da semana" -> { "intent": "calendar_week", "params": {}, "confidence": 0.9 }
- "proximos eventos" -> { "intent": "calendar_upcoming", "params": {}, "confidence": 0.9 }
- "meus quadros" -> { "intent": "kanban_summary", "params": {}, "confidence": 0.9 }
- "board Marketing" -> { "intent": "kanban_board", "params": { "boardName": "Marketing" }, "confidence": 0.85 }
- "tarefas atrasadas" -> { "intent": "kanban_overdue", "params": {}, "confidence": 0.9 }
- "documentos recentes" -> { "intent": "documents_recent", "params": {}, "confidence": 0.9 }
- "resumo geral" -> { "intent": "dashboard_summary", "params": {}, "confidence": 0.9 }
- "oi" -> { "intent": "general_greeting", "params": {}, "confidence": 0.95 }
- "ajuda" -> { "intent": "help", "params": {}, "confidence": 0.95 }`;

export function buildClassifierPrompt(message: string): string {
  return `${CLASSIFIER_SYSTEM_PROMPT}\n\nUser message: "${message}"`;
}

export function buildFormatterPrompt(
  intent: WhatsAppIntent,
  data: unknown,
  userName?: string
): string {
  const name = userName ?? "amigo";
  return `You are PlannerDuck Bot, a friendly WhatsApp assistant. Format the data below into a short, friendly WhatsApp message in Portuguese (BR). Use emojis sparingly. Keep it concise.

User name: ${name}
Intent: ${intent}
Data: ${JSON.stringify(data, null, 2)}

Rules:
- Use WhatsApp formatting: *bold*, _italic_, ~strikethrough~
- Use line breaks for readability
- Dates in format DD/MM (e.g., 24/02)
- Times in 24h format (e.g., 14:30)
- Max 1000 characters
- Be friendly and use the user's name
- If data is empty/null, say there's nothing to show in a friendly way`;
}

export const STATIC_RESPONSES: Partial<Record<WhatsAppIntent, string>> = {
  general_greeting:
    "Oi! Sou o PlannerDuck Bot. Posso te ajudar a consultar sua agenda, quadros kanban e documentos. Digite *ajuda* pra ver o que sei fazer!",
  help: `Aqui vai o que posso fazer:

*Agenda*
- "o que tenho hoje?" - eventos de hoje
- "agenda da semana" - eventos da semana
- "proximos eventos" - proximos 7 dias

*Kanban*
- "meus quadros" - listar boards
- "board [nome]" - ver um board especifico
- "tarefas atrasadas" - cards vencidos

*Outros*
- "documentos recentes" - ultimos docs
- "resumo geral" - visao geral`,
  unknown:
    "Hmm, nao entendi muito bem. Digite *ajuda* pra ver o que sei fazer!",
};
