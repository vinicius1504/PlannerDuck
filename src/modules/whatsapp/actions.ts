"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { phoneNumberSchema } from "./schemas";

async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function updateAllowedGroups(groups: string[]) {
  const userId = await getUserId();

  await db.whatsAppConfig.update({
    where: { userId },
    data: { allowedGroups: groups },
  });

  revalidatePath("/settings/whatsapp");
}

export async function toggleWhatsAppActive(isActive: boolean) {
  const userId = await getUserId();

  await db.whatsAppConfig.update({
    where: { userId },
    data: { isActive },
  });

  revalidatePath("/settings/whatsapp");
}

export async function updateUserPhone(phoneNumber: string) {
  const userId = await getUserId();
  const parsed = phoneNumberSchema.parse(phoneNumber);

  await db.user.update({
    where: { id: userId },
    data: { phoneNumber: parsed },
  });

  revalidatePath("/settings/whatsapp");
}

export async function removeUserPhone() {
  const userId = await getUserId();

  await db.user.update({
    where: { id: userId },
    data: { phoneNumber: null },
  });

  revalidatePath("/settings/whatsapp");
}
