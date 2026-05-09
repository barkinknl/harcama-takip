"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export interface AuthFormState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  message?: string;
}

const SignUpSchema = z.object({
  full_name: z
    .string()
    .min(2, "Ad en az 2 karakter olmalı")
    .max(80)
    .trim(),
  email: z.email("Geçerli bir e-posta girin").trim().toLowerCase(),
  password: z
    .string()
    .min(8, "Şifre en az 8 karakter olmalı")
    .max(72, "Şifre en fazla 72 karakter olabilir"),
});

const SignInSchema = z.object({
  email: z.email("Geçerli bir e-posta girin").trim().toLowerCase(),
  password: z.string().min(1, "Şifre gerekli"),
});

const EmailSchema = z.object({
  email: z.email("Geçerli bir e-posta girin").trim().toLowerCase(),
});

const PasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Şifre en az 8 karakter olmalı")
    .max(72),
});

async function getOriginUrl() {
  const h = await headers();
  const origin = h.get("origin") ?? h.get("x-forwarded-host") ?? "";
  if (origin.startsWith("http")) return origin;
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${origin || "localhost:3000"}`;
}

export async function signUp(
  _prev: AuthFormState | undefined,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = SignUpSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const supabase = await createClient();
  const origin = await getOriginUrl();

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.full_name },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: friendlyAuthError(error.message) };
  }

  // Email confirmation kapalıysa session anında oluşur → direkt dashboard
  if (data.session) {
    redirect("/");
  }

  return {
    message:
      "Hesabınız oluşturuldu. Doğrulama bağlantısı için e-postanızı kontrol edin.",
  };
}

export async function signIn(
  _prev: AuthFormState | undefined,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = SignInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: friendlyAuthError(error.message) };
  }

  const next = (formData.get("next") as string) || "/";
  redirect(next);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}

export async function requestPasswordReset(
  _prev: AuthFormState | undefined,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = EmailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const supabase = await createClient();
  const origin = await getOriginUrl();

  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    { redirectTo: `${origin}/reset-password` }
  );

  if (error) return { error: friendlyAuthError(error.message) };

  return {
    message:
      "Şifre sıfırlama bağlantısı e-postanıza gönderildi (kayıtlı bir hesapsa).",
  };
}

export async function updatePassword(
  _prev: AuthFormState | undefined,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = PasswordSchema.safeParse({ password: formData.get("password") });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) return { error: friendlyAuthError(error.message) };

  redirect("/?password_updated=1");
}

function friendlyAuthError(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes("invalid login credentials"))
    return "E-posta veya şifre hatalı.";
  if (lower.includes("email not confirmed"))
    return "E-posta adresinizi doğrulamanız gerekiyor.";
  if (lower.includes("user already registered"))
    return "Bu e-posta ile kayıtlı bir hesap zaten var.";
  if (lower.includes("rate limit"))
    return "Çok fazla deneme. Lütfen birkaç dakika sonra tekrar deneyin.";
  if (lower.includes("password should be"))
    return "Şifre yeterince güçlü değil.";
  return raw;
}
