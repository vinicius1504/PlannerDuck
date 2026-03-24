import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { columnId, title, description, priority, dueDate, labelIds } = body;

  const maxPosition = await db.card.aggregate({
    where: { columnId },
    _max: { position: true },
  });

  const card = await db.card.create({
    data: {
      title,
      description,
      priority: priority ?? "NONE",
      dueDate: dueDate ? new Date(dueDate) : null,
      position: (maxPosition._max.position ?? -1) + 1,
      columnId,
      labels: labelIds
        ? { create: labelIds.map((labelId: string) => ({ labelId })) }
        : undefined,
    },
  });

  return NextResponse.json(card, { status: 201 });
}
