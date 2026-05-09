"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Mail, Lock, LogIn } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { signIn, type AuthFormState } from "@/app/(auth)/actions";
import styles from "./AuthForm.module.css";

export function SignInForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<
    AuthFormState | undefined,
    FormData
  >(signIn, undefined);

  return (
    <div className={styles.card}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Hoş geldin</h1>
        <p className={styles.subtitle}>
          E-posta ve şifrenle giriş yap. Hesabın yoksa hemen oluşturabilirsin.
        </p>
      </div>

      <form action={action} className={styles.form} noValidate>
        {next && <input type="hidden" name="next" value={next} />}

        {state?.error && (
          <div className={`${styles.banner} ${styles.bannerError}`}>
            {state.error}
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

        <Input
          label="Şifre"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          leftIcon={<Lock size={16} />}
          error={state?.fieldErrors?.password?.[0]}
          required
        />

        <div className={styles.helper}>
          <span />
          <Link href="/forgot-password" className={styles.helperLink}>
            Şifremi unuttum
          </Link>
        </div>

        <Button
          type="submit"
          loading={pending}
          fullWidth
          leftIcon={!pending && <LogIn size={16} />}
          className={styles.submit}
        >
          Giriş Yap
        </Button>
      </form>

      <p className={styles.footer}>
        Hesabın yok mu?{" "}
        <Link href={next ? `/sign-up?next=${encodeURIComponent(next)}` : "/sign-up"}>
          Kayıt ol
        </Link>
      </p>
    </div>
  );
}
