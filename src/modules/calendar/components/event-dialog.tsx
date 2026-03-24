"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Trash2 } from "lucide-react";
import { createEvent, updateEvent, deleteEvent } from "../actions";
import { CalendarEventWithCard } from "../types";
import { EVENT_TYPE_COLORS } from "@/lib/constants";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { toast } from "sonner";

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: CalendarEventWithCard | null;
  defaultStart?: Date;
  defaultEnd?: Date;
  defaultAllDay?: boolean;
  onSaved?: () => void;
}

export function EventDialog({
  open,
  onOpenChange,
  event,
  defaultStart,
  defaultEnd,
  defaultAllDay,
  onSaved,
}: EventDialogProps) {
  const isEditing = !!event;

  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [startTime, setStartTime] = useState(
    event?.startTime
      ? format(new Date(event.startTime), "yyyy-MM-dd'T'HH:mm")
      : defaultStart
        ? format(defaultStart, "yyyy-MM-dd'T'HH:mm")
        : ""
  );
  const [endTime, setEndTime] = useState(
    event?.endTime
      ? format(new Date(event.endTime), "yyyy-MM-dd'T'HH:mm")
      : defaultEnd
        ? format(defaultEnd, "yyyy-MM-dd'T'HH:mm")
        : ""
  );
  const [allDay, setAllDay] = useState(event?.allDay ?? defaultAllDay ?? false);
  const [type, setType] = useState<string>(event?.type ?? "EVENT");
  const [color, setColor] = useState(
    event?.color ?? EVENT_TYPE_COLORS.EVENT
  );
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !startTime || !endTime) return;
    setSaving(true);

    try {
      const data = {
        title: title.trim(),
        description: description.trim() || undefined,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        allDay,
        type: type as "EVENT" | "TASK" | "REMINDER" | "DEADLINE",
        color,
      };

      if (isEditing && event) {
        await updateEvent(event.id, data);
        toast.success("Event updated");
      } else {
        await createEvent(data);
        toast.success("Event created");
      }

      onSaved?.();
      onOpenChange(false);
    } catch {
      toast.error("Failed to save event");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!event) return;
    try {
      await deleteEvent(event.id);
      toast.success("Event deleted");
      onSaved?.();
      onOpenChange(false);
    } catch {
      toast.error("Failed to delete event");
    }
  };

  const handleTypeChange = (newType: string) => {
    setType(newType);
    setColor(EVENT_TYPE_COLORS[newType as keyof typeof EVENT_TYPE_COLORS]);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Event" : "New Event"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Event title"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                rows={2}
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="allDay"
                checked={allDay}
                onCheckedChange={(v) => setAllDay(!!v)}
              />
              <Label htmlFor="allDay">All day</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start</Label>
                <Input
                  type={allDay ? "date" : "datetime-local"}
                  value={
                    allDay && startTime
                      ? startTime.slice(0, 10)
                      : startTime
                  }
                  onChange={(e) => {
                    const val = allDay
                      ? e.target.value + "T00:00"
                      : e.target.value;
                    setStartTime(val);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>End</Label>
                <Input
                  type={allDay ? "date" : "datetime-local"}
                  value={
                    allDay && endTime ? endTime.slice(0, 10) : endTime
                  }
                  onChange={(e) => {
                    const val = allDay
                      ? e.target.value + "T23:59"
                      : e.target.value;
                    setEndTime(val);
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EVENT">Event</SelectItem>
                  <SelectItem value="TASK">Task</SelectItem>
                  <SelectItem value="REMINDER">Reminder</SelectItem>
                  <SelectItem value="DEADLINE">Deadline</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between">
            {isEditing && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive mr-auto"
                onClick={() => setShowDelete(true)}
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Delete
              </Button>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !title.trim() || !startTime || !endTime}
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Save" : "Create"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete event"
        description="This will permanently delete this event."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  );
}
