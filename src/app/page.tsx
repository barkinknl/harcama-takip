import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import {
  getMonthData,
  getPreviousMonthAggregate,
  getQuickAddTemplates,
  getUpcomingRecurring,
} from "@/lib/data";
import { toMonthKey } from "@/lib/format";
import { computeMonthlySummary } from "@/lib/computeSummary";
import { computeInsights } from "@/lib/insights";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; view?: string }>;
}) {
  const params = await searchParams;
  const monthKey = params.month ?? toMonthKey();
  const isPlanning = params.view === "planning";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const [monthData, quickAddTemplates, upcoming, prevAgg] = await Promise.all([
    getMonthData(monthKey),
    getQuickAddTemplates(),
    getUpcomingRecurring(),
    getPreviousMonthAggregate(monthKey),
  ]);

  const monthlySettingsValues = {
    income: Number(monthData.monthlySettings?.income ?? 0),
    last_month_debit: Number(monthData.monthlySettings?.last_month_debit ?? 0),
    next_pay_date: monthData.monthlySettings?.next_pay_date ?? null,
  };

  const summary = computeMonthlySummary({
    income: monthlySettingsValues.income,
    last_month_debit: monthlySettingsValues.last_month_debit,
    next_pay_date: monthlySettingsValues.next_pay_date,
    transactions: monthData.transactions,
    other_earnings: monthData.otherEarnings,
  });

  const insights = computeInsights({
    current: summary,
    currentTransactions: monthData.transactions,
    previousAggregate: prevAgg,
    categories: monthData.categories,
  });

  return (
    <DashboardShell
      monthKey={monthKey}
      isPlanning={isPlanning}
      categories={monthData.categories}
      transactions={monthData.transactions}
      otherEarnings={monthData.otherEarnings}
      monthlySettings={monthlySettingsValues}
      currency={monthData.profile?.currency ?? "TRY"}
      userName={monthData.profile?.full_name ?? undefined}
      userEmail={monthData.profile?.email ?? user.email ?? undefined}
      isEmpty={monthData.isEmpty}
      quickAddTemplates={quickAddTemplates}
      upcoming={upcoming}
      insights={insights}
    />
  );
}
