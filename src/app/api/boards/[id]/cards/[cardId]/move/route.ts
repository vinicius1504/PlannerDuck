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
  const { columnId, position } = await req.json();

  // Shift positions in target column
  await db.card.updateMany({
    where: { columnId, position: { gte: position } },
    data: { position: { increment: 1 } },
  });

  // Move card
  const card = await db.card.update({
    where: { id: cardId },
    data: { columnId, position },
  });

  return NextResponse.json(card);
}
