import { z } from "zod";

export const createDocumentSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  parentId: z.string().nullish(),
  icon: z.string().nullish(),
});

export const updateDocumentSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.any().optional(),
  icon: z.string().nullish(),
  coverUrl: z.string().url().nullish(),
  isArchived: z.boolean().optional(),
  parentId: z.string().nullish(),
  position: z.number().int().min(0).optional(),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
