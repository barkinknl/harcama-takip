"use client";

import { Plus, Sparkles, Trash2 } from "lucide-react";
import styles from "./OtherEarnings.module.css";
import { formatCurrency, formatDayMonth } from "@/lib/format";
import type { OtherEarning } from "@/types";

export interface OtherEarningsProps {
  items: OtherEarning[];
  currency?: string;
  onAdd?: () => void;
  onDelete?: (id: string) => void;
}

export function OtherEarnings({
  items,
  currency = "TRY",
  onAdd,
  onDelete,
}: OtherEarningsProps) {
  const total = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Sparkles size={14} strokeWidth={2.4} />
          <h3 className={styles.title}>Other Earnings</h3>
        </div>
        {onAdd && (
          <button
            type="button"
            className={styles.addBtn}
            onClick={onAdd}
            aria-label="Yeni ek gelir ekle"
          >
            <Plus size={14} strokeWidth={2.4} />
          </button>
        )}
      </header>

      <div className={styles.tableWrap}>
        <div className={`${styles.row} ${styles.rowHeader}`}>
          <span>DATE</span>
          <span>AMOUNT</span>
          <span>DESCRIPTION</span>
        </div>

        {items.length === 0 ? (
          <div className={styles.empty}>
            <p>Henüz ek gelir kaydı yok.</p>
            {onAdd && (
              <button
                type="button"
                className={styles.emptyBtn}
                onClick={onAdd}
              >
                + Ek Gelir Ekle
              </button>
            )}
          </div>
        ) : (
          <ul className={styles.list}>
            {items.map((item) => (
              <li key={item.id} className={styles.row}>
                <span className={styles.cellDate}>
                  {formatDayMonth(item.date)}
                </span>
                <span className={styles.cellAmount}>
                  {formatCurrency(item.amount, currency)}
                </span>
                <span className={styles.cellDesc} title={item.description ?? ""}>
                  {item.description || "—"}
                </span>
                {onDelete && (
                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={() => onDelete(item.id)}
                    aria-label="Sil"
                  >
                    <Trash2 size={13} strokeWidth={2} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {items.length > 0 && (
        <div className={styles.totalBar}>
          <span>Toplam ek gelir</span>
          <span className={styles.totalValue}>
            {formatCurrency(total, currency)}
          </span>
        </div>
      )}
    </section>
  );
}
