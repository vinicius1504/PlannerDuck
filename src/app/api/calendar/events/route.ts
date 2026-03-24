import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  const where: Record<string, unknown> = { userId: session.user.id };
  if (start && end) {
    where.startTime = { gte: new Date(start) };
    where.endTime = { lte: new Date(end) };
  }

  const events = await db.calendarEvent.findMany({
    where,
    include: {
      card: {
        select: { id: true, title: true, priority: true, isCompleted: true },
      },
    },
    orderBy: { startTime: "asc" },
  });

  return NextResponse.json(events);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const event = await db.calendarEvent.create({
    data: {
      title: body.title,
      description: body.description,
      startTime: new Date(body.startTime),
      endTime: new Date(body.endTime),
      allDay: body.allDay ?? false,
      color: body.color ?? "#6366f1",
      type: body.type ?? "EVENT",
      isRecurring: body.isRecurring ?? false,
      recurrence: body.recurrence,
      userId: session.user.id,
    },
  });

  return NextResponse.json(event, { status: 201 });
}
