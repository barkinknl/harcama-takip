"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "./transactions";

const ProfileSchema = z.object({
  full_name: z.string().min(2).max(80).trim(),
  currency: z.enum(["TRY", "USD", "EUR", "GBP"]),
});

export async function updateProfile(
  formData: FormData
): Promise<ActionResult> {
  const parsed = ProfileSchema.safeParse({
    full_name: formData.get("full_name"),
    currency: formData.get("currency"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Oturum bulunamadı." };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.full_name,
      currency: parsed.data.currency,
    })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

/**
 * Tüm verilerini JSON olarak döner.
 */
export async function exportData(): Promise<ActionResult<string>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Oturum bulunamadı." };

  const [profile, categories, transactions, otherEarnings, monthlySettings] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("categories").select("*").eq("user_id", user.id),
      supabase.from("transactions").select("*").eq("user_id", user.id),
      supabase.from("other_earnings").select("*").eq("user_id", user.id),
      supabase.from("monthly_settings").select("*").eq("user_id", user.id),
    ]);

  const payload = {
    exported_at: new Date().toISOString(),
    profile: profile.data,
    categories: categories.data ?? [],
    transactions: transactions.data ?? [],
    other_earnings: otherEarnings.data ?? [],
    monthly_settings: monthlySettings.data ?? [],
  };

  return { ok: true, data: JSON.stringify(payload, null, 2) };
}

/**
 * Hesabı ve tüm verileri siler.
 * NOT: Supabase'in admin API'si gerekir; bu yüzden bu eylem
 * normal client ile sadece veri siler ve oturumu kapatır.
 * Admin silme için Supabase Edge Function gerekir (sonradan eklenebilir).
 */
export async function deleteAccountData(): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Oturum bulunamadı." };

  // Cascade ile categories/transactions/other_earnings/monthly_settings/profile silinir
  // ama auth.users kaydı normal client ile silinemez. Bu yüzden:
  // 1. Tüm uygulama verisini sil
  // 2. Çıkış yap
  // 3. Kullanıcıya destek üzerinden hesap silme isteyebileceğini bildir
  await supabase.from("transactions").delete().eq("user_id", user.id);
  await supabase.from("other_earnings").delete().eq("user_id", user.id);
  await supabase.from("monthly_settings").delete().eq("user_id", user.id);
  await supabase.from("categories").delete().eq("user_id", user.id);
  await supabase.from("profiles").delete().eq("id", user.id);
  await supabase.auth.signOut();
  redirect("/sign-in?deleted=1");
}
