import { WhatsAppSettingsPage } from "@/modules/whatsapp/components/whatsapp-settings-page";

export default function WhatsAppSettingsRoute() {
  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">WhatsApp Bot Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Configure the WhatsApp AI assistant powered by Evolution API.
        </p>
      </div>
      <WhatsAppSettingsPage />
    </div>
  );
}
