"use client";

import { Badge } from "@/components/ui/badge";
import { Priority } from "@prisma/client";
import { PRIORITY_COLORS, PRIORITY_LABELS } from "@/lib/constants";

interface PriorityBadgeProps {
  priority: Priority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  if (priority === "NONE") return null;

  return (
    <Badge
      variant="outline"
      className="text-xs"
      style={{
        borderColor: PRIORITY_COLORS[priority],
        color: PRIORITY_COLORS[priority],
      }}
    >
      {PRIORITY_LABELS[priority]}
    </Badge>
  );
}
