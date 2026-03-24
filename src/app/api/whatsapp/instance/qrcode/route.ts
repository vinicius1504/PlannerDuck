import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import QRCode from "qrcode";
import { getInstanceQrCode } from "@/modules/whatsapp/webhook/evolution-api";

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
    const qrData = await getInstanceQrCode(config.instanceName);
    let qrCodeBase64: string | null = null;

    if (qrData.code) {
      qrCodeBase64 = await QRCode.toDataURL(qrData.code, { width: 300 });
    }

    return NextResponse.json({
      qrCode: qrCodeBase64,
      pairingCode: qrData.pairingCode,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to get QR code" },
      { status: 500 }
    );
  }
}
