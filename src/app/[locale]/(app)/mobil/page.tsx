import { Smartphone } from "lucide-react";
import { Card } from "@/components/ui/Card";

const IOS_STEPS = [
  "Safari ile bu sayfayı açın",
  "Alt kısımdaki paylaş butonuna dokunun",
  "\"Ana Ekrana Ekle\" seçin ve \"Ekle\"ye dokunun",
];

export default function MobilePage() {
  return (
    <div className="flex flex-col gap-4 px-4 py-6">
      <h1 className="text-xl font-bold">Mobil Uygulama</h1>

      <Card className="flex flex-col gap-3">
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
      </Card>

      <Card className="flex flex-col gap-2">
        <div className="flex items-center gap-2 font-semibold">
          <Smartphone size={18} className="text-brand" /> Android · Hızlı Kurulum
        </div>
        <p className="text-sm text-muted">
          Chrome ile bu sayfayı açın, menüden &quot;Uygulamayı yükle&quot; ya da &quot;Ana ekrana ekle&quot; seçeneğini kullanın.
        </p>
      </Card>
    </div>
  );
}
