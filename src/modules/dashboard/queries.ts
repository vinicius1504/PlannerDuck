import { db } from "@/lib/db";

export async function getDashboardData(userId: string) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);
  const weekEnd = new Date(todayStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const [
    documentCount,
    boardCount,
    eventCount,
    completedCount,
    totalCards,
    overdueCards,
    recentDocuments,
    upcomingEvents,
    todayTasks,
  ] = await Promise.all([
    db.document.count({ where: { userId, isArchived: false } }),
    db.board.count({ where: { userId, isArchived: false } }),
    db.calendarEvent.count({ where: { userId } }),
    db.card.count({ where: { column: { board: { userId } }, isCompleted: true } }),
    db.card.count({ where: { column: { board: { userId } } } }),
    db.card.count({
      where: {
        column: { board: { userId } },
        isCompleted: false,
        dueDate: { lt: now },
      },
    }),
    db.document.findMany({
      where: { userId, isArchived: false },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, title: true, icon: true, updatedAt: true },
    }),
    db.calendarEvent.findMany({
      where: { userId, startTime: { gte: now, lte: weekEnd } },
      orderBy: { startTime: "asc" },
      take: 5,
      select: {
        id: true,
        title: true,
        startTime: true,
        endTime: true,
        allDay: true,
        color: true,
        type: true,
      },
    }),
    db.card.findMany({
      where: {
        column: { board: { userId } },
        dueDate: { gte: todayStart, lt: todayEnd },
      },
      include: {
        column: { select: { title: true } },
        labels: { include: { label: true } },
      },
      orderBy: { dueDate: "asc" },
    }),
  ]);

  return {
    stats: {
      documents: documentCount,
      boards: boardCount,
      events: eventCount,
      completedTasks: completedCount,
      totalTasks: totalCards,
      overdueTasks: overdueCards,
    },
    recentDocuments,
    upcomingEvents,
    todayTasks,
  };
}
