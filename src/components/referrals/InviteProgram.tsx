"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/** Copy the referral code, or share the invite link (native share sheet when available, clipboard otherwise). */
export function InviteProgram({ code, url }: { code: string; url: string }) {
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

  async function copy(text: string, kind: "code" | "link") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Clipboard can be blocked (insecure context, permissions); the code stays visible for manual copy.
    }
  }

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Ultima FX", text: "Ultima FX'e katıl", url });
        return;
      } catch {
        // Share sheet dismissed: fall back to copying the link.
      }
    }
    await copy(url, "link");
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-border bg-surface-2 px-4 py-3">
        <div className="flex min-w-0 flex-col">
          <span className="text-[11px] font-bold uppercase tracking-wide text-muted">Referans kodunuz</span>
          <span className="num-tabular text-[20px] font-extrabold tracking-[0.2em] text-foreground">{code}</span>
        </div>
        <button
          type="button"
          onClick={() => copy(code, "code")}
          className={cn(
            "flex h-10 shrink-0 items-center gap-1.5 rounded-xl border px-3.5 text-[13px] font-bold transition-colors",
            copied === "code" ? "border-positive/40 bg-positive-bg text-positive" : "border-border bg-surface text-foreground"
          )}
        >
          {copied === "code" ? <Check size={15} /> : <Copy size={15} />}
          {copied === "code" ? "Kopyalandı" : "Kopyala"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => copy(url, "link")}
          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface text-[13px] font-bold text-foreground"
        >
          {copied === "link" ? <Check size={15} /> : <Copy size={15} />}
          {copied === "link" ? "Link kopyalandı" : "Linki kopyala"}
        </button>
        <button
          type="button"
          onClick={share}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-brand text-[13px] font-bold text-brand-foreground transition-opacity hover:opacity-90"
        >
          <Share2 size={15} /> Davet et
        </button>
      </div>
    </div>
  );
}
