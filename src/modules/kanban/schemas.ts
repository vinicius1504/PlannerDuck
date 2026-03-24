import { z } from "zod";

export const createBoardSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  color: z.string().optional(),
});

export const updateBoardSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullish(),
  color: z.string().optional(),
  isArchived: z.boolean().optional(),
});

export const createColumnSchema = z.object({
  title: z.string().min(1, "Title is required").max(50),
  color: z.string().nullish(),
  cardLimit: z.number().int().positive().nullish(),
});

export const createCardSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  priority: z.enum(["NONE", "LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  dueDate: z.string().datetime().nullish(),
  labelIds: z.array(z.string()).optional(),
});

export const updateCardSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullish(),
  priority: z.enum(["NONE", "LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  dueDate: z.string().datetime().nullish(),
  isCompleted: z.boolean().optional(),
  labelIds: z.array(z.string()).optional(),
});

export const moveCardSchema = z.object({
  columnId: z.string(),
  position: z.number().int().min(0),
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>;
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;
export type CreateColumnInput = z.infer<typeof createColumnSchema>;
export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;
export type MoveCardInput = z.infer<typeof moveCardSchema>;
