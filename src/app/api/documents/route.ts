import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const parentId = searchParams.get("parentId");

  const documents = await db.document.findMany({
    where: {
      userId: session.user.id,
      parentId: parentId || null,
      isArchived: false,
    },
    orderBy: { position: "asc" },
  });

  return NextResponse.json(documents);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const maxPosition = await db.document.aggregate({
    where: {
      userId: session.user.id,
      parentId: body.parentId ?? null,
    },
    _max: { position: true },
  });

  const document = await db.document.create({
    data: {
      title: body.title || "Untitled",
      parentId: body.parentId ?? null,
      icon: body.icon ?? "📄",
      position: (maxPosition._max.position ?? -1) + 1,
      userId: session.user.id,
    },
  });

  return NextResponse.json(document, { status: 201 });
}
