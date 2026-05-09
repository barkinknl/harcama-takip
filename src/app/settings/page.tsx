import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsView } from "@/components/settings/SettingsView";
import type { UserProfile } from "@/types";

export const metadata: Metadata = { title: "Ayarlar" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <SettingsView
      profile={(profile as UserProfile) ?? null}
      email={profile?.email ?? user.email ?? ""}
    />
  );
}
