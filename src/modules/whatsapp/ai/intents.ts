import { db } from "@/lib/db";
import { getEvents, getUpcomingEvents } from "@/modules/calendar/queries";
import { getBoards, getBoardWithColumns } from "@/modules/kanban/queries";
import { getRecentDocuments } from "@/modules/documents/queries";
import { getDashboardData } from "@/modules/dashboard/queries";
import type { ClassifierResult, IntentQueryResult } from "../types";

export async function executeIntent(
  result: ClassifierResult,
  userId: string
): Promise<IntentQueryResult> {
  const { intent, params } = result;

  switch (intent) {
    case "calendar_today": {
      const now = new Date();
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      const todayEnd = new Date(todayStart);
      todayEnd.setDate(todayEnd.getDate() + 1);
      const data = await getEvents(userId, todayStart, todayEnd);
      return { intent, data };
    }

    case "calendar_week": {
      const now = new Date();
      const weekStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      const data = await getEvents(userId, weekStart, weekEnd);
      return { intent, data };
    }

    case "calendar_upcoming": {
      const data = await getUpcomingEvents(userId, 7);
      return { intent, data };
    }

    case "kanban_summary": {
      const data = await getBoards(userId);
      return { intent, data };
    }

    case "kanban_board": {
      const boardName = params.boardName;
      if (!boardName) {
        const data = await getBoards(userId);
        return { intent: "kanban_summary", data };
      }
      const boards = await db.board.findMany({
        where: {
          userId,
          isArchived: false,
          title: { contains: boardName, mode: "insensitive" },
        },
        select: { id: true, title: true },
      });
      if (boards.length === 0) {
        return { intent, data: { error: `Board "${boardName}" not found` } };
      }
      const data = await getBoardWithColumns(boards[0].id, userId);
      return { intent, data };
    }

    case "kanban_overdue": {
      const now = new Date();
      const data = await db.card.findMany({
        where: {
          column: { board: { userId } },
          isCompleted: false,
          dueDate: { lt: now },
        },
        select: {
          id: true,
          title: true,
          priority: true,
          dueDate: true,
          column: {
            select: {
              title: true,
              board: { select: { title: true } },
            },
          },
        },
        orderBy: { dueDate: "asc" },
        take: 20,
      });
      return { intent, data };
    }

    case "documents_recent": {
      const data = await getRecentDocuments(userId, 10);
      return { intent, data };
    }

    case "dashboard_summary": {
      const data = await getDashboardData(userId);
      return { intent, data };
    }

    default:
      return { intent, data: null };
  }
}
