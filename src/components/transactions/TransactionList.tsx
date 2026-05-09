"use client";

import { ArrowDownLeft, ArrowUpRight, MoreHorizontal, Plus } from "lucide-react";
import styles from "./TransactionList.module.css";
import { formatAmount, formatDayMonth } from "@/lib/format";
import type { TransactionWithCategory } from "@/types";

export interface TransactionListProps {
  items: TransactionWithCategory[];
  currency?: string;
  emptyMessage?: string;
  title?: string;
  subtitle?: string;
  onItemClick?: (item: TransactionWithCategory) => void;
  onAddClick?: () => void;
}

export function TransactionList({
  items,
  currency = "TRY",
  emptyMessage = "Henüz bir işlem kaydetmediniz.",
  title = "İşlemler",
  subtitle,
  onItemClick,
  onAddClick,
}: TransactionListProps) {
  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <div>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.subtitle}>
            {subtitle ??
              (items.length > 0
                ? `${items.length} işlem listeleniyor`
                : "Henüz işlem yok")}
          </p>
        </div>
        {onAddClick && (
          <button
            type="button"
            className={styles.addBtn}
            onClick={onAddClick}
          >
            <Plus size={14} strokeWidth={2.4} />
            <span>Yeni İşlem</span>
          </button>
        )}
      </header>

      <div className={styles.tableWrap}>
        <div className={`${styles.row} ${styles.rowHeader}`}>
          <span>DATE</span>
          <span>AMOUNT</span>
          <span>DESCRIPTION</span>
          <span className={styles.headerType}>TYPE</span>
        </div>

        {items.length === 0 ? (
          <div className={styles.empty}>
            <p>{emptyMessage}</p>
            {onAddClick && (
              <button
                type="button"
                className={styles.emptyBtn}
                onClick={onAddClick}
              >
                <Plus size={14} strokeWidth={2.4} />
                İlk İşlemi Ekle
              </button>
            )}
          </div>
        ) : (
          <ul className={styles.list}>
            {items.map((item) => {
              const isIncome = item.type === "income";
              const sign = isIncome ? "+" : "−";
              const color =
                item.category?.color ??
                (isIncome ? "var(--sage-500)" : "var(--coral-500)");

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={styles.row}
                    onClick={() => onItemClick?.(item)}
                  >
                    <span className={styles.cellDate}>
                      {formatDayMonth(item.date)}
                    </span>

                    <span
                      className={`${styles.cellAmount} ${
                        isIncome ? styles.amountIn : styles.amountOut
                      }`}
                    >
                      {sign} {formatAmount(Math.abs(item.amount))}
                      <span className={styles.currency}>{currency}</span>
                    </span>

                    <span
                      className={styles.cellDesc}
                      title={item.description ?? item.category?.name ?? ""}
                    >
                      {item.description || item.category?.name || "—"}
                    </span>

                    <span className={styles.cellType}>
                      <span
                        className={styles.typePill}
                        style={{
                          background: `${color}1f`,
                          color,
                          borderColor: `${color}33`,
                        }}
                      >
                        {isIncome ? (
                          <ArrowDownLeft size={11} strokeWidth={2.4} />
                        ) : (
                          <ArrowUpRight size={11} strokeWidth={2.4} />
                        )}
                        {item.category?.name ?? (isIncome ? "Gelir" : "Gider")}
                      </span>
                    </span>

                    <span className={styles.more} aria-hidden>
                      <MoreHorizontal size={14} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
