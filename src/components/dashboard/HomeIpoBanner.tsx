import { ArrowRight, Rocket } from "lucide-react";
import { prisma } from "@/lib/prisma/client";
import { Link } from "@/i18n/navigation";

/** Next published IPO as a pill card. Honest empty state when none is published. */
export async function HomeIpoBanner() {
  const ipo = await prisma.iPO.findFirst({
    where: { isPublished: true, status: { in: ["ACTIVE", "UPCOMING"] } },
    orderBy: [{ isFeatured: "desc" }, { demandCollectionStart: "asc" }],
  });

  const className =
    "relative flex items-center gap-3 overflow-hidden rounded-full border border-[#9EC3E0] bg-[#E6F1FB] px-3 py-2.5 " +
    "bg-[repeating-linear-gradient(115deg,transparent_0,transparent_14px,rgba(112,163,203,0.12)_14px,rgba(112,163,203,0.12)_15px)]";

  if (!ipo) {
    return (
      <div className={className}>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5 px-1">
          <span className="text-[15px] font-semibold text-[#0C304D]">Halka Arz</span>
          <span className="text-[13px] text-[#24475F]">Yayınlanmış halka arz bulunmuyor.</span>
        </div>
        <Rocket size={18} className="mr-2 shrink-0 text-[#24475F]" />
      </div>
    );
  }

  const live = ipo.status === "ACTIVE";
  const demand = ipo.demandRatio != null ? Number(ipo.demandRatio) : null;

  return (
    <Link href={`/halka-arz?ipo=${ipo.code}`} className={className}>
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white text-[13px] font-extrabold text-[#0C304D] shadow-sm">
        {ipo.code.replace(/-+$/, "").slice(0, 4)}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-semibold text-[#0C304D]">Halka Arz</span>
          <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-[#805000]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#805000]" />
            {live ? "Talep toplanıyor" : "Yakında"}
          </span>
        </div>
        <span className="truncate text-[13px] text-[#24475F]">{ipo.companyName}</span>
        {demand != null && (
          <span className="text-[12px] text-[#24475F]">
            Talep <span className="font-bold text-[#0C304D]">%{demand.toLocaleString("tr-TR", { maximumFractionDigits: 1 })}</span>
          </span>
        )}
      </div>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#70A3CB] bg-white/60">
        <ArrowRight size={16} className="text-[#24475F]" />
      </span>
    </Link>
  );
}
