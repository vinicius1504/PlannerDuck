import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

interface Context {
  params: Promise<{ id: string; cardId: string }>;
}

export async function PATCH(req: Request, { params }: Context) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cardId } = await params;
  const body = await req.json();

  const { labelIds, ...data } = body;

  if (data.dueDate !== undefined) {
    data.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  }

  if (labelIds !== undefined) {
    await db.cardLabel.deleteMany({ where: { cardId } });
    if (labelIds.length > 0) {
      await db.cardLabel.createMany({
        data: labelIds.map((labelId: string) => ({ cardId, labelId })),
      });
    }
  }

  const card = await db.card.update({
    where: { id: cardId },
    data,
  });

  return NextResponse.json(card);
}

export async function DELETE(_req: Request, { params }: Context) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cardId } = await params;
  await db.card.delete({ where: { id: cardId } });

  return NextResponse.json({ success: true });
}
