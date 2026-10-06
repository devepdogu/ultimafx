import { prisma } from "@/lib/prisma/client";
import { PromoCarousel, type PromoSlide } from "@/components/dashboard/PromoCarousel";
import { Link } from "@/i18n/navigation";

/** Admin-authored promo slides. Renders nothing when no banner is published. */
export async function HomeBanners() {
  const banners = await prisma.banner.findMany({
    where: { isActive: true },
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    take: 6,
  });
  if (banners.length === 0) return null;

  const slides: PromoSlide[] = banners.map((b) => ({
    id: b.id,
    node: (
      <div className="relative h-[117px] overflow-hidden rounded-xl bg-brand">
        {b.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- admin-provided image
          <img src={b.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
        )}
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="text-[20px] font-bold leading-6 text-white">{b.title}</div>
          {b.subtitle && <div className="text-[13px] leading-[18px] text-white/85">{b.subtitle}</div>}
        </div>
        {b.linkUrl && <Link href={b.linkUrl} className="absolute inset-0" aria-label={b.title} />}
      </div>
    ),
  }));

  return <PromoCarousel slides={slides} />;
}
