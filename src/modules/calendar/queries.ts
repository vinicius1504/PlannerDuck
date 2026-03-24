import { db } from "@/lib/db";

export async function getEvents(
  userId: string,
  start: Date,
  end: Date
) {
  return db.calendarEvent.findMany({
    where: {
      userId,
      startTime: { gte: start },
      endTime: { lte: end },
    },
    include: {
      card: {
        select: {
          id: true,
          title: true,
          priority: true,
          isCompleted: true,
        },
      },
    },
    orderBy: { startTime: "asc" },
  });
}

export async function getEventById(id: string, userId: string) {
  return db.calendarEvent.findFirst({
    where: { id, userId },
    include: {
      card: {
        select: {
          id: true,
          title: true,
          priority: true,
          isCompleted: true,
        },
      },
    },
  });
}

export async function getUpcomingEvents(userId: string, days = 7) {
  const now = new Date();
  const end = new Date();
  end.setDate(end.getDate() + days);

  return db.calendarEvent.findMany({
    where: {
      userId,
      startTime: { gte: now, lte: end },
    },
    orderBy: { startTime: "asc" },
    take: 10,
    select: {
      id: true,
      title: true,
      startTime: true,
      endTime: true,
      allDay: true,
      color: true,
      type: true,
    },
  });
}
