import { db } from "@/lib/db";

export async function getBoards(userId: string) {
  return db.board.findMany({
    where: { userId, isArchived: false },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      color: true,
      createdAt: true,
      _count: { select: { columns: true } },
    },
  });
}

export async function getBoardWithColumns(boardId: string, userId: string) {
  return db.board.findFirst({
    where: { id: boardId, userId },
    include: {
      columns: {
        orderBy: { position: "asc" },
        include: {
          cards: {
            orderBy: { position: "asc" },
            include: {
              labels: {
                include: { label: true },
              },
            },
          },
        },
      },
    },
  });
}

export async function getLabels(userId: string) {
  return db.label.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
}
