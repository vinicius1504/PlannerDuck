"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import {
  CreateBoardInput,
  UpdateBoardInput,
  CreateColumnInput,
  CreateCardInput,
  UpdateCardInput,
  MoveCardInput,
} from "./schemas";

async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

// ─── Board Actions ─────────────────────────────────

export async function createBoard(input: CreateBoardInput) {
  const userId = await getUserId();

  const board = await db.board.create({
    data: {
      title: input.title,
      description: input.description,
      color: input.color ?? "#6366f1",
      userId,
    },
  });

  revalidatePath("/kanban");
  return board;
}

export async function updateBoard(id: string, input: UpdateBoardInput) {
  const userId = await getUserId();

  const board = await db.board.update({
    where: { id, userId },
    data: input,
  });

  revalidatePath("/kanban");
  revalidatePath(`/kanban/${id}`);
  return board;
}

export async function deleteBoard(id: string) {
  const userId = await getUserId();
  await db.board.delete({ where: { id, userId } });
  revalidatePath("/kanban");
}

// ─── Column Actions ────────────────────────────────

export async function createColumn(boardId: string, input: CreateColumnInput) {
  const userId = await getUserId();

  // Verify board ownership
  const board = await db.board.findFirst({ where: { id: boardId, userId } });
  if (!board) throw new Error("Board not found");

  const maxPosition = await db.column.aggregate({
    where: { boardId },
    _max: { position: true },
  });

  const column = await db.column.create({
    data: {
      title: input.title,
      color: input.color,
      cardLimit: input.cardLimit,
      position: (maxPosition._max.position ?? -1) + 1,
      boardId,
    },
  });

  revalidatePath(`/kanban/${boardId}`);
  return column;
}

export async function updateColumn(
  columnId: string,
  data: { title?: string; color?: string | null; cardLimit?: number | null }
) {
  const column = await db.column.update({
    where: { id: columnId },
    data,
  });

  revalidatePath(`/kanban/${column.boardId}`);
  return column;
}

export async function deleteColumn(columnId: string) {
  const column = await db.column.findUnique({ where: { id: columnId } });
  if (!column) throw new Error("Column not found");

  await db.column.delete({ where: { id: columnId } });
  revalidatePath(`/kanban/${column.boardId}`);
}

export async function reorderColumns(
  boardId: string,
  columnIds: string[]
) {
  await db.$transaction(
    columnIds.map((id, index) =>
      db.column.update({ where: { id }, data: { position: index } })
    )
  );

  revalidatePath(`/kanban/${boardId}`);
}

// ─── Card Actions ──────────────────────────────────

export async function createCard(columnId: string, input: CreateCardInput) {
  const userId = await getUserId();

  const column = await db.column.findUnique({
    where: { id: columnId },
    include: { board: true },
  });
  if (!column || column.board.userId !== userId) throw new Error("Not found");

  const maxPosition = await db.card.aggregate({
    where: { columnId },
    _max: { position: true },
  });

  const card = await db.card.create({
    data: {
      title: input.title,
      description: input.description,
      priority: input.priority ?? "NONE",
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      position: (maxPosition._max.position ?? -1) + 1,
      columnId,
      labels: input.labelIds
        ? {
            create: input.labelIds.map((labelId) => ({ labelId })),
          }
        : undefined,
    },
  });

  revalidatePath(`/kanban/${column.boardId}`);
  return card;
}

export async function updateCard(cardId: string, input: UpdateCardInput) {
  const { labelIds, ...data } = input;

  const updateData: Record<string, unknown> = { ...data };
  if (data.dueDate !== undefined) {
    updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  }

  if (labelIds !== undefined) {
    await db.cardLabel.deleteMany({ where: { cardId } });
    if (labelIds.length > 0) {
      await db.cardLabel.createMany({
        data: labelIds.map((labelId) => ({ cardId, labelId })),
      });
    }
  }

  const card = await db.card.update({
    where: { id: cardId },
    data: updateData,
    include: { column: { select: { boardId: true } } },
  });

  revalidatePath(`/kanban/${card.column.boardId}`);
  return card;
}

export async function deleteCard(cardId: string) {
  const card = await db.card.findUnique({
    where: { id: cardId },
    include: { column: { select: { boardId: true } } },
  });
  if (!card) throw new Error("Card not found");

  await db.card.delete({ where: { id: cardId } });
  revalidatePath(`/kanban/${card.column.boardId}`);
}

export async function moveCard(cardId: string, input: MoveCardInput) {
  const card = await db.card.findUnique({
    where: { id: cardId },
    include: { column: { select: { boardId: true } } },
  });
  if (!card) throw new Error("Card not found");

  // Shift positions in target column
  await db.card.updateMany({
    where: {
      columnId: input.columnId,
      position: { gte: input.position },
    },
    data: { position: { increment: 1 } },
  });

  // Move card
  await db.card.update({
    where: { id: cardId },
    data: {
      columnId: input.columnId,
      position: input.position,
    },
  });

  revalidatePath(`/kanban/${card.column.boardId}`);
}

// ─── Label Actions ─────────────────────────────────

export async function createLabel(name: string, color: string) {
  const userId = await getUserId();

  const label = await db.label.create({
    data: { name, color, userId },
  });

  return label;
}

export async function deleteLabel(id: string) {
  await db.label.delete({ where: { id } });
}
