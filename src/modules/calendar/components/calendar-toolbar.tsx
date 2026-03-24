"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

interface CalendarToolbarProps {
  title: string;
  view: string;
  onViewChange: (view: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onNewEvent: () => void;
}

export function CalendarToolbar({
  title,
  view,
  onViewChange,
  onPrev,
  onNext,
  onToday,
  onNewEvent,
}: CalendarToolbarProps) {
  return (
    <div className="flex items-center justify-between border-b px-6 py-3">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onToday}>
          Today
        </Button>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onPrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>

      <div className="flex items-center gap-2">
        <div className="bg-muted rounded-md p-0.5">
          {(["dayGridMonth", "timeGridWeek", "timeGridDay"] as const).map(
            (v) => (
              <Button
                key={v}
                variant={view === v ? "default" : "ghost"}
                size="sm"
                className="h-7 px-3 text-xs"
                onClick={() => onViewChange(v)}
              >
                {v === "dayGridMonth"
                  ? "Month"
                  : v === "timeGridWeek"
                    ? "Week"
                    : "Day"}
              </Button>
            )
          )}
        </div>
        <Button size="sm" onClick={onNewEvent}>
          <Plus className="mr-1 h-4 w-4" />
          New Event
        </Button>
      </div>
    </div>
  );
}
