"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Loader2,
  Plus,
  X,
  Save,
  Trash2,
  Wifi,
  WifiOff,
  RefreshCw,
  QrCode,
  Users,
} from "lucide-react";
import type { WhatsAppConfig } from "@prisma/client";

type ConnectionState = "open" | "close" | "connecting" | "unknown" | null;
type WhatsAppGroup = { id: string; subject: string; size: number };

export function WhatsAppSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<WhatsAppConfig | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [connectionState, setConnectionState] = useState<ConnectionState>(null);

  // QR Code
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);

  // Groups
  const [allowedGroups, setAllowedGroups] = useState<string[]>([]);
  const [availableGroups, setAvailableGroups] = useState<WhatsAppGroup[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [newGroup, setNewGroup] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Action states
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [configLoading, setConfigLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/whatsapp/config");
        if (res.ok) {
          const data = await res.json();
          setConfig(data.config);
          setPhoneNumber(data.phoneNumber ?? "");
          if (data.config) {
            setAllowedGroups(data.config.allowedGroups ?? []);
            setIsActive(data.config.isActive);
          }
        }
      } catch {
        /* empty */
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Check connection status
  const checkStatus = useCallback(async () => {
    if (!config) return;
    try {
      const res = await fetch("/api/whatsapp/instance/status");
      if (res.ok) {
        const data = await res.json();
        setConnectionState(data.state);
        // If connected, clear QR code
        if (data.state === "open") {
          setQrCode(null);
          setPairingCode(null);
        }
      }
    } catch {
      setConnectionState("unknown");
    }
  }, [config]);

  useEffect(() => {
    if (config) checkStatus();
  }, [config, checkStatus]);

  // Poll status while QR is showing
  useEffect(() => {
    if (!qrCode) return;
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, [qrCode, checkStatus]);

  // Create instance
  async function handleCreateInstance() {
    setQrLoading(true);
    try {
      const res = await fetch("/api/whatsapp/instance", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setConfig(data.config);
      setAllowedGroups(data.config.allowedGroups ?? []);
      setIsActive(data.config.isActive);
      setQrCode(data.qrCode);
      setPairingCode(data.pairingCode);
    } catch (err) {
      showMessage("error", err instanceof Error ? err.message : "Failed to create instance");
    } finally {
      setQrLoading(false);
    }
  }

  // Refresh QR
  async function handleRefreshQr() {
    setQrLoading(true);
    try {
      const res = await fetch("/api/whatsapp/instance/qrcode");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setQrCode(data.qrCode);
      setPairingCode(data.pairingCode);
    } catch {
      showMessage("error", "Failed to refresh QR code");
    } finally {
      setQrLoading(false);
    }
  }

  // Delete instance
  async function handleDeleteInstance() {
    if (!confirm("Are you sure? This will disconnect WhatsApp.")) return;
    setConfigLoading(true);
    try {
      await fetch("/api/whatsapp/instance", { method: "DELETE" });
      setConfig(null);
      setConnectionState(null);
      setQrCode(null);
      setPairingCode(null);
      setAllowedGroups([]);
      showMessage("success", "Instance deleted.");
    } catch {
      showMessage("error", "Failed to delete instance.");
    } finally {
      setConfigLoading(false);
    }
  }

  // Save phone
  async function handleSavePhone() {
    setPhoneLoading(true);
    try {
      const { updateUserPhone, removeUserPhone } = await import("../actions");
      if (phoneNumber.trim()) {
        await updateUserPhone(phoneNumber.trim());
      } else {
        await removeUserPhone();
      }
      showMessage("success", "Phone number updated!");
    } catch {
      showMessage("error", "Invalid phone number. Use 10-15 digits only.");
    } finally {
      setPhoneLoading(false);
    }
  }

  // Save config (groups + active)
  async function handleSaveConfig() {
    setConfigLoading(true);
    try {
      const res = await fetch("/api/whatsapp/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allowedGroups, isActive }),
      });
      if (!res.ok) throw new Error();
      showMessage("success", "Configuration saved!");
    } catch {
      showMessage("error", "Failed to save configuration.");
    } finally {
      setConfigLoading(false);
    }
  }

  function addGroup() {
    const trimmed = newGroup.trim();
    if (trimmed && !allowedGroups.includes(trimmed)) {
      setAllowedGroups([...allowedGroups, trimmed]);
      setNewGroup("");
    }
  }

  async function handleLoadGroups() {
    setGroupsLoading(true);
    try {
      const res = await fetch("/api/whatsapp/instance/groups");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAvailableGroups(data);
    } catch (err) {
      showMessage(
        "error",
        err instanceof Error ? err.message : "Failed to load groups"
      );
    } finally {
      setGroupsLoading(false);
    }
  }

  function toggleGroup(groupId: string) {
    setAllowedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((g) => g !== groupId)
        : [...prev, groupId]
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`rounded-md p-3 text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
              : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Connection Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            WhatsApp Connection
          </CardTitle>
          <CardDescription>
            {config
              ? "Manage your WhatsApp connection."
              : "Connect your WhatsApp to start using the bot."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!config ? (
            <Button onClick={handleCreateInstance} disabled={qrLoading}>
              {qrLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <QrCode className="mr-2 h-4 w-4" />
              )}
              Connect WhatsApp
            </Button>
          ) : (
            <div className="space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {connectionState === "open" ? (
                    <Wifi className="h-4 w-4 text-green-500" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm font-medium">
                    {connectionState === "open"
                      ? "Connected"
                      : connectionState === "connecting"
                        ? "Connecting..."
                        : "Disconnected"}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {config.instanceName}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={checkStatus}
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteInstance}
                    disabled={configLoading}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Disconnect
                  </Button>
                </div>
              </div>

              {/* QR Code */}
              {connectionState !== "open" && (
                <div className="flex flex-col items-center gap-4 rounded-lg border p-6">
                  {qrCode ? (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Scan with WhatsApp to connect
                      </p>
                      <img
                        src={qrCode}
                        alt="WhatsApp QR Code"
                        className="h-[300px] w-[300px] rounded-md"
                      />
                      {pairingCode && (
                        <p className="text-sm text-muted-foreground">
                          Or use pairing code:{" "}
                          <span className="font-mono font-bold">
                            {pairingCode}
                          </span>
                        </p>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefreshQr}
                        disabled={qrLoading}
                      >
                        {qrLoading ? (
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        ) : (
                          <RefreshCw className="mr-2 h-3 w-3" />
                        )}
                        Refresh QR Code
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={handleRefreshQr}
                      disabled={qrLoading}
                    >
                      {qrLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <QrCode className="mr-2 h-4 w-4" />
                      )}
                      Show QR Code
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phone Number */}
      <Card>
        <CardHeader>
          <CardTitle>Your Phone Number</CardTitle>
          <CardDescription>
            Link your phone so the bot identifies you in groups. Digits only
            (e.g., 5511999998888).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="5511999998888"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <Button onClick={handleSavePhone} disabled={phoneLoading}>
              {phoneLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bot Settings */}
      {config && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Bot Settings
              <div className="flex items-center gap-2">
                <Label htmlFor="active-switch" className="text-sm font-normal">
                  Active
                </Label>
                <Switch
                  id="active-switch"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>
            </CardTitle>
            <CardDescription>
              Configure which groups the bot should respond in.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Allowed Groups</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadGroups}
                  disabled={groupsLoading || connectionState !== "open"}
                >
                  {groupsLoading ? (
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  ) : (
                    <Users className="mr-2 h-3 w-3" />
                  )}
                  Load Groups
                </Button>
              </div>

              {connectionState !== "open" && (
                <p className="text-sm text-muted-foreground">
                  Connect WhatsApp first to load groups.
                </p>
              )}

              {/* Group list from WhatsApp */}
              {availableGroups.length > 0 && (
                <div className="max-h-60 space-y-1 overflow-y-auto rounded-md border p-3">
                  {availableGroups.map((group) => (
                    <label
                      key={group.id}
                      className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-muted"
                    >
                      <Checkbox
                        checked={allowedGroups.includes(group.id)}
                        onCheckedChange={() => toggleGroup(group.id)}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {group.subject}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {group.size} members
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {/* Manual add fallback */}
              <div className="flex gap-2">
                <Input
                  placeholder="Or type Group JID manually"
                  value={newGroup}
                  onChange={(e) => setNewGroup(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addGroup();
                    }
                  }}
                />
                <Button variant="outline" onClick={addGroup}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Selected groups */}
              {allowedGroups.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Selected ({allowedGroups.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {allowedGroups.map((groupId) => {
                      const group = availableGroups.find(
                        (g) => g.id === groupId
                      );
                      return (
                        <Badge
                          key={groupId}
                          variant="secondary"
                          className="gap-1 pr-1"
                        >
                          {group?.subject ?? groupId}
                          <button
                            onClick={() => toggleGroup(groupId)}
                            className="ml-1 rounded-full p-0.5 hover:bg-muted"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <Button onClick={handleSaveConfig} disabled={configLoading}>
              {configLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Settings
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
