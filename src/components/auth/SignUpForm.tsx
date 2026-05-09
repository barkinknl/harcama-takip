"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Mail, Lock, User, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { signUp, type AuthFormState } from "@/app/(auth)/actions";
import styles from "./AuthForm.module.css";

export function SignUpForm() {
  const [state, action, pending] = useActionState<
    AuthFormState | undefined,
    FormData
  >(signUp, undefined);

  return (
    <div className={styles.card}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Hesap Oluştur</h1>
        <p className={styles.subtitle}>
          Birkaç saniyede başla. Veriler senin, istediğin zaman dışa aktarabilirsin.
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
          label="Ad Soyad"
          name="full_name"
          type="text"
          autoComplete="name"
          placeholder="Adın Soyadın"
          leftIcon={<User size={16} />}
          error={state?.fieldErrors?.full_name?.[0]}
          required
        />

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

        <Input
          label="Şifre"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="En az 8 karakter"
          leftIcon={<Lock size={16} />}
          hint="En az 8 karakter olmalı"
          error={state?.fieldErrors?.password?.[0]}
          required
        />

        <Button
          type="submit"
          loading={pending}
          fullWidth
          leftIcon={!pending && <UserPlus size={16} />}
          className={styles.submit}
        >
          Hesap Oluştur
        </Button>
      </form>

      <p className={styles.footer}>
        Zaten hesabın var mı? <Link href="/sign-in">Giriş yap</Link>
      </p>
    </div>
  );
}
