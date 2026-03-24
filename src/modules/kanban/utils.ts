import { Priority } from "@prisma/client";
import { PRIORITY_COLORS } from "@/lib/constants";

export function getPriorityColor(priority: Priority): string {
  return PRIORITY_COLORS[priority];
}

export function isOverdue(dueDate: Date | string | null, isCompleted: boolean): boolean {
  if (!dueDate || isCompleted) return false;
  return new Date(dueDate) < new Date();
}
