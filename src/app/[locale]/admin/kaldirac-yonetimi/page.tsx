import { prisma } from "@/lib/prisma/client";
import { AdminActionForm, AdminField, ADMIN_INPUT } from "@/components/admin/AdminForm";
import { AdminPageHeader, AdminPanel } from "@/components/admin/AdminUi";
import { updateLeverageConfigAction } from "@/lib/admin/leverage-config-actions";
import type { AssetType } from "@prisma/client";

const TYPE_LABEL: Partial<Record<AssetType, string>> = {
  STOCK: "BIST",
  US_STOCK: "Nasdaq",
  INDEX: "Endeks",
  CURRENCY: "Parite",
  COMMODITY: "Emtia",
  CRYPTO: "Kripto",
  FUND: "Fon",
};

// INTEREST_PRODUCT (term deposits) and CUSTOM aren't real leveraged-trading categories in this
// app today — leaving them out rather than showing a meaningless config card for either.
const ORDER: AssetType[] = ["STOCK", "US_STOCK", "COMMODITY", "INDEX", "CURRENCY", "CRYPTO", "FUND"];

export default async function AdminLeverageConfigPage() {
  const rows = await prisma.leverageConfig.findMany();
  const byType = new Map(rows.map((r) => [r.type, r]));

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <AdminPageHeader
        title="Kaldıraç Yönetimi"
        description="Varlık türüne göre kaldıraç & işlem ayarları. Kaldıraç/lot/min lot işlem motoru tarafından gerçekten uygulanır; spread ve swap şu an yalnızca saklanır/gösterilir, fiyatlandırmaya henüz yansımaz."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {ORDER.map((type) => {
          const cfg = byType.get(type);
          return (
            <AdminPanel key={type} title={TYPE_LABEL[type] ?? type}>
              <AdminActionForm action={updateLeverageConfigAction} submitLabel="Kaydet">
                <input type="hidden" name="type" value={type} />
                <div className="grid grid-cols-2 gap-4">
                  <AdminField label="Kaldıraç" hint="Örn. 10 → 1:10">
                    <input name="maxLeverage" type="number" step="1" min="1" required defaultValue={cfg?.maxLeverage ?? 1} className={ADMIN_INPUT} />
                  </AdminField>
                  <AdminField label="Lot Büyüklüğü">
                    <input name="contractSize" type="number" step="0.000001" min="0.000001" required defaultValue={cfg ? Number(cfg.contractSize) : 1} className={ADMIN_INPUT} />
                  </AdminField>
                  <AdminField label="Min Lot">
                    <input name="minLot" type="number" step="0.000001" min="0.000001" required defaultValue={cfg ? Number(cfg.minLot) : 0.01} className={ADMIN_INPUT} />
                  </AdminField>
                  <AdminField label="Spread (%)">
                    <input name="spreadPercent" type="number" step="0.0001" min="0" required defaultValue={cfg ? Number(cfg.spreadPercent) : 0} className={ADMIN_INPUT} />
                  </AdminField>
                  <AdminField label="Long Swap">
                    <input name="longSwap" type="number" step="0.0001" required defaultValue={cfg ? Number(cfg.longSwap) : 0} className={ADMIN_INPUT} />
                  </AdminField>
                  <AdminField label="Short Swap">
                    <input name="shortSwap" type="number" step="0.0001" required defaultValue={cfg ? Number(cfg.shortSwap) : 0} className={ADMIN_INPUT} />
                  </AdminField>
                </div>
              </AdminActionForm>
            </AdminPanel>
          );
        })}
      </div>
    </div>
  );
}
