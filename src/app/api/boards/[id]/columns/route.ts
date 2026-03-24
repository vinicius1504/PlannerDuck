import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

interface Context {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: Context) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: boardId } = await params;
  const board = await db.board.findFirst({
    where: { id: boardId, userId: session.user.id },
  });

  if (!board) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();

  const maxPosition = await db.column.aggregate({
    where: { boardId },
    _max: { position: true },
  });

  const column = await db.column.create({
    data: {
      title: body.title,
      color: body.color,
      cardLimit: body.cardLimit,
      position: (maxPosition._max.position ?? -1) + 1,
      boardId,
    },
  });

  return NextResponse.json(column, { status: 201 });
}
