"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ShareInvite({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Ultima FX", text: "Ultima FX'e katıl", url });
        return;
      } catch {
        // kullanıcı paylaşımı iptal etti — kopyalamaya düş
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button type="button" onClick={share} className="w-full">
      {copied ? <Check size={16} /> : <Share2 size={16} />}
      {copied ? "Bağlantı kopyalandı" : "Davet et"}
    </Button>
  );
}
