"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { LEGAL_TEXTS, type LegalKey } from "@/lib/legal/texts";

interface LegalModalProps {
  open: LegalKey | null;
  onClose: () => void;
  /** Called when the user confirms reading; omitted for read-only views. */
  onAccept?: () => void;
  acceptLabel?: string;
}

/** Full-screen legal text. Only the content scrolls; the confirm button stays pinned at the bottom. */
export function LegalModal({ open, onClose, onAccept, acceptLabel = "Okudum, anladım" }: LegalModalProps) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;
  const text = LEGAL_TEXTS[open];

  return (
    <div role="dialog" aria-modal="true" aria-label={text.title} className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-[16px] font-bold text-foreground">{text.title}</h2>
        <button type="button" onClick={onClose} aria-label="Kapat" className="text-muted">
          <X size={22} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto flex max-w-[390px] flex-col gap-4 text-[14px] leading-6 text-foreground">
          {text.paragraphs.map((p) =>
            p.startsWith("# ") ? (
              <h3 key={p} className="mt-2 text-[15px] font-bold">
                {p.slice(2)}
              </h3>
            ) : (
              <p key={p}>{p}</p>
            )
          )}
        </div>
      </div>

      <div className="border-t border-border bg-background px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
        <button
          type="button"
          onClick={() => {
            onAccept?.();
            onClose();
          }}
          className="flex h-12 w-full items-center justify-center rounded-full bg-[#0B69D4] text-[16px] font-bold text-white"
        >
          {onAccept ? acceptLabel : "Kapat"}
        </button>
      </div>
    </div>
  );
}
