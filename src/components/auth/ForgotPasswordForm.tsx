"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Mail, KeyRound } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  requestPasswordReset,
  type AuthFormState,
} from "@/app/(auth)/actions";
import styles from "./AuthForm.module.css";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState<
    AuthFormState | undefined,
    FormData
  >(requestPasswordReset, undefined);

  return (
    <div className={styles.card}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Şifremi Unuttum</h1>
        <p className={styles.subtitle}>
          Sana sıfırlama bağlantısı içeren bir e-posta gönderelim.
        </p>
      </div>

      <form action={action} className={styles.form} noValidate>
        {state?.error && (
          <div className={`${styles.banner} ${styles.bannerError}`}>
            {state.error}
          </div>
        )}
        {state?.message && (
          <div className={`${styles.banner} ${styles.bannerSuccess}`}>
            {state.message}
          </div>
        )}

        <Input
          label="E-posta"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="ornek@mail.com"
          leftIcon={<Mail size={16} />}
          error={state?.fieldErrors?.email?.[0]}
          required
        />

        <Button
          type="submit"
          loading={pending}
          fullWidth
          leftIcon={!pending && <KeyRound size={16} />}
          className={styles.submit}
        >
          Bağlantı Gönder
        </Button>
      </form>

      <p className={styles.footer}>
        <Link href="/sign-in">← Giriş ekranına dön</Link>
      </p>
    </div>
  );
}
