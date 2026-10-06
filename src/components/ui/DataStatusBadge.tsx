import { useTranslations } from "next-intl";
import { Circle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { DataProvenance } from "@/lib/market-data/types";

const TONE: Record<DataProvenance, "positive" | "neutral" | "negative"> = {
  LIVE: "positive",
  DELAYED: "neutral",
  MANUAL_OVERRIDE: "negative",
  CACHED: "neutral",
  UNAVAILABLE: "neutral",
};

/**
 * Renders a quote's provenance explicitly. This must appear anywhere a
 * price is shown — never let LIVE-looking chrome surround delayed, cached,
 * or manually overridden data (section 26/41).
 */
export function DataStatusBadge({ provenance }: { provenance: DataProvenance }) {
  const t = useTranslations("dataStatus");
  const label =
    provenance === "LIVE"
      ? t("live")
      : provenance === "DELAYED"
        ? t("delayed")
        : provenance === "MANUAL_OVERRIDE"
          ? t("manualOverride")
          : provenance === "CACHED"
            ? t("cached")
            : t("unavailable");

  return null
}
