"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export interface ActionResult<T = unknown> {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  data?: T;
}

const TransactionSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.enum(["income", "expense"]),
  amount: z.coerce.number().positive("Tutar 0'dan büyük olmalı"),
  category_id: z.string().uuid("Kategori seçin"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Geçerli bir tarih girin"),
  description: z.string().max(200).optional().nullable(),
  is_recurring: z.coerce.boolean().optional(),
  recurring_day: z.coerce.number().int().min(1).max(31).optional().nullable(),
});

export async function upsertTransaction(
  formData: FormData
): Promise<ActionResult> {
  const parsed = TransactionSchema.safeParse({
    id: (formData.get("id") as string) || undefined,
    type: formData.get("type"),
    amount: formData.get("amount"),
    category_id: formData.get("category_id"),
    date: formData.get("date"),
    description: formData.get("description") || null,
    is_recurring: formData.get("is_recurring") === "on" ||
      formData.get("is_recurring") === "true",
    recurring_day: formData.get("recurring_day")
      ? Number(formData.get("recurring_day"))
      : null,
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

  const recurringDay = parsed.data.is_recurring
    ? parsed.data.recurring_day ??
      Number(parsed.data.date.slice(8, 10))
    : null;

  const payload = {
    user_id: user.id,
    type: parsed.data.type,
    amount: parsed.data.amount,
    category_id: parsed.data.category_id,
    date: parsed.data.date,
    description: parsed.data.description ?? null,
    is_recurring: parsed.data.is_recurring ?? false,
    recurring_day: recurringDay,
  };

  if (parsed.data.id) {
    const { error } = await supabase
      .from("transactions")
      .update(payload)
      .eq("id", parsed.data.id)
      .eq("user_id", user.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase.from("transactions").insert(payload);
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteTransaction(id: string): Promise<ActionResult> {
  if (!id) return { ok: false, error: "Eksik kimlik." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Oturum bulunamadı." };

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}
