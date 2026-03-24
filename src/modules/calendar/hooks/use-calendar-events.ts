import { useCallback, useState } from "react";
import { CalendarEventWithCard } from "../types";

export function useCalendarEvents() {
  const [events, setEvents] = useState<CalendarEventWithCard[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEvents = useCallback(async (start: Date, end: Date) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/calendar/events?start=${start.toISOString()}&end=${end.toISOString()}`
      );
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return { events, loading, fetchEvents };
}
