"use client";

import { useActionState, useEffect, useState } from "react";
import { Lock, Mail } from "lucide-react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { changeEmailAction, changePasswordAction, type AccountActionState } from "@/lib/auth/account-actions";
import { SettingsRow } from "./SettingsRow";

const INPUT =
  "h-11 w-full rounded-xl border border-border bg-surface-2 px-3.5 text-[14px] text-foreground outline-none focus:border-brand";
const SUBMIT =
  "h-12 w-full rounded-xl bg-brand text-[14px] font-bold text-brand-foreground transition-opacity hover:opacity-90 disabled:opacity-50";

/** Password and email rows that open drawers. Both drawers need the current password. */
export function AccountChangeRows() {
  const [pwOpen, setPwOpen] = useState(false);
  const [mailOpen, setMailOpen] = useState(false);

  return (
    <>
      <SettingsRow icon={Lock} title="Şifre Değiştir" subtitle="Hesap şifrenizi güncelleyin" onClick={() => setPwOpen(true)} />
      <SettingsRow icon={Mail} title="E-posta Değiştir" onClick={() => setMailOpen(true)} />

      <BottomSheet open={pwOpen} onClose={() => setPwOpen(false)} title="Şifre Değiştir">
        <AccountForm
          action={changePasswordAction}
          submitLabel="Şifreyi güncelle"
          successLabel="Şifreniz güncellendi."
          onDone={() => setPwOpen(false)}
          fields={[
            { name: "currentPassword", label: "Mevcut şifre", type: "password", autoComplete: "current-password" },
            { name: "newPassword", label: "Yeni şifre", type: "password", autoComplete: "new-password" },
            { name: "confirmPassword", label: "Yeni şifre (tekrar)", type: "password", autoComplete: "new-password" },
          ]}
        />
      </BottomSheet>

      <BottomSheet open={mailOpen} onClose={() => setMailOpen(false)} title="E-posta Değiştir">
        <AccountForm
          action={changeEmailAction}
          submitLabel="E-postayı güncelle"
          successLabel="E-posta adresiniz güncellendi."
          onDone={() => setMailOpen(false)}
          fields={[
            { name: "email", label: "Yeni e-posta", type: "email", autoComplete: "email" },
            { name: "currentPassword", label: "Mevcut şifre", type: "password", autoComplete: "current-password" },
          ]}
        />
      </BottomSheet>
    </>
  );
}

interface FieldDef {
  name: string;
  label: string;
  type: string;
  autoComplete: string;
}

function AccountForm({
  action,
  fields,
  submitLabel,
  successLabel,
  onDone,
}: {
  action: (prev: AccountActionState, formData: FormData) => Promise<AccountActionState>;
  fields: FieldDef[];
  submitLabel: string;
  successLabel: string;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  // Close after a successful change; the parent unmounts the form on close, so the next open starts clean.
  useEffect(() => {
    if (state.ok) onDone();
  }, [state.ok, onDone]);

  return (
    <form action={formAction} className="flex flex-col gap-3 pb-2">
      {fields.map((f) => (
        <label key={f.name} className="flex flex-col gap-1.5">
          <span className="text-[12px] font-bold text-muted">{f.label}</span>
          <input name={f.name} type={f.type} autoComplete={f.autoComplete} required className={INPUT} />
        </label>
      ))}
      {state.error && <p className="text-[13px] font-semibold text-negative">{state.error}</p>}
      {state.ok && <p className="text-[13px] font-semibold text-positive">{successLabel}</p>}
      <button type="submit" disabled={pending} className={SUBMIT}>
        {pending ? "Kaydediliyor..." : submitLabel}
      </button>
    </form>
  );
}
