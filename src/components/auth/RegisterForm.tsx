"use client";

import { useActionState } from "react";
import { Link } from "@/i18n/navigation";
import { registerAction, type ActionResult } from "@/lib/auth/actions";
import { CreditCard, Lock, User, Gift, ChevronLeft } from "lucide-react";

const initialState: ActionResult = {};

const fieldClass =
  "flex h-[52px] w-full items-center gap-3 rounded-[12px] border border-[#2A3B52] bg-[#111820] px-4 text-[14px] text-white outline-none focus-within:border-[#58ABFF]";
const inputClass = "min-w-0 flex-1 bg-transparent outline-none placeholder:text-[#7A8AA0]";

export function RegisterForm({ referralCode = "" }: { referralCode?: string }) {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <div>
      <div className="text-center text-[13px] font-semibold text-[#58ABFF]">Hesabınızı Oluşturun</div>
      <div className="mt-1 text-center text-[13px] text-[#BECBDD]">
        Hesabınız var mı?{" "}
        <Link href="/giris" className="font-bold text-white underline">
          Giriş Yap
        </Link>
      </div>

      <form action={formAction} className="mt-[26px] flex flex-col gap-2">
        <label className={fieldClass}>
          <User size={18} className="shrink-0 text-[#BECBDD]" />
          <input name="name" required minLength={2} placeholder="Ad Soyad" className={inputClass} />
        </label>
        <label className={fieldClass}>
          <CreditCard size={18} className="shrink-0 text-[#BECBDD]" />
          <input
            name="tc"
            inputMode="numeric"
            maxLength={11}
            required
            pattern="\d{11}"
            placeholder="T.C. Kimlik Numarası (11 hane)"
            className={inputClass}
          />
        </label>
        <label className={fieldClass}>
          <span className="shrink-0 text-[14px] font-semibold text-[#BECBDD]">+90</span>
          <input
            name="phone"
            inputMode="numeric"
            maxLength={10}
            required
            pattern="5\d{9}"
            placeholder="Telefon (10 hane)"
            className={inputClass}
          />
        </label>
        <label className={fieldClass}>
          <Lock size={18} className="shrink-0 text-[#BECBDD]" />
          <input name="password" type="password" required minLength={8} placeholder="Şifre" className={inputClass} />
        </label>
        <label className={fieldClass}>
          <Lock size={18} className="shrink-0 text-[#BECBDD]" />
          <input
            name="passwordRepeat"
            type="password"
            required
            minLength={8}
            placeholder="Şifre Tekrar"
            className={inputClass}
          />
        </label>
        <label className={fieldClass}>
          <Gift size={18} className="shrink-0 text-[#BECBDD]" />
          <input name="ref" defaultValue={referralCode} placeholder="Referans Kodu (Opsiyonel)" className={inputClass} />
        </label>
        {state.error && <p className="text-[13px] text-[#FF6385]">{state.error}</p>}

        <label className="mt-2 flex items-start gap-2 text-[12px] font-semibold text-[#BECBDD]">
          <input name="terms" type="checkbox" required className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-[#0B69D4]" />
          <span>
            <span className="underline">Kullanıcı Sözleşmesi</span>&apos;ni okudum ve kabul ediyorum.
          </span>
        </label>
        <label className="flex items-start gap-2 text-[12px] font-semibold text-[#BECBDD]">
          <input name="kvkk" type="checkbox" required className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-[#0B69D4]" />
          <span>
            <span className="underline">KVKK Aydınlatma Metni</span>&apos;ni okudum ve kabul ediyorum.
          </span>
        </label>

        <button
          type="submit"
          disabled={pending}
          className="mt-3 flex h-[48px] w-full items-center justify-center rounded-[24px] bg-[#0B69D4] text-[16px] font-bold text-white disabled:opacity-60"
        >
          Müşteri Ol →
        </button>
        <Link
          href="/"
          className="flex h-[48px] w-full items-center justify-center gap-1 rounded-[24px] border border-[#2A3B52] bg-[#111820] text-[14px] font-semibold text-white"
        >
          <ChevronLeft size={16} />
          Geri Dön
        </Link>
      </form>
    </div>
  );
}
