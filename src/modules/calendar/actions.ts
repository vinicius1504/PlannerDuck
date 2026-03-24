"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { CreateEventInput, UpdateEventInput } from "./schemas";

async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function createEvent(input: CreateEventInput) {
  const userId = await getUserId();

  const event = await db.calendarEvent.create({
    data: {
      title: input.title,
      description: input.description,
      startTime: new Date(input.startTime),
      endTime: new Date(input.endTime),
      allDay: input.allDay ?? false,
      color: input.color ?? "#6366f1",
      type: input.type ?? "EVENT",
      isRecurring: input.isRecurring ?? false,
      recurrence: input.recurrence,
      userId,
    },
  });

  revalidatePath("/calendar");
  return event;
}

export async function updateEvent(id: string, input: UpdateEventInput) {
  const userId = await getUserId();

  const data: Record<string, unknown> = { ...input };
  if (input.startTime) data.startTime = new Date(input.startTime);
  if (input.endTime) data.endTime = new Date(input.endTime);

  const event = await db.calendarEvent.update({
    where: { id, userId },
    data,
  });

  revalidatePath("/calendar");
  return event;
}

export async function deleteEvent(id: string) {
  const userId = await getUserId();

  await db.calendarEvent.delete({
    where: { id, userId },
  });

  revalidatePath("/calendar");
}

export async function moveEvent(
  id: string,
  startTime: string,
  endTime: string
) {
  const userId = await getUserId();

  await db.calendarEvent.update({
    where: { id, userId },
    data: {
      startTime: new Date(startTime),
      endTime: new Date(endTime),
    },
  });

  revalidatePath("/calendar");
}
