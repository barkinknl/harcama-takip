import { TrendingDown, TrendingUp, Lightbulb, ArrowUpRight, ArrowDownRight } from "lucide-react";
import styles from "./Insights.module.css";
import { formatCurrency } from "@/lib/format";

export type InsightTone = "positive" | "negative" | "neutral";

export interface InsightItem {
  id: string;
  tone: InsightTone;
  title: string;
  body: string;
  /** Vurgulanan parasal değer (varsa) */
  amount?: number;
  /** % cinsinden değişim */
  delta?: number;
}

export interface InsightsProps {
  items: InsightItem[];
  currency?: string;
}

export function Insights({ items, currency = "TRY" }: InsightsProps) {
  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <span className={styles.icon}>
          <Lightbulb size={14} strokeWidth={2.4} />
        </span>
        <div className={styles.headerText}>
          <h3 className={styles.title}>Bu Ayın Notları</h3>
          <p className={styles.subtitle}>
            Geçen aya göre öne çıkan değişimler
          </p>
        </div>
      </header>

      <ul className={styles.list}>
        {items.map((it) => {
          const isUp = it.delta !== undefined && it.delta > 0;
          const isDown = it.delta !== undefined && it.delta < 0;

          return (
            <li
              key={it.id}
              className={`${styles.item} ${styles[`tone-${it.tone}`]}`}
            >
              <span className={styles.itemIcon}>
                {it.tone === "positive" ? (
                  <TrendingDown size={13} strokeWidth={2.4} />
                ) : it.tone === "negative" ? (
                  <TrendingUp size={13} strokeWidth={2.4} />
                ) : (
                  <Lightbulb size={13} strokeWidth={2.4} />
                )}
              </span>
              <div className={styles.itemBody}>
                <span className={styles.itemTitle}>{it.title}</span>
                <span className={styles.itemText}>{it.body}</span>
              </div>
              <div className={styles.itemRight}>
                {it.amount !== undefined && (
                  <span className={styles.itemAmount}>
                    {formatCurrency(it.amount, currency)}
                  </span>
                )}
                {it.delta !== undefined && (
                  <span className={styles.itemDelta}>
                    {isUp ? (
                      <ArrowUpRight size={11} strokeWidth={2.4} />
                    ) : isDown ? (
                      <ArrowDownRight size={11} strokeWidth={2.4} />
                    ) : null}
                    {Math.abs(it.delta).toFixed(0)}%
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
