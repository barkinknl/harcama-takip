"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "./transactions";

const OtherEarningSchema = z.object({
  id: z.string().uuid().optional(),
  amount: z.coerce.number().positive("Tutar 0'dan büyük olmalı"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Geçerli bir tarih girin"),
  description: z.string().max(200).optional().nullable(),
});

export async function upsertOtherEarning(
  formData: FormData
): Promise<ActionResult> {
  const parsed = OtherEarningSchema.safeParse({
    id: (formData.get("id") as string) || undefined,
    amount: formData.get("amount"),
    date: formData.get("date"),
    description: formData.get("description") || null,
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
    amount: parsed.data.amount,
    date: parsed.data.date,
    description: parsed.data.description ?? null,
  };

  if (parsed.data.id) {
    const { error } = await supabase
      .from("other_earnings")
      .update(payload)
      .eq("id", parsed.data.id)
      .eq("user_id", user.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase.from("other_earnings").insert(payload);
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteOtherEarning(id: string): Promise<ActionResult> {
  if (!id) return { ok: false, error: "Eksik kimlik." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Oturum bulunamadı." };

  const { error } = await supabase
    .from("other_earnings")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}
