import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

interface Context {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, { params }: Context) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: boardId } = await params;
  const { columnIds } = await req.json();

  await db.$transaction(
    (columnIds as string[]).map((id, index) =>
      db.column.update({ where: { id }, data: { position: index } })
    )
  );

  return NextResponse.json({ success: true });
}
