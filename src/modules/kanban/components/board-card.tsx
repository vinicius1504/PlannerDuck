"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import { Calendar, GripVertical } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { CardWithLabels } from "../types";
import { PriorityBadge } from "./priority-badge";
import { updateCard } from "../actions";

interface BoardCardProps {
  card: CardWithLabels;
  onClick: () => void;
}

export function BoardCard({ card, onClick }: BoardCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { type: "card", card },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isOverdue =
    card.dueDate && !card.isCompleted && new Date(card.dueDate) < new Date();

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "cursor-pointer transition-shadow hover:shadow-md",
        isDragging && "opacity-50 shadow-lg"
      )}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <button
            {...attributes}
            {...listeners}
            className="mt-0.5 shrink-0 cursor-grab active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="text-muted-foreground h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-start gap-2">
              <Checkbox
                checked={card.isCompleted}
                onClick={(e) => e.stopPropagation()}
                onCheckedChange={(checked) => {
                  updateCard(card.id, { isCompleted: !!checked });
                }}
                className="mt-0.5"
              />
              <span
                className={cn(
                  "text-sm font-medium",
                  card.isCompleted && "line-through text-muted-foreground"
                )}
              >
                {card.title}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <PriorityBadge priority={card.priority} />
              {card.labels.map(({ label }) => (
                <Badge
                  key={label.id}
                  variant="secondary"
                  className="text-xs"
                  style={{
                    backgroundColor: label.color + "20",
                    color: label.color,
                  }}
                >
                  {label.name}
                </Badge>
              ))}
            </div>

            {card.dueDate && (
              <div
                className={cn(
                  "flex items-center gap-1 text-xs",
                  isOverdue
                    ? "text-destructive"
                    : "text-muted-foreground"
                )}
              >
                <Calendar className="h-3 w-3" />
                {format(new Date(card.dueDate), "MMM d")}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
