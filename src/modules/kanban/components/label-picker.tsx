"use client";

import { Label as LabelModel } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LabelPickerProps {
  labels: LabelModel[];
  selectedIds: string[];
  onToggle: (labelId: string) => void;
}

export function LabelPicker({ labels, selectedIds, onToggle }: LabelPickerProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {labels.map((label) => {
        const isSelected = selectedIds.includes(label.id);
        return (
          <Badge
            key={label.id}
            variant="outline"
            className={cn(
              "cursor-pointer transition-colors",
              isSelected && "border-2"
            )}
            style={{
              backgroundColor: isSelected ? label.color + "20" : "transparent",
              borderColor: label.color,
              color: label.color,
            }}
            onClick={() => onToggle(label.id)}
          >
            {label.name}
          </Badge>
        );
      })}
      {labels.length === 0 && (
        <p className="text-muted-foreground text-xs">No labels yet</p>
      )}
    </div>
  );
}
