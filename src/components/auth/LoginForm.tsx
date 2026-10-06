"use client";

import { useActionState, useState } from "react";
import { Link } from "@/i18n/navigation";
import { loginAction, type ActionResult } from "@/lib/auth/actions";
import { CreditCard, Phone, Lock, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { LegalModal } from "@/components/auth/LegalModal";
import type { LegalKey } from "@/lib/legal/texts";

const initialState: ActionResult = {};

const fieldClass =
  "flex h-[52px] w-full items-center gap-3 rounded-[12px] border border-[#2A3B52] bg-[#111820] px-4 text-[14px] text-white outline-none focus-within:border-[#58ABFF]";
const inputClass = "min-w-0 flex-1 bg-transparent outline-none placeholder:text-[#7A8AA0]";

type Mode = "tc" | "phone";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const [mode, setMode] = useState<Mode>("tc");
  const [modal, setModal] = useState<LegalKey | null>(null);

  return (
    <div>
      <div className="text-center text-[13px] font-semibold text-[#58ABFF]">Profesyonel Forex &amp; Borsa Platformu</div>
      <div className="mt-1 text-center text-[13px] text-[#BECBDD]">
        Hesabınız yok mu?{" "}
        <Link href="/kayit" className="font-bold text-white underline">
          Müşteri Ol
        </Link>
      </div>

      <div className="mt-[26px] flex gap-2">
        <button
          type="button"
          onClick={() => setMode("tc")}
          className={cn(
            "flex h-10.5 flex-1 items-center justify-center gap-2 rounded-[12px] border text-[13px] font-bold",
            mode === "tc" ? "border-[#0B69D4] bg-[#0B69D4] text-white" : "border-[#2A3B52] bg-[#111820] text-[#BECBDD]"
          )}
        >
          <CreditCard size={15} />
          T.C. Kimlik ile
        </button>
        <button
          type="button"
          onClick={() => setMode("phone")}
          className={cn(
            "flex h-10.5 flex-1 items-center justify-center gap-2 rounded-[12px] border text-[13px] font-bold",
            mode === "phone" ? "border-[#0B69D4] bg-[#0B69D4] text-white" : "border-[#2A3B52] bg-[#111820] text-[#BECBDD]"
          )}
        >
          <Phone size={15} />
          Telefon ile
        </button>
      </div>

      <form action={formAction} className="mt-4 flex flex-col gap-2">
        {mode === "tc" ? (
          <label className={fieldClass}>
            <CreditCard size={18} className="shrink-0 text-[#BECBDD]" />
            <input
              key="tc"
              name="identifier"
              inputMode="numeric"
              maxLength={11}
              required
              pattern="\d{11}"
              placeholder="T.C. Kimlik Numarası (11 hane)"
              className={inputClass}
            />
          </label>
        ) : (
          <label className={fieldClass}>
            <span className="shrink-0 text-[14px] font-semibold text-[#BECBDD]">+90</span>
            <input
              key="phone"
              name="identifier"
              inputMode="numeric"
              maxLength={10}
              required
              pattern="5\d{9}"
              placeholder="Telefon (10 hane)"
              className={inputClass}
            />
          </label>
        )}
        <label className={fieldClass}>
          <Lock size={18} className="shrink-0 text-[#BECBDD]" />
          <input name="password" type="password" required minLength={8} placeholder="Şifre" className={inputClass} />
        </label>
        {state.error && <p className="text-[13px] text-[#FF6385]">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="mt-4 flex h-12 w-full items-center justify-center rounded-3xl bg-[#0B69D4] text-[16px] font-bold text-white disabled:opacity-60"
        >
          Giriş Yap →
        </button>
        <Link
          href="/"
          className="flex h-12 w-full items-center justify-center gap-1 rounded-3xl border border-[#2A3B52] bg-[#111820] text-[14px] font-semibold text-white"
        >
          <ChevronLeft size={16} />
          Geri Dön
        </Link>
      </form>

      <p className="mt-4 text-center text-[11px] leading-3.5 text-[#BECBDD]">
        Devam ederek{" "}
        <button type="button" onClick={() => setModal("terms")} className="underline">
          Kullanım Şartları
        </button>{" "}
        ve{" "}
        <button type="button" onClick={() => setModal("privacy")} className="underline">
          Gizlilik Politikası
        </button>
        &apos;nı kabul etmiş olursunuz.
      </p>

      <LegalModal open={modal} onClose={() => setModal(null)} />
    </div>
  );
}
