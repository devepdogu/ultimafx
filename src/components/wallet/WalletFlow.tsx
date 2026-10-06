"use client";

import { useActionState, useEffect, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { ArrowLeft, Check, Copy, Landmark, Bitcoin, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toaster";
import { createDepositRequestAction, createWithdrawalRequestAction, type WalletActionResult } from "@/lib/wallet/actions";
import { parseAmount } from "@/lib/term-deposit/amount";
import { BalanceCard } from "@/components/wallet/BalanceCard";
import { CurrencyFlag } from "@/components/wallet/CurrencyFlag";
import { cn } from "@/lib/utils/cn";
import { ProviderBadge } from "@/components/admin/ProviderBadge";
import { BANK_PRESETS, CRYPTO_NETWORK_PRESETS, presetFor } from "@/lib/admin/presets";

export interface BankItem {
  id: string;
  bankName: string;
  branch: string | null;
  iban: string;
  accountHolder: string;
  instructions: string | null;
  logoUrl: string | null;
  color: string;
}

export interface CryptoItem {
  id: string;
  asset: string;
  network: string;
  address: string;
  label: string;
  logoUrl: string | null;
  color: string;
}

type Method = "TRY" | "CRYPTO";
const money = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const tryFmt = (v: number) => `₺${money.format(v)}`;
const initial: WalletActionResult = {};
const QUICK_DEPOSIT = [500, 1000, 5000, 10000];
const NETWORKS = ["TRC20", "ERC20", "BEP20"];

export function WalletFlow({
  mode,
  cashBalance,
  usdBalance,
  banks,
  cryptos,
  usdTry,
}: {
  mode: "deposit" | "withdraw";
  cashBalance: number;
  usdBalance: number;
  banks: BankItem[];
  cryptos: CryptoItem[];
  usdTry: number | null;
}) {
  const router = useRouter();
  const toast = useToast();
  const isDeposit = mode === "deposit";
  const labels = isDeposit
    ? ["Ödeme yöntemi", "Hesap seçimi", "Tutar", "Özet"]
    : ["Çekim yöntemi", "Tutar", "Özet"];
  const total = labels.length;

  const [step, setStep] = useState(1);
  const [method, setMethod] = useState<Method | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [amountRaw, setAmountRaw] = useState("");
  const [iban, setIban] = useState("");
  const [bankName, setBankName] = useState("");
  const [holder, setHolder] = useState("");
  const [address, setAddress] = useState("");
  const [network, setNetwork] = useState("TRC20");

  const amount = parseAmount(amountRaw);
  const amountOk = Number.isFinite(amount) && amount > 0;
  const overBalance = !isDeposit && amountOk && amount > cashBalance;
  const selectedBank = banks.find((b) => b.id === targetId) ?? null;
  const selectedCrypto = cryptos.find((c) => c.id === targetId) ?? null;

  const [depositState, depositAction, depositPending] = useActionState(createDepositRequestAction, initial);
  const [withdrawState, withdrawAction, withdrawPending] = useActionState(createWithdrawalRequestAction, initial);
  const state = isDeposit ? depositState : withdrawState;
  const pending = isDeposit ? depositPending : withdrawPending;
  const done = !!state.success;

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state, toast]);

  const label = done ? "Talep alındı" : labels[step - 1];
  const canNext = (() => {
    if (isDeposit) {
      if (step === 1) return method !== null;
      if (step === 2) return targetId !== null;
      if (step === 3) return amountOk;
    } else {
      if (step === 1) {
        if (method === null) return false;
        if (method === "TRY") return iban.replace(/\s/g, "").length >= 26 && bankName.trim().length >= 2 && holder.trim().length >= 2;
        return address.trim().length >= 10 && network.length > 0;
      }
      if (step === 2) return amountOk && !overBalance;
    }
    return false;
  })();

  function back() {
    if (step === 1) router.push("/cuzdan");
    else setStep((s) => s - 1);
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Kopyalandı");
    } catch {
      toast.error("Kopyalanamadı");
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 flex h-[60px] items-center gap-3 border-b border-border/60 bg-background/95 px-4 backdrop-blur">
        <button type="button" onClick={back} aria-label="Geri" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-foreground">
          <ArrowLeft size={18} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[16px] font-bold text-foreground">{label}</div>
          {!done && <div className="text-[12px] text-muted">{isDeposit ? "Para yatır" : "Para çek"} · Adım {step}/{total}</div>}
        </div>
        {!done && (
          <div className="flex gap-1">
            {labels.map((_, i) => (
              <span key={i} className={cn("h-1.5 w-5 rounded-full", i < step ? "bg-brand" : "bg-border")} />
            ))}
          </div>
        )}
      </header>

      <div className="flex flex-col gap-4 px-4 py-4">
        <BalanceCard label="Güncel bakiye" tryAmount={cashBalance} usdtRate={usdTry} />

        {usdBalance > 0 && (
          <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4">
            <CurrencyFlag code="US" size={36} />
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-bold text-foreground">Dolar bakiyeniz: ${usdBalance.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="mt-1 text-[13px] text-muted">
                {isDeposit
                  ? "Yatırmalar TL ile yapılır. Dolar bakiyeniz vadeli birikimde kullanılabilir."
                  : "Para çekme yalnızca TL ile yapılabilir. Dolarınızı önce TL'ye çevirin."}
              </p>
              <Link href="/cuzdan/vadeli-mevduat" className="mt-2 inline-flex text-[13px] font-semibold text-brand">
                {isDeposit ? "Dolar bakiyemi yönet" : "Doları TL'ye çevir"} →
              </Link>
            </div>
          </div>
        )}

        {done ? (
          <ReceiptResult
            isDeposit={isDeposit}
            amount={amount}
            reference={state.reference ?? ""}
            message={state.success ?? ""}
            provider={receiptProvider(isDeposit, method, selectedBank, selectedCrypto, bankName, iban, network, address)}
          />
        ) : (
          <form action={isDeposit ? depositAction : withdrawAction} className="flex flex-col gap-4">
            <input type="hidden" name="method" value={method === "TRY" ? "BANK_TRANSFER" : method === "CRYPTO" ? "CRYPTO" : ""} />
            <input type="hidden" name="targetId" value={targetId ?? ""} />
            <input type="hidden" name="amount" value={amountOk ? String(amount) : ""} />
            <input type="hidden" name="iban" value={iban} />
            <input type="hidden" name="bankName" value={bankName} />
            <input type="hidden" name="holder" value={holder} />
            <input type="hidden" name="address" value={address} />
            <input type="hidden" name="network" value={network} />

            {/* STEP: payment / withdrawal method (and withdrawal destination) */}
            {step === 1 && (
              <div className="flex flex-col gap-3">
                <MethodCard active={method === "TRY"} icon={Landmark} title="Türk Lirası" desc="Banka havalesi / EFT" onClick={() => { setMethod("TRY"); setTargetId(null); setExpanded(null); }} />
                <MethodCard active={method === "CRYPTO"} icon={Bitcoin} title="Kripto" desc="USDT · ağ üzerinden transfer" onClick={() => { setMethod("CRYPTO"); setTargetId(null); setExpanded(null); }} />

                {!isDeposit && method === "TRY" && (
                  <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
                    <Field label="IBAN" value={iban} onChange={(v) => setIban(v.toUpperCase())} placeholder="TR00 0000 0000 0000 0000 0000 00" />
                    <Field label="Banka adı" value={bankName} onChange={setBankName} placeholder="Örn. Ziraat Bankası" />
                    <Field label="Ad soyad" value={holder} onChange={setHolder} placeholder="Hesap sahibinin adı" />
                  </div>
                )}
                {!isDeposit && method === "CRYPTO" && (
                  <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
                    <Field label="Cüzdan adresi" value={address} onChange={setAddress} placeholder="USDT adresiniz" />
                    <div className="flex flex-col gap-2">
                      <span className="text-[12px] font-semibold text-muted">Ağ</span>
                      <div className="flex gap-2">
                        {NETWORKS.map((n) => (
                          <button key={n} type="button" onClick={() => setNetwork(n)} className={cn("h-9 flex-1 rounded-full border text-[13px] font-semibold", network === n ? "border-brand bg-brand-bg text-foreground" : "border-border text-muted")}>
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP: deposit account list with details */}
            {isDeposit && step === 2 && (
              <div className="flex flex-col gap-2">
                {method === "TRY" &&
                  (banks.length === 0 ? (
                    <Empty text="Aktif banka hesabı bulunmuyor." />
                  ) : (
                    banks.map((b) => (
                      <AccountCard
                        key={b.id}
                        active={targetId === b.id}
                        title={b.bankName}
                        subtitle={b.accountHolder}
                        logo={<ProviderBadge label={b.bankName} color={b.color} logoUrl={b.logoUrl} size={44} />}
                        onClick={() => { setTargetId(b.id); setExpanded(b.id); }}
                        open={expanded === b.id}
                      >
                        <DetailRow label="Banka" value={`${b.bankName}${b.branch ? ` · ${b.branch}` : ""}`} />
                        <DetailRow label="Ad soyad" value={b.accountHolder} />
                        <DetailRow label="IBAN" value={b.iban} copy={() => copy(b.iban)} />
                        {b.instructions && <p className="text-[12px] text-muted">{b.instructions}</p>}
                      </AccountCard>
                    ))
                  ))}
                {method === "CRYPTO" &&
                  (cryptos.length === 0 ? (
                    <Empty text="Aktif kripto adresi bulunmuyor." />
                  ) : (
                    cryptos.map((c) => (
                      <AccountCard
                        key={c.id}
                        active={targetId === c.id}
                        title={`${c.asset} · ${c.network}`}
                        subtitle={c.label}
                        logo={<ProviderBadge label={c.network} color={c.color} logoUrl={c.logoUrl} size={44} />}
                        onClick={() => { setTargetId(c.id); setExpanded(c.id); }}
                        open={expanded === c.id}
                      >
                        <DetailRow label="Ağ" value={c.network} />
                        <DetailRow label="Adres" value={c.address} copy={() => copy(c.address)} mono />
                        <p className="text-[12px] text-negative">Yalnızca {c.network} ağı üzerinden gönderin; yanlış ağ transferleri kaybettirebilir.</p>
                      </AccountCard>
                    ))
                  ))}
              </div>
            )}

            {/* STEP: amount */}
            {((isDeposit && step === 3) || (!isDeposit && step === 2)) && (
              <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
                <div className="flex items-center justify-between text-[12px] font-semibold text-muted">
                  <span>{isDeposit ? "Yatırılacak tutar (TL)" : "Çekilecek tutar (TL)"}</span>
                  {!isDeposit && <span>Kullanılabilir: {tryFmt(cashBalance)}</span>}
                </div>
                <input
                  inputMode="decimal"
                  value={amountRaw}
                  onChange={(e) => setAmountRaw(e.target.value.replace(/[^\d.,]/g, ""))}
                  placeholder="0,00"
                  className="h-14 rounded-xl border border-border bg-background px-4 text-[22px] font-bold text-foreground outline-none focus:border-brand"
                />
                {isDeposit ? (
                  <div className="grid grid-cols-4 gap-2">
                    {QUICK_DEPOSIT.map((q) => (
                      <button key={q} type="button" onClick={() => setAmountRaw(String(q))} className="h-9 rounded-full bg-surface-2 text-[12px] font-semibold text-foreground">
                        {q.toLocaleString("tr-TR")}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {[25, 50, 75, 100].map((p) => (
                      <button key={p} type="button" disabled={cashBalance <= 0} onClick={() => setAmountRaw(((cashBalance * p) / 100).toFixed(2).replace(".", ","))} className="h-9 rounded-full bg-surface-2 text-[12px] font-semibold text-foreground disabled:opacity-50">
                        {p === 100 ? "TÜMÜ" : `%${p}`}
                      </button>
                    ))}
                  </div>
                )}
                {isDeposit && method === "CRYPTO" && usdTry && amountOk && (
                  <p className="num-tabular text-[12px] text-muted">≈ {(amount / usdTry).toFixed(2)} USDT (USDT/TRY {money.format(usdTry)})</p>
                )}
                {overBalance && <p className="text-[12px] text-negative">Bakiyenizi aşıyor.</p>}
              </div>
            )}

            {/* STEP: summary */}
            {((isDeposit && step === 4) || (!isDeposit && step === 3)) && (
              <div className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-surface px-4">
                <SummaryRow label="Yöntem" value={method === "TRY" ? "Türk Lirası" : "Kripto (USDT)"} />
                {isDeposit && method === "TRY" && selectedBank && (
                  <ProviderSummary label={selectedBank.bankName} detail={selectedBank.iban} color={selectedBank.color} logoUrl={selectedBank.logoUrl} />
                )}
                {isDeposit && method === "CRYPTO" && selectedCrypto && (
                  <ProviderSummary label={`USDT · ${selectedCrypto.network}`} detail={selectedCrypto.address} color={selectedCrypto.color} logoUrl={selectedCrypto.logoUrl} />
                )}
                {!isDeposit && method === "TRY" && <SummaryRow label="Hesap" value={`${bankName} · ${iban}`} />}
                {!isDeposit && method === "TRY" && <SummaryRow label="Ad soyad" value={holder} />}
                {!isDeposit && method === "CRYPTO" && <SummaryRow label="Adres" value={`${network} · ${address}`} />}
                <SummaryRow label="Tutar" value={tryFmt(amountOk ? amount : 0)} strong />
                {isDeposit && method === "CRYPTO" && usdTry && amountOk && <SummaryRow label="Tahmini USDT" value={(amount / usdTry).toFixed(2)} />}
              </div>
            )}

            <div className="sticky bottom-[88px] z-20 flex flex-col gap-2 pt-2">
              {((isDeposit && step === total) || (!isDeposit && step === total)) ? (
                <Button key="submit" type="submit" disabled={pending || !amountOk || overBalance} className="h-12 w-full">
                  {pending ? "Gönderiliyor…" : isDeposit ? "Yatırım talebi gönder" : "Çekim talebi gönder"}
                </Button>
              ) : (
                <Button key="next" type="button" onClick={() => setStep((s) => s + 1)} disabled={!canNext} className="h-12 w-full">
                  Devam <ChevronRight size={16} />
                </Button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function MethodCard({ active, icon: Icon, title, desc, onClick }: { active: boolean; icon: typeof Landmark; title: string; desc: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={cn("flex items-center gap-4 rounded-2xl border p-4 text-left", active ? "border-brand bg-brand-bg" : "border-border bg-surface")}>
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-2 text-foreground"><Icon size={20} /></span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-bold text-foreground">{title}</span>
        <span className="block text-[12px] text-muted">{desc}</span>
      </span>
      {active && <Check size={18} className="text-brand" />}
    </button>
  );
}

function AccountCard({ active, title, subtitle, open, onClick, logo, children }: { active: boolean; title: string; subtitle: string; open: boolean; onClick: () => void; logo?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border transition-colors", active ? "border-foreground/50 bg-surface" : "border-border bg-surface")}>
      <button type="button" onClick={onClick} className="flex w-full items-center gap-3 p-4 text-left">
        {logo}
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-bold text-foreground">{title}</div>
          <div className="truncate text-[12px] text-muted">{subtitle}</div>
        </div>
        <ChevronRight size={16} className={cn("text-muted transition-transform", open && "rotate-90")} />
      </button>
      {open && <div className="flex flex-col gap-2 border-t border-border bg-surface-2/50 p-4">{children}</div>}
    </div>
  );
}

function DetailRow({ label, value, copy, mono }: { label: string; value: string; copy?: () => void; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase text-muted">{label}</div>
        <div className={cn("break-all text-[13px] text-foreground", mono && "font-mono")}>{value}</div>
      </div>
      {copy && (
        <button type="button" onClick={copy} aria-label="Kopyala" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-muted">
          <Copy size={14} />
        </button>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-semibold text-muted">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-12 rounded-xl border border-border bg-background px-3 text-[14px] text-foreground outline-none focus:border-brand" />
    </label>
  );
}

function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <span className="text-[13px] text-muted">{label}</span>
      <span className={cn("max-w-[65%] break-all text-right text-[13px] text-foreground", strong && "num-tabular text-[16px] font-bold")}>{value}</span>
    </div>
  );
}

/** Provider and destination for the receipt, taken from the selection the user just submitted. */
interface ReceiptProvider {
  label: string;
  color: string;
  logoUrl: string | null;
  detail: string;
}

function receiptProvider(
  isDeposit: boolean,
  method: Method | null,
  bank: BankItem | null,
  crypto: CryptoItem | null,
  bankName: string,
  iban: string,
  network: string,
  address: string
): ReceiptProvider {
  if (method === "CRYPTO") {
    if (isDeposit && crypto) return { label: `USDT · ${crypto.network}`, color: crypto.color, logoUrl: crypto.logoUrl, detail: crypto.address };
    const net = presetFor(CRYPTO_NETWORK_PRESETS, network);
    return { label: `USDT · ${net.value}`, color: net.color, logoUrl: net.logoUrl ?? null, detail: address };
  }
  if (isDeposit && bank) return { label: bank.bankName, color: bank.color, logoUrl: bank.logoUrl, detail: bank.iban };
  const preset = presetFor(BANK_PRESETS, bankName);
  return { label: preset.label, color: preset.color, logoUrl: preset.logoUrl ?? null, detail: iban };
}

/** Result screen after a request is created: amount, destination, reference and the next step. */
function ReceiptResult({ isDeposit, amount, reference, message, provider }: { isDeposit: boolean; amount: number; reference: string; message: string; provider: ReceiptProvider }) {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-border bg-surface p-6 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-positive-bg text-positive">
          <Check size={28} />
        </span>
        <div className="flex flex-col gap-1">
          <span className="text-[16px] font-extrabold text-foreground">{message}</span>
          <span className="text-[12px] text-muted">Talebiniz onay sırasında. Sonuç bildirim olarak size iletilecek.</span>
        </div>
        <span className="num-tabular text-[30px] font-extrabold leading-none text-foreground">{tryFmt(amount)}</span>
        <span className="rounded-full bg-[#F59E0B]/13 px-3 py-1 text-[11px] font-bold text-[#F59E0B]">ONAY BEKLENİYOR</span>
      </div>

      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-surface p-5">
        <div className="flex items-center gap-3">
          <ProviderBadge label={provider.label} color={provider.color} logoUrl={provider.logoUrl} size={44} />
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wide text-muted">{isDeposit ? "Gönderilecek hesap" : "Ödenecek hesap"}</span>
            <span className="text-[14px] font-bold text-foreground">{provider.label}</span>
          </div>
        </div>
        <div className="break-all rounded-xl bg-surface-2 px-3.5 py-3 font-mono text-[12px] text-foreground">{provider.detail}</div>
        {reference && (
          <div className="flex flex-col gap-0.5 border-t border-border pt-4">
            <span className="text-[11px] font-bold uppercase tracking-wide text-muted">Referans kodu</span>
            <span className="num-tabular text-[17px] font-extrabold tracking-wider text-foreground">{reference}</span>
          </div>
        )}
      </div>

      {isDeposit && (
        <div className="flex flex-col gap-2 rounded-2xl bg-surface-2 p-4">
          <span className="text-[12px] font-bold text-foreground">Sonraki adım</span>
          <span className="text-[12px] leading-5 text-muted">Transfer açıklamasına referans kodunu yazın. Para hesabınıza ulaştığında talep onaylanır ve bakiyeniz güncellenir.</span>
        </div>
      )}

      <Button onClick={() => router.push("/cuzdan")} className="w-full">Cüzdana dön</Button>
    </div>
  );
}

/** Selected bank or network on the confirmation step: badge, name and the destination in one card. */
function ProviderSummary({ label, detail, color, logoUrl }: { label: string; detail: string; color: string; logoUrl: string | null }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface-2 p-4">
      <ProviderBadge label={label} color={color} logoUrl={logoUrl} size={44} />
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[14px] font-bold text-foreground">{label}</span>
        <span className="break-all font-mono text-[12px] text-muted">{detail}</span>
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-2xl border border-dashed border-border p-6 text-center text-[13px] text-muted">{text}</p>;
}
