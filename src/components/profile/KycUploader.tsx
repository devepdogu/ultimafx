"use client";

import { useActionState, useState } from "react";
import { FileCheck2, Upload } from "lucide-react";
import { uploadKycAction, type ProfileActionState } from "@/lib/profile/actions";
import { cn } from "@/lib/utils/cn";

export interface KycDocMeta {
  side: "FRONT" | "BACK";
  fileName: string;
}

const SIDES: { side: "FRONT" | "BACK"; label: string; hint: string }[] = [
  { side: "FRONT", label: "Kimlik Ön Yüz", hint: "TC kimlik kartı veya ehliyet ön yüzü" },
  { side: "BACK", label: "Kimlik Arka Yüz", hint: "Belgenin arka yüzü" },
];

/** Two upload slots (front and back). Files are stored server-side; the page shows only their names. */
export function KycUploader({ docs }: { docs: KycDocMeta[] }) {
  return (
    <div className="flex flex-col gap-3">
      {SIDES.map((s) => (
        <KycSlot key={s.side} side={s.side} label={s.label} hint={s.hint} uploadedName={docs.find((d) => d.side === s.side)?.fileName ?? null} />
      ))}
      <p className="text-[11px] leading-4 text-muted">JPG, PNG, WEBP veya PDF. En fazla 5 MB.</p>
    </div>
  );
}

function KycSlot({ side, label, hint, uploadedName }: { side: "FRONT" | "BACK"; label: string; hint: string; uploadedName: string | null }) {
  const [state, formAction, pending] = useActionState<ProfileActionState, FormData>(uploadKycAction, {});
  const [picked, setPicked] = useState<string | null>(null);

  return (
    <form action={formAction} className="flex flex-col gap-2 rounded-xl border border-dashed border-border bg-surface-2 p-3.5">
      <input type="hidden" name="side" value={side} />
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            uploadedName ? "bg-positive-bg text-positive" : "bg-surface text-muted"
          )}
        >
          {uploadedName ? <FileCheck2 size={18} /> : <Upload size={18} />}
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-[14px] font-bold text-foreground">{label}</span>
          <span className="truncate text-[12px] text-muted">{picked ?? uploadedName ?? hint}</span>
        </div>
      </div>
      <label className="flex h-10 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface text-[13px] font-semibold text-foreground hover:border-brand">
        {uploadedName ? "Değiştir" : "Dosya seç"}
        <input
          name="file"
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          required
          className="sr-only"
          onChange={(e) => {
            const f = e.currentTarget.files?.[0];
            setPicked(f?.name ?? null);
            if (f) e.currentTarget.form?.requestSubmit();
          }}
        />
      </label>
      {pending && <span className="text-[12px] text-muted">Yükleniyor...</span>}
      {state.error && <span className="text-[12px] font-semibold text-negative">{state.error}</span>}
      {state.ok && !pending && <span className="text-[12px] font-semibold text-positive">Belge yüklendi.</span>}
    </form>
  );
}
