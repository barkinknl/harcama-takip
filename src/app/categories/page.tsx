import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CategoriesView } from "@/components/categories/CategoriesView";
import type { Category, UserProfile } from "@/types";

export const metadata: Metadata = { title: "Kategoriler" };

export default async function CategoriesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const [profileRes, catsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase
      .from("categories")
      .select("*")
      .eq("user_id", user.id)
      .order("type")
      .order("sort_order")
      .order("name"),
  ]);

  const profile = (profileRes.data as UserProfile) ?? null;
  const categories = (catsRes.data as Category[]) ?? [];

  return (
    <CategoriesView
      categories={categories}
      userName={profile?.full_name ?? undefined}
      userEmail={profile?.email ?? user.email ?? undefined}
    />
  );
}
