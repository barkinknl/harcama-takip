"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "./transactions";

const today = new Date();
const Y = today.getFullYear();
const M = today.getMonth() + 1;
const monthKey = `${Y}-${String(M).padStart(2, "0")}`;
const day = (n: number) =>
  `${Y}-${String(M).padStart(2, "0")}-${String(n).padStart(2, "0")}`;

export async function seedDemoData(): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Oturum bulunamadı." };

  const { data: cats } = await supabase
    .from("categories")
    .select("id, name, type")
    .eq("user_id", user.id);

  if (!cats || cats.length === 0) {
    return {
      ok: false,
      error: "Default kategoriler bulunamadı. Lütfen sayfayı yenileyin.",
    };
  }

  const findCat = (name: string) => cats.find((c) => c.name === name);

  const market = findCat("Market");
  const kira = findCat("Kira");
  const bills = findCat("Faturalar");
  const transport = findCat("Ulaşım");
  const food = findCat("Yemek");
  const entertainment = findCat("Eğlence");

  type TxRow = {
    user_id: string;
    type: "expense" | "income";
    amount: number;
    category_id: string;
    date: string;
    description: string;
    is_recurring: boolean;
    recurring_day: number | null;
  };
  const transactions: TxRow[] = [];
  const tx = (
    p: Omit<TxRow, "is_recurring" | "recurring_day"> &
      Partial<Pick<TxRow, "is_recurring" | "recurring_day">>
  ): TxRow => ({
    user_id: p.user_id,
    type: p.type,
    amount: p.amount,
    category_id: p.category_id,
    date: p.date,
    description: p.description,
    is_recurring: p.is_recurring ?? false,
    recurring_day: p.recurring_day ?? null,
  });

  if (kira) {
    transactions.push(
      tx({
        user_id: user.id,
        type: "expense",
        amount: 18500,
        category_id: kira.id,
        date: day(1),
        description: "Aylık kira",
        is_recurring: true,
        recurring_day: 1,
      })
    );
  }
  if (bills) {
    transactions.push(
      tx({
        user_id: user.id,
        type: "expense",
        amount: 1850,
        category_id: bills.id,
        date: day(3),
        description: "Elektrik faturası",
      }),
      tx({
        user_id: user.id,
        type: "expense",
        amount: 980,
        category_id: bills.id,
        date: day(3),
        description: "İnternet",
        is_recurring: true,
        recurring_day: 3,
      })
    );
  }
  if (market) {
    transactions.push(
      tx({
        user_id: user.id,
        type: "expense",
        amount: 3240,
        category_id: market.id,
        date: day(5),
        description: "Haftalık market",
      }),
      tx({
        user_id: user.id,
        type: "expense",
        amount: 1980,
        category_id: market.id,
        date: day(12),
        description: "Market",
      })
    );
  }
  if (transport) {
    transactions.push(
      tx({
        user_id: user.id,
        type: "expense",
        amount: 720,
        category_id: transport.id,
        date: day(6),
        description: "Akbil",
      })
    );
  }
  if (entertainment) {
    transactions.push(
      tx({
        user_id: user.id,
        type: "expense",
        amount: 450,
        category_id: entertainment.id,
        date: day(7),
        description: "Sinema",
      })
    );
  }
  if (food) {
    transactions.push(
      tx({
        user_id: user.id,
        type: "expense",
        amount: 2800,
        category_id: food.id,
        date: day(8),
        description: "Restoran",
      })
    );
  }

  if (transactions.length > 0) {
    const { error } = await supabase.from("transactions").insert(transactions);
    if (error) return { ok: false, error: error.message };
  }

  const { error: oeError } = await supabase.from("other_earnings").insert([
    {
      user_id: user.id,
      amount: 3500,
      date: day(2),
      description: "Freelance proje",
    },
    {
      user_id: user.id,
      amount: 1200,
      date: day(6),
      description: "İkinci el satış",
    },
  ]);
  if (oeError) return { ok: false, error: oeError.message };

  const { error: msError } = await supabase.from("monthly_settings").upsert(
    {
      user_id: user.id,
      month_key: monthKey,
      income: 65000,
      last_month_debit: 4200,
      next_pay_date: (() => {
        const ny = M === 12 ? Y + 1 : Y;
        const nm = M === 12 ? 1 : M + 1;
        return `${ny}-${String(nm).padStart(2, "0")}-01`;
      })(),
    },
    { onConflict: "user_id,month_key" }
  );
  if (msError) return { ok: false, error: msError.message };

  revalidatePath("/", "layout");
  return { ok: true };
}
