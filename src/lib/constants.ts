export const PRIORITY_COLORS = {
  NONE: "#94a3b8",
  LOW: "#22c55e",
  MEDIUM: "#eab308",
  HIGH: "#f97316",
  URGENT: "#ef4444",
} as const;

export const PRIORITY_LABELS = {
  NONE: "None",
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
} as const;

export const EVENT_TYPE_COLORS = {
  EVENT: "#6366f1",
  TASK: "#22c55e",
  REMINDER: "#eab308",
  DEADLINE: "#ef4444",
} as const;

export const EVENT_TYPE_LABELS = {
  EVENT: "Event",
  TASK: "Task",
  REMINDER: "Reminder",
  DEADLINE: "Deadline",
} as const;

export const DEFAULT_BOARD_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
] as const;

export const DEFAULT_LABEL_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
] as const;
