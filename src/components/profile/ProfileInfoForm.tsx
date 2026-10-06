"use client";

import { useActionState } from "react";
import { updateProfileAction, type ProfileActionState } from "@/lib/profile/actions";

export interface ProfileFormValues {
  name: string;
  gender: string;
  birthDate: string;
  city: string;
  country: string;
}

const INPUT =
  "h-11 w-full rounded-xl border border-border bg-surface-2 px-3.5 text-[14px] text-foreground outline-none focus:border-brand disabled:opacity-60";

/** Editable personal details. Phone and email are read-only here (phone is the login; email has its own drawer in settings). */
export function ProfileInfoForm({ initial, phone, email }: { initial: ProfileFormValues; phone: string | null; email: string | null }) {
  const [state, formAction, pending] = useActionState<ProfileActionState, FormData>(updateProfileAction, {});
  return (
    <form action={formAction} className="flex flex-col gap-3">
      <Field label="Ad Soyad">
        <input name="name" defaultValue={initial.name} required minLength={2} maxLength={80} className={INPUT} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Cinsiyet">
          <select name="gender" defaultValue={initial.gender} className={INPUT}>
            <option value="">Seçiniz</option>
            <option value="Kadın">Kadın</option>
            <option value="Erkek">Erkek</option>
          </select>
        </Field>
        <Field label="Doğum Tarihi">
          <input name="birthDate" type="date" defaultValue={initial.birthDate} max="2008-12-31" className={INPUT} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Şehir">
          <input name="city" defaultValue={initial.city} maxLength={60} className={INPUT} />
        </Field>
        <Field label="Ülke">
          <input name="country" defaultValue={initial.country} maxLength={60} className={INPUT} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Telefon">
          <input value={phone ?? "-"} disabled readOnly className={INPUT} />
        </Field>
        <Field label="E-posta">
          <input value={email ?? "-"} disabled readOnly className={INPUT} />
        </Field>
      </div>

      {state.error && <p className="text-[13px] font-semibold text-negative">{state.error}</p>}
      {state.ok && !pending && <p className="text-[13px] font-semibold text-positive">Bilgileriniz kaydedildi.</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 h-12 w-full rounded-xl bg-brand text-[14px] font-bold text-brand-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Kaydediliyor..." : "Kaydet"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-bold text-muted">{label}</span>
      {children}
    </label>
  );
}
