"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "./transactions";

const CategorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "İsim gerekli").max(40).trim(),
  type: z.enum(["income", "expense"]),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Geçerli bir renk girin (#rrggbb)"),
  icon: z.string().min(1).max(40).default("tag"),
});

export async function upsertCategory(
  formData: FormData
): Promise<ActionResult> {
  const parsed = CategorySchema.safeParse({
    id: (formData.get("id") as string) || undefined,
    name: formData.get("name"),
    type: formData.get("type"),
    color: formData.get("color"),
    icon: (formData.get("icon") as string) || "tag",
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
    name: parsed.data.name,
    type: parsed.data.type,
    color: parsed.data.color,
    icon: parsed.data.icon,
  };

  if (parsed.data.id) {
    const { error } = await supabase
      .from("categories")
      .update(payload)
      .eq("id", parsed.data.id)
      .eq("user_id", user.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase.from("categories").insert(payload);
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  if (!id) return { ok: false, error: "Eksik kimlik." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Oturum bulunamadı." };

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}
