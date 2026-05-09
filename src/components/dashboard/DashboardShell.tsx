"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MonthTabs } from "@/components/layout/MonthTabs";
import { BottomNav } from "@/components/layout/BottomNav";
import { MonthlySummary } from "./MonthlySummary";
import { NextPayBanner } from "./NextPayBanner";
import { OtherEarnings } from "./OtherEarnings";
import { OtherEarningForm } from "./OtherEarningForm";
import { FinalBalance } from "./FinalBalance";
import { ExpenseChart } from "./ExpenseChart";
import { MonthlySettingsForm } from "./MonthlySettingsForm";
import { QuickAddTemplates, type QuickAddTemplate } from "./QuickAddTemplates";
import { UpcomingRecurring, type UpcomingItem } from "./UpcomingRecurring";
import { Insights, type InsightItem } from "./Insights";
import { TransactionList } from "@/components/transactions/TransactionList";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { EmptyState } from "./EmptyState";
import {
  computeCategorySummary,
  computeMonthlySummary,
} from "@/lib/computeSummary";
import {
  MONTH_NAMES_TR,
  type Category,
  type OtherEarning,
  type TransactionWithCategory,
} from "@/types";
import { parseMonthKey } from "@/lib/format";
import styles from "./DashboardShell.module.css";

export interface DashboardShellProps {
  monthKey: string;
  isPlanning: boolean;
  categories: Category[];
  transactions: TransactionWithCategory[];
  otherEarnings: OtherEarning[];
  monthlySettings: {
    income: number;
    last_month_debit: number;
    next_pay_date: string | null;
  };
  currency?: string;
  userName?: string;
  userEmail?: string;
  isEmpty: boolean;
  quickAddTemplates: QuickAddTemplate[];
  upcoming: UpcomingItem[];
  insights: InsightItem[];
}

export function DashboardShell({
  monthKey,
  isPlanning,
  categories,
  transactions,
  otherEarnings,
  monthlySettings,
  currency = "TRY",
  userName,
  userEmail,
  isEmpty,
  quickAddTemplates,
  upcoming,
  insights,
}: DashboardShellProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [displayYear, setDisplayYear] = useState(parseMonthKey(monthKey).year);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modal state
  const [txFormOpen, setTxFormOpen] = useState(false);
  const [txEditing, setTxEditing] =
    useState<TransactionWithCategory | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [oeFormOpen, setOeFormOpen] = useState(false);
  const [oeEditing, setOeEditing] = useState<OtherEarning | null>(null);
  const [prefillTemplate, setPrefillTemplate] =
    useState<QuickAddTemplate | null>(null);

  const monthlySummary = useMemo(
    () =>
      computeMonthlySummary({
        income: monthlySettings.income,
        last_month_debit: monthlySettings.last_month_debit,
        next_pay_date: monthlySettings.next_pay_date,
        transactions,
        other_earnings: otherEarnings,
      }),
    [monthlySettings, transactions, otherEarnings]
  );

  const categorySummary = useMemo(
    () => computeCategorySummary(transactions),
    [transactions]
  );

  const { year, month } = parseMonthKey(monthKey);
  const monthLabel = isPlanning
    ? "Planlama"
    : `${MONTH_NAMES_TR[month - 1]} ${year}`;

  const navigate = (params: Record<string, string | null>) => {
    const sp = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([k, v]) => {
      if (v === null) sp.delete(k);
      else sp.set(k, v);
    });
    const qs = sp.toString();
    router.push(qs ? `/?${qs}` : "/");
  };

  const onMonthChange = (m: string) => navigate({ month: m, view: null });
  const onPlanningClick = () =>
    navigate({ view: isPlanning ? null : "planning" });

  const openNewTransaction = (template?: QuickAddTemplate | null) => {
    setTxEditing(null);
    setPrefillTemplate(template ?? null);
    setTxFormOpen(true);
  };

  const openEditTransaction = (item: TransactionWithCategory) => {
    setTxEditing(item);
    setPrefillTemplate(null);
    setTxFormOpen(true);
  };

  return (
    <div className={styles.shell}>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className={styles.main}>
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          onAddTransaction={() => openNewTransaction()}
          userName={userName}
          userEmail={userEmail}
        />

        <main className={styles.content}>
          <div className={styles.monthBar}>
            <MonthTabs
              activeMonth={monthKey}
              onMonthChange={onMonthChange}
              isPlanning={isPlanning}
              onPlanningClick={onPlanningClick}
              year={displayYear}
              onYearChange={setDisplayYear}
            />
          </div>

          {isPlanning ? (
            <PlanningPlaceholder />
          ) : isEmpty ? (
            <EmptyState onAddTransaction={() => openNewTransaction()} />
          ) : (
            <>
              {quickAddTemplates.length > 0 && (
                <QuickAddTemplates
                  templates={quickAddTemplates}
                  categories={categories}
                  currency={currency}
                  onAdd={() => openNewTransaction()}
                  onPick={(tpl) => openNewTransaction(tpl)}
                />
              )}

              <section className={styles.topGrid}>
                <div className={styles.left}>
                  <MonthlySummary
                    data={monthlySummary}
                    currency={currency}
                    monthLabel={monthLabel}
                    onEdit={() => setSettingsOpen(true)}
                  />
                </div>

                <div className={styles.right}>
                  <NextPayBanner
                    nextPayDate={monthlySummary.next_pay_date}
                    daysLeft={monthlySummary.days_left_for_next_pay}
                    onEdit={() => setSettingsOpen(true)}
                  />
                  <OtherEarnings
                    items={otherEarnings}
                    currency={currency}
                    onAdd={() => {
                      setOeEditing(null);
                      setOeFormOpen(true);
                    }}
                    onDelete={(id) => {
                      const item = otherEarnings.find((e) => e.id === id);
                      if (item) {
                        setOeEditing(item);
                        setOeFormOpen(true);
                      }
                    }}
                  />
                  <FinalBalance
                    totalExpenditure={monthlySummary.total_expenditure}
                    totalEarnings={monthlySummary.total_earnings}
                    balance={monthlySummary.final_balance}
                    currency={currency}
                  />
                </div>
              </section>

              {(insights.length > 0 || upcoming.length > 0) && (
                <section className={styles.insightsRow}>
                  {insights.length > 0 && (
                    <Insights items={insights} currency={currency} />
                  )}
                  {upcoming.length > 0 && (
                    <UpcomingRecurring
                      items={upcoming}
                      categories={categories}
                      currency={currency}
                    />
                  )}
                </section>
              )}

              <section className={styles.chart}>
                <ExpenseChart
                  data={categorySummary}
                  currency={currency}
                  title="Harcama Dağılımı"
                  subtitle={`${monthLabel} · kategorilere göre`}
                />
              </section>

              <section className={styles.transactions}>
                <TransactionList
                  items={transactions}
                  currency={currency}
                  title="İşlemler"
                  subtitle={`${monthLabel} · ${transactions.length} kayıt`}
                  onAddClick={() => openNewTransaction()}
                  onItemClick={openEditTransaction}
                />
              </section>
            </>
          )}
        </main>

        <BottomNav onAdd={() => openNewTransaction()} />
      </div>

      <TransactionForm
        open={txFormOpen}
        onClose={() => {
          setTxFormOpen(false);
          setTxEditing(null);
          setPrefillTemplate(null);
        }}
        categories={categories}
        initial={
          txEditing ??
          (prefillTemplate
            ? prefillFromTemplate(prefillTemplate, categories)
            : null)
        }
      />

      <MonthlySettingsForm
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        monthKey={monthKey}
        initial={monthlySettings}
      />

      <OtherEarningForm
        open={oeFormOpen}
        onClose={() => {
          setOeFormOpen(false);
          setOeEditing(null);
        }}
        initial={oeEditing}
      />
    </div>
  );

  function PlanningPlaceholder() {
    return (
      <section className={styles.planning}>
        <h2>Planlama</h2>
        <p>
          Aylık bütçe planlaması ve kategori bazlı limitler bu sekmede yer
          alacak. Şu an v1 kapsamında değil; gerçek kullanıcı verilerinden sonra
          önceliklendirilecek.
        </p>
      </section>
    );
  }
}

function prefillFromTemplate(
  tpl: QuickAddTemplate,
  categories: Category[]
): TransactionWithCategory | null {
  const cat = categories.find((c) => c.id === tpl.category_id) ?? null;
  if (!cat) return null;
  const today = new Date();
  return {
    id: "",
    user_id: "",
    type: tpl.type,
    amount: tpl.amount,
    category_id: tpl.category_id,
    date: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`,
    description: tpl.description,
    is_recurring: false,
    month_key: "",
    created_at: "",
    updated_at: "",
    category: cat,
  } as unknown as TransactionWithCategory;
}
