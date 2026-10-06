"use client";

import { cn } from "@/lib/utils/cn";
import { useRef, useState, type ReactNode } from "react";

export interface PromoSlide {
  id: string;
  node: ReactNode;
}

/** Scroll-snap carousel with the reference's indicator bar (5px tall, active 16px wide, white). */
export function PromoCarousel({ slides }: { slides: PromoSlide[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  function onScroll() {
    const el = ref.current;
    if (!el || el.clientWidth === 0) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  function go(i: number) {
    const el = ref.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  }

  return (
    <div className="relative mb-2 -mx-4">
      <div
        ref={ref}
        onScroll={onScroll}
        className="flex w-full z-30 snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((s,i) => (
          <div key={s.id} className={cn("shrink-0 snap-start w-85.5", i === 0 ? "pl-4 " : "", i === slides.length - 1 ? "pr-4" : "")}>
            {s.node}
          </div>
        ))}
      </div>
      {slides.length > 1 && (
        <div className="-mt-4 flex items-center relative z-50 justify-center gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Slayt ${i + 1}`}
              onClick={() => go(i)}
              className={`h-[5px] rounded-full transition-all duration-150 ${
                i === index ? "w-4 bg-surface" : "w-[5px] bg-surface/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
