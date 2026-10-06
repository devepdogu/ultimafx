import { ArrowRight, Rocket } from "lucide-react";
import { prisma } from "@/lib/prisma/client";
import { Link } from "@/i18n/navigation";
import { formatDateTime } from "@/lib/utils/format";

/** Next published IPO. Shows an honest empty state when none is published. */
export async function HomeIpoBanner() {
  const ipo = await prisma.iPO.findFirst({
    where: { isPublished: true, status: { in: ["ACTIVE", "UPCOMING"] } },
    orderBy: [{ isFeatured: "desc" }, { demandCollectionStart: "asc" }],
  });

  const body = ipo ? (
    <>
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-semibold text-[#0C304D]">Halka Arz</span>
          <span className="rounded-[4px] bg-[#FFE8B0] px-1.5 py-px text-[10px] font-bold text-[#805000]">
            {ipo.status === "ACTIVE" ? "TALEP TOPLANIYOR" : "YAKINDA"}
          </span>
        </div>
        <span className="truncate text-[13px] text-[#24475F]">{ipo.companyName}</span>
        {ipo.demandCollectionStart && (
          <span className="text-[12px] text-[#24475F]">Talep: {formatDateTime(ipo.demandCollectionStart.toISOString())}</span>
        )}
      </div>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#9EBBD0] bg-white/45">
        <ArrowRight size={14} className="text-[#24475F]" />
      </span>
    </>
  ) : (
    <>
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-[15px] font-semibold text-[#0C304D]">Halka Arz</span>
        <span className="text-[13px] text-[#24475F]">Yayınlanmış halka arz bulunmuyor.</span>
      </div>
      <Rocket size={18} className="shrink-0 text-[#24475F]" />
    </>
  );

  const className =
    "relative flex items-center justify-between gap-3 overflow-hidden rounded-[27px] border border-[#70A3CB]/45 bg-[#DCECFA]/60 px-4 py-3";

  return ipo ? (
    <Link href={`/halka-arz/${ipo.code}`} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}
