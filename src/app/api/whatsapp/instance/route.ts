import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import QRCode from "qrcode";
import {
  createEvolutionInstance,
  getInstanceQrCode,
  setInstanceWebhook,
  deleteEvolutionInstance,
} from "@/modules/whatsapp/webhook/evolution-api";

// POST - Create instance (or reconnect existing) + get QR code
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const instanceName = `plannerduck-${userId.slice(0, 8)}`;

  // Check if user already has a config in DB
  let config = await db.whatsAppConfig.findUnique({ where: { userId } });

  try {
    if (!config) {
      // Try to create instance in Evolution API
      try {
        await createEvolutionInstance(instanceName);
      } catch (err) {
        // If "already in use", that's fine - we'll reconnect to it
        const msg = err instanceof Error ? err.message : "";
        if (!msg.includes("already in use")) {
          throw err;
        }
      }

      // Save config in DB
      config = await db.whatsAppConfig.create({
        data: { instanceName, userId },
      });
    }

    // Configure webhook so Evolution API sends messages to us
    await setInstanceWebhook(config.instanceName).catch((err) => {
      console.error("[WhatsApp] Webhook setup warning:", err);
    });

    // Get QR code for connecting
    const qrData = await getInstanceQrCode(config.instanceName);
    let qrCodeBase64: string | null = null;

    if (qrData.code) {
      qrCodeBase64 = await QRCode.toDataURL(qrData.code, { width: 300 });
    }

    return NextResponse.json(
      {
        config,
        qrCode: qrCodeBase64,
        pairingCode: qrData.pairingCode,
      },
      { status: 201 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create instance";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE - Remove instance
export async function DELETE() {
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

  // Delete from Evolution API (best effort)
  await deleteEvolutionInstance(config.instanceName).catch(() => {});

  // Delete from DB
  await db.whatsAppConfig.delete({ where: { userId: session.user.id } });

  return NextResponse.json({ status: "deleted" });
}
