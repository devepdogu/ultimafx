"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { Check, CircleAlert, Info, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type ToastKind = "success" | "error" | "info";

interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);
const MAX_VISIBLE = 3;
const DURATION_MS = 3800;

/** Small in-app toast stack (top-center, non-blocking). Use `useToast()` from any client component. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setItems((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (kind: ToastKind, message: string) => {
      const id = nextId.current++;
      setItems((list) => [...list.slice(-(MAX_VISIBLE - 1)), { id, kind, message }]);
      window.setTimeout(() => dismiss(id), DURATION_MS);
    },
    [dismiss]
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (m) => push("success", m),
      error: (m) => push("error", m),
      info: (m) => push("info", m),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-3 z-[60] mx-auto flex max-w-[420px] flex-col items-center gap-2 px-3"
      >
        {items.map((t) => (
          <ToastCard key={t.id} item={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const Icon = item.kind === "success" ? Check : item.kind === "error" ? CircleAlert : Info;
  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto flex w-full items-center gap-3 rounded-2xl border bg-surface px-3.5 py-3 shadow-lg",
        "animate-[toast-in_180ms_ease-out]",
        item.kind === "success" && "border-[#00A651]/40",
        item.kind === "error" && "border-[#FF4976]/40",
        item.kind === "info" && "border-border"
      )}
    >
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
          item.kind === "success" && "bg-[#00A651]/15 text-[#00A651]",
          item.kind === "error" && "bg-[#FF4976]/15 text-[#FF4976]",
          item.kind === "info" && "bg-surface-2 text-muted"
        )}
      >
        <Icon size={15} strokeWidth={2.5} />
      </span>
      <span className="min-w-0 flex-1 text-[13px] font-medium leading-5 text-foreground">{item.message}</span>
      <button type="button" onClick={onDismiss} aria-label="Kapat" className="shrink-0 text-muted">
        <X size={16} />
      </button>
    </div>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
