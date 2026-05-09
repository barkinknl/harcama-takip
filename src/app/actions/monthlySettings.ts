"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "./transactions";

const MonthlySettingsSchema = z.object({
  month_key: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "Geçerli bir ay girin (YYYY-MM)"),
  income: z.coerce.number().min(0, "Gelir negatif olamaz"),
  last_month_debit: z.coerce.number().min(0),
  next_pay_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Geçerli bir tarih girin")
    .optional()
    .nullable(),
});

export async function upsertMonthlySettings(
  formData: FormData
): Promise<ActionResult> {
  const parsed = MonthlySettingsSchema.safeParse({
    month_key: formData.get("month_key"),
    income: formData.get("income"),
    last_month_debit: formData.get("last_month_debit"),
    next_pay_date: formData.get("next_pay_date") || null,
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

  const payload = {
    user_id: user.id,
    month_key: parsed.data.month_key,
    income: parsed.data.income,
    last_month_debit: parsed.data.last_month_debit,
    next_pay_date: parsed.data.next_pay_date ?? null,
  };

  const { error } = await supabase
    .from("monthly_settings")
    .upsert(payload, { onConflict: "user_id,month_key" });

  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}
