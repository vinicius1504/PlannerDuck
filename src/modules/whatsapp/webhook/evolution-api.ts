function getEvolutionConfig() {
  const apiUrl = process.env.EVOLUTION_API_URL;
  const apiKey = process.env.EVOLUTION_API_KEY;
  if (!apiUrl || !apiKey) {
    throw new Error("EVOLUTION_API_URL and EVOLUTION_API_KEY must be set");
  }
  return { apiUrl: apiUrl.replace(/\/$/, ""), apiKey };
}

export async function sendWhatsAppMessage(
  instanceName: string,
  remoteJid: string,
  message: string
): Promise<boolean> {
  try {
    const { apiUrl, apiKey } = getEvolutionConfig();
    const url = `${apiUrl}/message/sendText/${instanceName}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: apiKey,
      },
      body: JSON.stringify({
        number: remoteJid,
        text: message,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("[WhatsApp] Failed to send message:", error);
    return false;
  }
}

export async function createEvolutionInstance(instanceName: string) {
  const { apiUrl, apiKey } = getEvolutionConfig();

  const response = await fetch(`${apiUrl}/instance/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: apiKey,
    },
    body: JSON.stringify({
      instanceName,
      integration: "WHATSAPP-BAILEYS",
      qrcode: true,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.response?.message?.[0] ?? "Failed to create instance");
  }

  return response.json();
}

export async function getInstanceQrCode(instanceName: string) {
  const { apiUrl, apiKey } = getEvolutionConfig();

  const response = await fetch(`${apiUrl}/instance/connect/${instanceName}`, {
    headers: { apikey: apiKey },
  });

  if (!response.ok) {
    throw new Error("Failed to get QR code");
  }

  return response.json() as Promise<{
    pairingCode?: string;
    code?: string;
    count?: number;
  }>;
}

export async function getInstanceStatus(instanceName: string) {
  const { apiUrl, apiKey } = getEvolutionConfig();

  const response = await fetch(
    `${apiUrl}/instance/connectionState/${instanceName}`,
    { headers: { apikey: apiKey } }
  );

  if (!response.ok) {
    throw new Error("Failed to get connection state");
  }

  return response.json() as Promise<{
    instance: { instanceName: string; state: string };
  }>;
}

export type WhatsAppGroup = {
  id: string;
  subject: string;
  size: number;
};

export async function fetchAllGroups(
  instanceName: string
): Promise<WhatsAppGroup[]> {
  const { apiUrl, apiKey } = getEvolutionConfig();

  const response = await fetch(
    `${apiUrl}/group/fetchAllGroups/${instanceName}?getParticipants=false`,
    { headers: { apikey: apiKey } }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch groups");
  }

  const groups = await response.json();
  return (groups as WhatsAppGroup[]).map((g) => ({
    id: g.id,
    subject: g.subject ?? "Unknown group",
    size: g.size ?? 0,
  }));
}

export async function setInstanceWebhook(instanceName: string) {
  const { apiUrl, apiKey } = getEvolutionConfig();
  const webhookSecret = process.env.WHATSAPP_WEBHOOK_SECRET ?? "";

  // From Docker, localhost is the container itself.
  // Use host.docker.internal to reach the host machine's Next.js.
  const appUrl = process.env.WEBHOOK_APP_URL ?? "http://host.docker.internal:3000";

  const response = await fetch(`${apiUrl}/webhook/set/${instanceName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: apiKey,
    },
    body: JSON.stringify({
      webhook: {
        enabled: true,
        url: `${appUrl}/api/whatsapp/webhook`,
        webhookByEvents: false,
        webhookBase64: false,
        events: ["MESSAGES_UPSERT"],
        headers: {
          "x-webhook-secret": webhookSecret,
        },
      },
    }),
  });

  if (!response.ok) {
    console.error("[WhatsApp] Failed to set webhook:", await response.text());
    throw new Error("Failed to configure webhook");
  }

  return response.json();
}

export async function deleteEvolutionInstance(instanceName: string) {
  const { apiUrl, apiKey } = getEvolutionConfig();

  const response = await fetch(`${apiUrl}/instance/delete/${instanceName}`, {
    method: "DELETE",
    headers: { apikey: apiKey },
  });

  return response.ok;
}
