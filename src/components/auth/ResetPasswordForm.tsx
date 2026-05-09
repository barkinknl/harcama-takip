"use client";

import { useActionState } from "react";
import { Lock, Save } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { updatePassword, type AuthFormState } from "@/app/(auth)/actions";
import styles from "./AuthForm.module.css";

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState<
    AuthFormState | undefined,
    FormData
  >(updatePassword, undefined);

  return (
    <div className={styles.card}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Yeni Şifre Belirle</h1>
        <p className={styles.subtitle}>
          Yeni şifren en az 8 karakter olmalı. Belirleyince otomatik giriş yapılır.
        </p>
      </div>

      <form action={action} className={styles.form} noValidate>
        {state?.error && (
          <div className={`${styles.banner} ${styles.bannerError}`}>
            {state.error}
          </div>
        )}

        <Input
          label="Yeni Şifre"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          leftIcon={<Lock size={16} />}
          error={state?.fieldErrors?.password?.[0]}
          required
        />

        <Button
          type="submit"
          loading={pending}
          fullWidth
          leftIcon={!pending && <Save size={16} />}
          className={styles.submit}
        >
          Şifreyi Güncelle
        </Button>
      </form>
    </div>
  );
}
