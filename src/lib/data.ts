import { createClient } from "@/lib/supabase/server";
import type {
  Category,
  MonthlySettings,
  OtherEarning,
  Transaction,
  TransactionWithCategory,
  UserProfile,
} from "@/types";

export interface MonthData {
  profile: UserProfile | null;
  categories: Category[];
  transactions: TransactionWithCategory[];
  otherEarnings: OtherEarning[];
  monthlySettings: MonthlySettings | null;
  isEmpty: boolean;
}

/**
 * Belirli bir ay için tüm dashboard verisini server-side çeker.
 */
export async function getMonthData(monthKey: string): Promise<MonthData> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      profile: null,
      categories: [],
      transactions: [],
      otherEarnings: [],
      monthlySettings: null,
      isEmpty: true,
    };
  }

  const [
    { data: profile },
    { data: categories },
    { data: transactionRows },
    { data: otherEarnings },
    { data: settings },
    { count: totalCount },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase
      .from("categories")
      .select("*")
      .eq("user_id", user.id)
      .order("type", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .eq("month_key", monthKey)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("other_earnings")
      .select("*")
      .eq("user_id", user.id)
      .eq("month_key", monthKey)
      .order("date", { ascending: false }),
    supabase
      .from("monthly_settings")
      .select("*")
      .eq("user_id", user.id)
      .eq("month_key", monthKey)
      .maybeSingle(),
    supabase
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  const cats = (categories ?? []) as Category[];
  const catMap = new Map(cats.map((c) => [c.id, c]));

  const transactions: TransactionWithCategory[] = (
    (transactionRows as Transaction[]) ?? []
  ).map((t) => ({
    ...t,
    category: t.category_id ? catMap.get(t.category_id) ?? null : null,
  }));

  return {
    profile: (profile as UserProfile) ?? null,
    categories: cats,
    transactions,
    otherEarnings: (otherEarnings as OtherEarning[]) ?? [],
    monthlySettings: (settings as MonthlySettings) ?? null,
    isEmpty: !totalCount || totalCount === 0,
  };
}

/**
 * Hızlı ekle şablonları için son 60 günde en çok kullanılan
 * (kategori + tutar + açıklama) kombinasyonlarını çıkarır.
 */
export async function getQuickAddTemplates(limit = 4) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const sinceIso = new Date(
    Date.now() - 60 * 24 * 60 * 60 * 1000
  )
    .toISOString()
    .slice(0, 10);

  const { data } = await supabase
    .from("transactions")
    .select("amount, type, category_id, description")
    .eq("user_id", user.id)
    .gte("date", sinceIso)
    .order("date", { ascending: false })
    .limit(200);

  if (!data) return [];

  const tally = new Map<
    string,
    {
      key: string;
      type: "income" | "expense";
      category_id: string;
      amount: number;
      description: string | null;
      count: number;
    }
  >();

  for (const row of data) {
    if (!row.category_id) continue;
    const k = `${row.type}|${row.category_id}|${row.amount}|${row.description ?? ""}`;
    const existing = tally.get(k);
    if (existing) {
      existing.count += 1;
    } else {
      tally.set(k, {
        key: k,
        type: row.type as "income" | "expense",
        category_id: row.category_id,
        amount: Number(row.amount),
        description: row.description,
        count: 1,
      });
    }
  }

  return Array.from(tally.values())
    .filter((t) => t.count >= 2)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Yaklaşan tekrarlayan ödemeler (önümüzdeki 7 gün).
 */
export async function getUpcomingRecurring() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("transactions")
    .select("id, amount, description, recurring_day, type, category_id")
    .eq("user_id", user.id)
    .eq("is_recurring", true)
    .order("recurring_day", { ascending: true });

  if (!data) return [];

  const today = new Date();
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() + 7);

  type Upcoming = {
    id: string;
    description: string | null;
    amount: number;
    type: "income" | "expense";
    category_id: string | null;
    days_until: number;
    next_date: string;
  };

  const upcoming: Upcoming[] = [];
  for (const row of data) {
    if (!row.recurring_day) continue;
    const candidate = new Date(
      today.getFullYear(),
      today.getMonth(),
      row.recurring_day
    );
    if (candidate < today) {
      candidate.setMonth(candidate.getMonth() + 1);
    }
    const days =
      Math.floor((candidate.getTime() - today.getTime()) / 86400000);
    if (days >= 0 && days <= 7) {
      upcoming.push({
        id: row.id,
        description: row.description,
        amount: Number(row.amount),
        type: row.type as "income" | "expense",
        category_id: row.category_id,
        days_until: days,
        next_date: candidate.toISOString().slice(0, 10),
      });
    }
  }

  return upcoming.sort((a, b) => a.days_until - b.days_until);
}

/**
 * Bir önceki ayın özeti — basit içgörüler için.
 */
export async function getPreviousMonthAggregate(currentMonthKey: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [y, m] = currentMonthKey.split("-").map(Number);
  const prevDate = new Date(y, m - 2, 1);
  const prevKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;

  const { data } = await supabase
    .from("transactions")
    .select("amount, type, category_id")
    .eq("user_id", user.id)
    .eq("month_key", prevKey);

  if (!data) return null;

  const byCategory = new Map<string, number>();
  let totalExpense = 0;
  let totalIncome = 0;
  for (const row of data) {
    const amount = Number(row.amount);
    if (row.type === "expense") {
      totalExpense += amount;
      if (row.category_id) {
        byCategory.set(
          row.category_id,
          (byCategory.get(row.category_id) ?? 0) + amount
        );
      }
    } else if (row.type === "income") {
      totalIncome += amount;
    }
  }

  return { byCategory, totalExpense, totalIncome, monthKey: prevKey };
}
