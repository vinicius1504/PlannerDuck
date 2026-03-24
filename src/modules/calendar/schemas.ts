import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  allDay: z.boolean().optional(),
  color: z.string().optional(),
  type: z.enum(["EVENT", "TASK", "REMINDER", "DEADLINE"]).optional(),
  isRecurring: z.boolean().optional(),
  recurrence: z.any().optional(),
});

export const updateEventSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullish(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  allDay: z.boolean().optional(),
  color: z.string().optional(),
  type: z.enum(["EVENT", "TASK", "REMINDER", "DEADLINE"]).optional(),
  isRecurring: z.boolean().optional(),
  recurrence: z.any().optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
