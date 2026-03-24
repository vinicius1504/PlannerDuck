"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Label as LabelModel } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Trash2, Loader2 } from "lucide-react";
import { CardWithLabels } from "../types";
import { LabelPicker } from "./label-picker";
import { updateCard, deleteCard } from "../actions";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

interface CardDetailDialogProps {
  card: CardWithLabels | null;
  labels: LabelModel[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CardDetailDialog({
  card,
  labels,
  open,
  onOpenChange,
}: CardDetailDialogProps) {
  const [title, setTitle] = useState(card?.title ?? "");
  const [description, setDescription] = useState(card?.description ?? "");
  const [priority, setPriority] = useState<string>(card?.priority ?? "NONE");
  const [dueDate, setDueDate] = useState(
    card?.dueDate ? format(new Date(card.dueDate), "yyyy-MM-dd'T'HH:mm") : ""
  );
  const [isCompleted, setIsCompleted] = useState(card?.isCompleted ?? false);
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>(
    card?.labels.map((l) => l.label.id) ?? []
  );
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  // Sync state when card changes
  if (card && title === "" && card.title !== "") {
    setTitle(card.title);
    setDescription(card.description ?? "");
    setPriority(card.priority);
    setDueDate(
      card.dueDate
        ? format(new Date(card.dueDate), "yyyy-MM-dd'T'HH:mm")
        : ""
    );
    setIsCompleted(card.isCompleted);
    setSelectedLabelIds(card.labels.map((l) => l.label.id));
  }

  const handleSave = async () => {
    if (!card) return;
    setSaving(true);
    try {
      await updateCard(card.id, {
        title,
        description: description || null,
        priority: priority as "NONE" | "LOW" | "MEDIUM" | "HIGH" | "URGENT",
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        isCompleted,
        labelIds: selectedLabelIds,
      });
      toast.success("Card updated");
      onOpenChange(false);
    } catch {
      toast.error("Failed to update card");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!card) return;
    try {
      await deleteCard(card.id);
      toast.success("Card deleted");
      onOpenChange(false);
    } catch {
      toast.error("Failed to delete card");
    }
  };

  const toggleLabel = (labelId: string) => {
    setSelectedLabelIds((prev) =>
      prev.includes(labelId)
        ? prev.filter((id) => id !== labelId)
        : [...prev, labelId]
    );
  };

  if (!card) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Checkbox
                checked={isCompleted}
                onCheckedChange={(v) => setIsCompleted(!!v)}
              />
              Edit Card
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Add a description..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">None</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Labels</Label>
              <LabelPicker
                labels={labels}
                selectedIds={selectedLabelIds}
                onToggle={toggleLabel}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={() => setShowDelete(true)}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Delete
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving || !title.trim()}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete card"
        description="This will permanently delete this card."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  );
}
