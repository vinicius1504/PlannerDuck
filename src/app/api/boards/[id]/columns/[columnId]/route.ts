import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

interface Context {
  params: Promise<{ id: string; columnId: string }>;
}

export async function PATCH(req: Request, { params }: Context) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { columnId } = await params;
  const body = await req.json();

  const column = await db.column.update({
    where: { id: columnId },
    data: body,
  });

  return NextResponse.json(column);
}

export async function DELETE(_req: Request, { params }: Context) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { columnId } = await params;
  await db.column.delete({ where: { id: columnId } });

  return NextResponse.json({ success: true });
}
