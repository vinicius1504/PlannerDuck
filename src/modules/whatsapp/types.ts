export type EvolutionWebhookPayload = {
  event: string;
  instance: string;
  data: {
    key: {
      remoteJid: string;
      fromMe: boolean;
      id: string;
      participant?: string;
    };
    pushName?: string;
    message?: {
      conversation?: string;
      extendedTextMessage?: {
        text?: string;
      };
    };
    messageType: string;
    messageTimestamp: number;
  };
};

export type WhatsAppIntent =
  | "calendar_today"
  | "calendar_week"
  | "calendar_upcoming"
  | "kanban_summary"
  | "kanban_board"
  | "kanban_overdue"
  | "documents_recent"
  | "dashboard_summary"
  | "general_greeting"
  | "help"
  | "unknown";

export type ClassifierResult = {
  intent: WhatsAppIntent;
  params: Record<string, string>;
  confidence: number;
};

export type IntentQueryResult = {
  intent: WhatsAppIntent;
  data: unknown;
};
