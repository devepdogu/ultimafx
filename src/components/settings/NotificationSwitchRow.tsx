"use client";

import { useSyncExternalStore } from "react";
import { Bell } from "lucide-react";
import { Switch } from "@/components/ui/Switch";
import { SettingsRow } from "./SettingsRow";

const KEY = "ultima-notifications";
const CHANGE_EVENT = "ultima-notifications-change";

function subscribe(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  return () => window.removeEventListener(CHANGE_EVENT, callback);
}

function getSnapshot(): boolean {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

function setEnabled(next: boolean) {
  try {
    localStorage.setItem(KEY, next ? "on" : "off");
  } catch {
    // Best-effort — a blocked localStorage just means the choice won't persist.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Push notification preference kept on this device. Delivery rules are not wired yet. */
export function NotificationSwitchRow() {
  const on = useSyncExternalStore(subscribe, getSnapshot, () => true);

  return (
    <SettingsRow
      icon={Bell}
      title="Bildirimler"
      subtitle={on ? "Açık" : "Kapalı"}
      right={<Switch label="Bildirimler" checked={on} onCheckedChange={setEnabled} />}
    />
  );
}
