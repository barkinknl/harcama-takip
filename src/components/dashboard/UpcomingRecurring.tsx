import { Bell, Calendar } from "lucide-react";
import styles from "./UpcomingRecurring.module.css";
import { formatCurrency } from "@/lib/format";
import type { Category, TransactionType } from "@/types";

export interface UpcomingItem {
  id: string;
  description: string | null;
  amount: number;
  type: TransactionType;
  category_id: string | null;
  days_until: number;
  next_date: string;
}

export interface UpcomingRecurringProps {
  items: UpcomingItem[];
  categories: Category[];
  currency?: string;
}

export function UpcomingRecurring({
  items,
  categories,
  currency = "TRY",
}: UpcomingRecurringProps) {
  const catMap = new Map(categories.map((c) => [c.id, c]));
  const total = items
    .filter((i) => i.type === "expense")
    .reduce((sum, i) => sum + i.amount, 0);

  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <span className={styles.icon}>
          <Bell size={14} strokeWidth={2.4} />
        </span>
        <div className={styles.headerText}>
          <h3 className={styles.title}>Yaklaşan Sabit Ödemeler</h3>
          <p className={styles.subtitle}>
            Önümüzdeki 7 gün içinde · {items.length} kayıt
          </p>
        </div>
      </header>

      <ul className={styles.list}>
        {items.map((item) => {
          const cat = item.category_id ? catMap.get(item.category_id) : null;
          const color = cat?.color ?? "#629c8f";
          const dayLabel =
            item.days_until === 0
              ? "Bugün"
              : item.days_until === 1
                ? "Yarın"
                : `${item.days_until} gün sonra`;

          return (
            <li key={item.id} className={styles.item}>
              <span
                className={styles.dot}
                style={{ background: color }}
                aria-hidden
              />
              <div className={styles.body}>
                <span className={styles.name}>
                  {item.description || cat?.name || "Sabit ödeme"}
                </span>
                <span className={styles.meta}>
                  <Calendar size={11} strokeWidth={2.2} />
                  {dayLabel}
                </span>
              </div>
              <span
                className={`${styles.amount} ${
                  item.type === "expense" ? styles.amountOut : styles.amountIn
                }`}
              >
                {item.type === "expense" ? "-" : "+"}
                {formatCurrency(item.amount, currency)}
              </span>
            </li>
          );
        })}
      </ul>

      {total > 0 && (
        <footer className={styles.footer}>
          <span>7 günlük sabit gider toplamı</span>
          <span className={styles.totalValue}>
            {formatCurrency(total, currency)}
          </span>
        </footer>
      )}
    </section>
  );
}
