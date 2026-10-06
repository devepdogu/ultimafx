"use client";

import { useState, useTransition } from "react";
import { ImagePlus, X } from "lucide-react";
import { uploadImageAction } from "@/lib/uploads/actions";
import { cn } from "@/lib/utils/cn";

/**
 * Image picker for admin forms. Choosing a file uploads it right away and stores the resulting path
 * in a hidden input, so the surrounding form submits the same field it did when it took a URL.
 */
export function ImageField({
  name,
  label,
  hint,
  defaultValue,
  className,
}: {
  name: string;
  label: string;
  hint?: string;
  defaultValue?: string | null;
  className?: string;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onPick(file: File | undefined) {
    if (!file) return;
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    startTransition(async () => {
      const r = await uploadImageAction(fd);
      if (r.error) setError(r.error);
      if (r.url) setValue(r.url);
    });
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-[12px] font-bold text-foreground">{label}</span>
      <input type="hidden" name={name} value={value} />
      <div className="flex items-center gap-3 rounded-lg border border-dashed border-border bg-surface-2 p-3">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element -- admin-uploaded local file, preview only
          <img src={value} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
        ) : (
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-surface text-muted">
            <ImagePlus size={20} />
          </span>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <label className="inline-flex w-fit cursor-pointer items-center rounded-lg border border-border bg-surface px-3 py-1.5 text-[12px] font-bold hover:border-foreground/40">
            {pending ? "Yükleniyor..." : value ? "Görseli değiştir" : "Görsel seç"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              disabled={pending}
              onChange={(e) => onPick(e.currentTarget.files?.[0])}
            />
          </label>
          <span className="truncate text-[11px] text-muted">{value || hint || "PNG, JPG veya WEBP. En fazla 3 MB."}</span>
          {error && <span className="text-[11px] font-semibold text-negative">{error}</span>}
        </div>
        {value && (
          <button type="button" onClick={() => setValue("")} aria-label="Görseli kaldır" className="shrink-0 rounded-lg p-1.5 text-muted hover:bg-surface">
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
