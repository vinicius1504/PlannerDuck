import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = await db.whatsAppConfig.findUnique({
    where: { userId: session.user.id },
  });

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { phoneNumber: true },
  });

  return NextResponse.json({ config, phoneNumber: user?.phoneNumber });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const config = await db.whatsAppConfig.update({
    where: { userId: session.user.id },
    data: {
      ...(body.allowedGroups !== undefined && {
        allowedGroups: body.allowedGroups,
      }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    },
  });

  return NextResponse.json(config);
}
