import { CalendarEvent, EventType } from "@prisma/client";

export type CalendarEventWithCard = CalendarEvent & {
  card?: {
    id: string;
    title: string;
    priority: string;
    isCompleted: boolean;
  } | null;
};

export { EventType };
