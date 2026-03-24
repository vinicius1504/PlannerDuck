import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

interface Context {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: Context) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const event = await db.calendarEvent.findFirst({
    where: { id, userId: session.user.id },
    include: {
      card: {
        select: { id: true, title: true, priority: true, isCompleted: true },
      },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(event);
}

export async function PATCH(req: Request, { params }: Context) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  if (body.startTime) body.startTime = new Date(body.startTime);
  if (body.endTime) body.endTime = new Date(body.endTime);

  const event = await db.calendarEvent.update({
    where: { id, userId: session.user.id },
    data: body,
  });

  return NextResponse.json(event);
}

export async function DELETE(_req: Request, { params }: Context) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await db.calendarEvent.delete({
    where: { id, userId: session.user.id },
  });

  return NextResponse.json({ success: true });
}
