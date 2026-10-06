"use client";

import { Moon } from "lucide-react";
import { useTheme, setTheme } from "@/components/layout/ThemeToggle";
import { Switch } from "@/components/ui/Switch";
import { SettingsRow } from "./SettingsRow";

/** Dark theme row. Shares the theme store with the header toggle (data-theme + localStorage). */
export function ThemeSwitchRow() {
  const theme = useTheme();
  const on = theme === "dark";

  return (
    <SettingsRow
      icon={Moon}
      title="Karanlık Tema"
      subtitle={on ? "Aktif" : "Kapalı"}
      right={<Switch label="Karanlık tema" checked={on} onCheckedChange={(next) => setTheme(next ? "dark" : "light")} />}
    />
  );
}
