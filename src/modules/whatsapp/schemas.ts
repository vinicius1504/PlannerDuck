import { z } from "zod";

export const whatsAppConfigSchema = z.object({
  allowedGroups: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

export const updateWhatsAppConfigSchema = whatsAppConfigSchema.partial();

export const webhookPayloadSchema = z.object({
  event: z.string(),
  instance: z.string(),
  data: z.object({
    key: z.object({
      remoteJid: z.string(),
      fromMe: z.boolean(),
      id: z.string(),
      participant: z.string().optional(),
    }),
    pushName: z.string().optional(),
    message: z
      .object({
        conversation: z.string().optional(),
        extendedTextMessage: z
          .object({
            text: z.string().optional(),
          })
          .optional(),
      })
      .optional(),
    messageType: z.string(),
    messageTimestamp: z.number(),
  }),
});

export const phoneNumberSchema = z
  .string()
  .regex(/^\d{10,15}$/, "Invalid phone number format");

export type WhatsAppConfigInput = z.infer<typeof whatsAppConfigSchema>;
