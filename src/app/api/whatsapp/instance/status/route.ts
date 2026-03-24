import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getInstanceStatus } from "@/modules/whatsapp/webhook/evolution-api";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = await db.whatsAppConfig.findUnique({
    where: { userId: session.user.id },
  });

  if (!config) {
    return NextResponse.json({ error: "No instance found" }, { status: 404 });
  }

  try {
    const result = await getInstanceStatus(config.instanceName);
    return NextResponse.json({
      state: result.instance.state,
      instanceName: result.instance.instanceName,
    });
  } catch {
    return NextResponse.json({ state: "unknown" });
  }
}
