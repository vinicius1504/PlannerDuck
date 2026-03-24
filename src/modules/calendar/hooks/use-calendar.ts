import { create } from "zustand";
import { CalendarEventWithCard } from "../types";

type ViewType = "dayGridMonth" | "timeGridWeek" | "timeGridDay";

interface CalendarState {
  events: CalendarEventWithCard[];
  setEvents: (events: CalendarEventWithCard[]) => void;
  view: ViewType;
  setView: (view: ViewType) => void;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  events: [],
  setEvents: (events) => set({ events }),
  view: "dayGridMonth",
  setView: (view) => set({ view }),
  currentDate: new Date(),
  setCurrentDate: (currentDate) => set({ currentDate }),
}));
