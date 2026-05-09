import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TransactionsView } from "@/components/transactions/TransactionsView";
import type {
  Category,
  Transaction,
  TransactionWithCategory,
  UserProfile,
} from "@/types";

export const metadata: Metadata = { title: "İşlemler" };

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    month?: string;
    type?: "income" | "expense";
    category?: string;
    q?: string;
  }>;
}) {
  const params = await searchParams;
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

  let query = supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(500);

  if (params.month) query = query.eq("month_key", params.month);
  if (params.type) query = query.eq("type", params.type);
  if (params.category) query = query.eq("category_id", params.category);
  if (params.q) query = query.ilike("description", `%${params.q}%`);

  const { data: rows } = await query;

  const cats = (catsRes.data ?? []) as Category[];
  const catMap = new Map(cats.map((c) => [c.id, c]));
  const transactions: TransactionWithCategory[] = (
    (rows as Transaction[]) ?? []
  ).map((t) => ({
    ...t,
    category: t.category_id ? catMap.get(t.category_id) ?? null : null,
  }));

  const profile = (profileRes.data as UserProfile) ?? null;

  return (
    <TransactionsView
      transactions={transactions}
      categories={cats}
      currency={profile?.currency ?? "TRY"}
      userName={profile?.full_name ?? undefined}
      userEmail={profile?.email ?? user.email ?? undefined}
      filters={{
        month: params.month,
        type: params.type,
        category: params.category,
        q: params.q,
      }}
    />
  );
}
