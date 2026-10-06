"use client";

import { useState } from "react";
import { Smartphone } from "lucide-react";
import { BottomSheet } from "@/components/ui/BottomSheet";

const IOS_STEPS = [
  "Safari ile bu sayfayı açın",
  "Alt kısımdaki paylaş butonuna dokunun",
  "\"Ana Ekrana Ekle\" seçin ve \"Ekle\"ye dokunun",
];

/** Quick action that opens the install guide in a drawer instead of a separate page. */
export function MobileInstallAction() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="flex w-12 shrink-0 flex-col items-center gap-2">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background">
          <Smartphone size={22} />
        </span>
        <span className="whitespace-nowrap text-center text-[11px] font-semibold text-foreground">Mobil İndir</span>
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Mobil Uygulama">
        <div className="flex flex-col gap-5 pb-2">
          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2 font-semibold">
              <Smartphone size={18} className="text-brand" /> iOS · Ana Ekrana Ekle
            </div>
            <ol className="flex flex-col gap-2 text-sm">
              {IOS_STEPS.map((step, i) => (
                <li key={step} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-bg text-xs font-bold text-brand">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="flex flex-col gap-2">
            <div className="flex items-center gap-2 font-semibold">
              <Smartphone size={18} className="text-brand" /> Android · Hızlı Kurulum
            </div>
            <p className="text-sm text-muted">
              Chrome ile bu sayfayı açın, menüden &quot;Uygulamayı yükle&quot; ya da &quot;Ana ekrana ekle&quot; seçeneğini kullanın.
            </p>
          </section>
        </div>
      </BottomSheet>
    </>
  );
}
