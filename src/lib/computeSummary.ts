import type {
  CategorySummary,
  MonthlySummaryData,
  OtherEarning,
  TransactionWithCategory,
} from "@/types";
import { daysBetween } from "./format";

interface ComputeInput {
  income: number;
  last_month_debit: number;
  next_pay_date: string | null;
  transactions: TransactionWithCategory[];
  other_earnings: OtherEarning[];
}

export function computeMonthlySummary({
  income,
  last_month_debit,
  next_pay_date,
  transactions,
  other_earnings,
}: ComputeInput): MonthlySummaryData {
  const total_expenditure = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const transactionIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const otherEarningsTotal = other_earnings.reduce(
    (sum, e) => sum + e.amount,
    0
  );

  const this_month_balance = income - last_month_debit;
  const total_earnings = income + transactionIncome + otherEarningsTotal;
  const left_to_spend = this_month_balance + otherEarningsTotal + transactionIncome - total_expenditure;
  const final_balance = total_earnings - total_expenditure;

  let days_left_for_next_pay: number | null = null;
  if (next_pay_date) {
    const today = new Date().toISOString().slice(0, 10);
    const diff = daysBetween(today, next_pay_date);
    days_left_for_next_pay = Math.max(0, diff);
  }

  return {
    income,
    last_month_debit,
    this_month_balance,
    left_to_spend,
    next_pay_date,
    days_left_for_next_pay,
    total_expenditure,
    total_earnings,
    final_balance,
  };
}

export function computeCategorySummary(
  transactions: TransactionWithCategory[]
): CategorySummary[] {
  const expenses = transactions.filter((t) => t.type === "expense");
  const total = expenses.reduce((sum, t) => sum + t.amount, 0);
  if (total === 0) return [];

  const map = new Map<
    string,
    {
      category_id: string;
      category_name: string;
      category_color: string;
      category_icon: string;
      total: number;
      count: number;
    }
  >();

  for (const tx of expenses) {
    const id = tx.category_id || "uncategorized";
    const existing = map.get(id);
    if (existing) {
      existing.total += tx.amount;
      existing.count += 1;
    } else {
      map.set(id, {
        category_id: id,
        category_name: tx.category?.name ?? "Diğer",
        category_color: tx.category?.color ?? "#94a3b8",
        category_icon: tx.category?.icon ?? "tag",
        total: tx.amount,
        count: 1,
      });
    }
  }

  return Array.from(map.values())
    .map((item) => ({
      ...item,
      percentage: (item.total / total) * 100,
    }))
    .sort((a, b) => b.total - a.total);
}
