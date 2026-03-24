import { EventType } from "@prisma/client";
import { EVENT_TYPE_COLORS } from "@/lib/constants";

export function getEventTypeColor(type: EventType): string {
  return EVENT_TYPE_COLORS[type];
}
