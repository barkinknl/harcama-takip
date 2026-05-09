"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, Plus, X } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { TransactionList } from "./TransactionList";
import { TransactionForm } from "./TransactionForm";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { MONTH_NAMES_TR, type Category, type TransactionWithCategory } from "@/types";
import styles from "./TransactionsView.module.css";

export interface TransactionsViewProps {
  transactions: TransactionWithCategory[];
  categories: Category[];
  currency?: string;
  userName?: string;
  userEmail?: string;
  filters: {
    month?: string;
    type?: "income" | "expense";
    category?: string;
    q?: string;
  };
}

export function TransactionsView({
  transactions,
  categories,
  currency,
  userName,
  userEmail,
  filters,
}: TransactionsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TransactionWithCategory | null>(null);
  const [search, setSearch] = useState(filters.q ?? "");

  const updateFilters = (next: Partial<TransactionsViewProps["filters"]>) => {
    const sp = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([k, v]) => {
      if (!v) sp.delete(k);
      else sp.set(k, String(v));
    });
    const qs = sp.toString();
    router.push(qs ? `/transactions?${qs}` : "/transactions");
  };

  const clearFilters = () => router.push("/transactions");

  const hasActiveFilters = !!(
    filters.month ||
    filters.type ||
    filters.category ||
    filters.q
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ q: search.trim() || undefined });
  };

  return (
    <div className={styles.shell}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={styles.main}>
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          onAddTransaction={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          userName={userName}
          userEmail={userEmail}
        />

        <main className={styles.content}>
          <header className={styles.pageHeader}>
            <div>
              <h1 className={styles.title}>İşlemler</h1>
              <p className={styles.subtitle}>
                Tüm gelir ve giderlerini buradan yönet, filtrele ve düzenle.
              </p>
            </div>
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
              leftIcon={<Plus size={16} strokeWidth={2.4} />}
            >
              Yeni İşlem
            </Button>
          </header>

          <section className={styles.filters}>
            <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
              <Input
                placeholder="Açıklamada ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                fullWidth={false}
                className={styles.searchInput}
              />
            </form>

            <div className={styles.filterChips}>
              <FilterSelect
                label="Ay"
                value={filters.month ?? ""}
                onChange={(v) => updateFilters({ month: v || undefined })}
                options={generateMonthOptions()}
              />

              <FilterSelect
                label="Tür"
                value={filters.type ?? ""}
                onChange={(v) =>
                  updateFilters({
                    type: (v as "income" | "expense") || undefined,
                  })
                }
                options={[
                  { value: "", label: "Hepsi" },
                  { value: "expense", label: "Gider" },
                  { value: "income", label: "Gelir" },
                ]}
              />

              <FilterSelect
                label="Kategori"
                value={filters.category ?? ""}
                onChange={(v) => updateFilters({ category: v || undefined })}
                options={[
                  { value: "", label: "Hepsi" },
                  ...categories.map((c) => ({
                    value: c.id,
                    label: c.name,
                  })),
                ]}
              />

              {hasActiveFilters && (
                <button
                  type="button"
                  className={styles.clearBtn}
                  onClick={clearFilters}
                >
                  <X size={14} strokeWidth={2.4} />
                  Filtreleri Temizle
                </button>
              )}
            </div>

            <div className={styles.summary}>
              <Filter size={14} strokeWidth={2.2} />
              <span>{transactions.length} kayıt görüntüleniyor</span>
            </div>
          </section>

          <TransactionList
            items={transactions}
            currency={currency}
            title="Sonuçlar"
            subtitle={`${transactions.length} işlem`}
            onItemClick={(item) => {
              setEditing(item);
              setFormOpen(true);
            }}
          />
        </main>

        <BottomNav
          onAdd={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        />
      </div>

      <TransactionForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        categories={categories}
        initial={editing}
      />
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className={styles.selectWrap}>
      <span>{label}</span>
      <select
        className={styles.select}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function generateMonthOptions() {
  const now = new Date();
  const opts = [{ value: "", label: "Tüm aylar" }];
  for (let i = 0; i < 24; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    opts.push({
      value: key,
      label: `${MONTH_NAMES_TR[d.getMonth()]} ${d.getFullYear()}`,
    });
  }
  return opts;
}
