"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { DateSelectArg, EventClickArg, EventDropArg } from "@fullcalendar/core";
import { EventResizeDoneArg } from "@fullcalendar/interaction";
import { CalendarEventWithCard } from "../types";
import { CalendarToolbar } from "./calendar-toolbar";
import { EventDialog } from "./event-dialog";
import { moveEvent } from "../actions";
import { toast } from "sonner";

interface CalendarViewProps {
  initialEvents: CalendarEventWithCard[];
}

export function CalendarView({ initialEvents }: CalendarViewProps) {
  const calendarRef = useRef<FullCalendar>(null);
  const [events, setEvents] = useState(initialEvents);
  const [view, setView] = useState("dayGridMonth");
  const [title, setTitle] = useState("");
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventWithCard | null>(null);
  const [selectInfo, setSelectInfo] = useState<{
    start: Date;
    end: Date;
    allDay: boolean;
  } | null>(null);

  useEffect(() => {
    setEvents(initialEvents);
  }, [initialEvents]);

  const updateTitle = useCallback(() => {
    const api = calendarRef.current?.getApi();
    if (api) setTitle(api.view.title);
  }, []);

  const handleDateSelect = (info: DateSelectArg) => {
    setSelectedEvent(null);
    setSelectInfo({ start: info.start, end: info.end, allDay: info.allDay });
    setShowEventDialog(true);
  };

  const handleEventClick = (info: EventClickArg) => {
    const event = events.find((e) => e.id === info.event.id);
    if (event) {
      setSelectedEvent(event);
      setSelectInfo(null);
      setShowEventDialog(true);
    }
  };

  const handleEventDrop = async (info: EventDropArg) => {
    try {
      await moveEvent(
        info.event.id,
        info.event.start!.toISOString(),
        info.event.end!.toISOString()
      );
    } catch {
      info.revert();
      toast.error("Failed to move event");
    }
  };

  const handleEventResize = async (info: EventResizeDoneArg) => {
    try {
      await moveEvent(
        info.event.id,
        info.event.start!.toISOString(),
        info.event.end!.toISOString()
      );
    } catch {
      info.revert();
      toast.error("Failed to resize event");
    }
  };

  const handleViewChange = (newView: string) => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.changeView(newView);
      setView(newView);
      setTitle(api.view.title);
    }
  };

  const handlePrev = () => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.prev();
      updateTitle();
    }
  };

  const handleNext = () => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.next();
      updateTitle();
    }
  };

  const handleToday = () => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.today();
      updateTitle();
    }
  };

  const fcEvents = events.map((e) => ({
    id: e.id,
    title: e.title,
    start: e.startTime,
    end: e.endTime,
    allDay: e.allDay,
    backgroundColor: e.color,
    borderColor: e.color,
  }));

  return (
    <div className="flex h-full flex-col">
      <CalendarToolbar
        title={title}
        view={view}
        onViewChange={handleViewChange}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        onNewEvent={() => {
          setSelectedEvent(null);
          setSelectInfo({
            start: new Date(),
            end: new Date(Date.now() + 3600000),
            allDay: false,
          });
          setShowEventDialog(true);
        }}
      />

      <div className="flex-1 p-4">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={false}
          events={fcEvents}
          editable
          selectable
          selectMirror
          dayMaxEvents
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          datesSet={() => updateTitle()}
          height="auto"
        />
      </div>

      <EventDialog
        open={showEventDialog}
        onOpenChange={setShowEventDialog}
        event={selectedEvent}
        defaultStart={selectInfo?.start}
        defaultEnd={selectInfo?.end}
        defaultAllDay={selectInfo?.allDay}
        onSaved={() => {
          // Trigger a page refresh to get new data
          window.location.reload();
        }}
      />
    </div>
  );
}
