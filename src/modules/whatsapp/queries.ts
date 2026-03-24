import { db } from "@/lib/db";

export async function getWhatsAppConfig(userId: string) {
  return db.whatsAppConfig.findUnique({
    where: { userId },
  });
}

export async function getUserByPhone(phoneNumber: string) {
  return db.user.findFirst({
    where: { phoneNumber },
    select: { id: true, name: true, email: true, phoneNumber: true },
  });
}

export async function getActiveConfigForGroup(groupJid: string) {
  return db.whatsAppConfig.findFirst({
    where: {
      isActive: true,
      allowedGroups: { has: groupJid },
    },
    include: {
      user: {
        select: { id: true, name: true },
      },
    },
  });
}

export async function logMessage(data: {
  phoneNumber: string;
  groupJid: string;
  message: string;
  intent: string;
  response: string;
  tokensCost?: number;
  userId?: string;
}) {
  return db.whatsAppMessageLog.create({
    data: {
      phoneNumber: data.phoneNumber,
      groupJid: data.groupJid,
      message: data.message,
      intent: data.intent,
      response: data.response,
      tokensCost: data.tokensCost ?? 0,
      userId: data.userId,
    },
  });
}
