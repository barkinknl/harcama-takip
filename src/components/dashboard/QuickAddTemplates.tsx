"use client";

import { Plus, Zap } from "lucide-react";
import styles from "./QuickAddTemplates.module.css";
import { formatCurrency } from "@/lib/format";
import type { Category, TransactionType } from "@/types";

export interface QuickAddTemplate {
  key: string;
  type: TransactionType;
  category_id: string;
  amount: number;
  description: string | null;
  count: number;
}

export interface QuickAddTemplatesProps {
  templates: QuickAddTemplate[];
  categories: Category[];
  currency?: string;
  onAdd: () => void;
  onPick: (template: QuickAddTemplate) => void;
}

export function QuickAddTemplates({
  templates,
  categories,
  currency = "TRY",
  onAdd,
  onPick,
}: QuickAddTemplatesProps) {
  const catMap = new Map(categories.map((c) => [c.id, c]));

  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <span className={styles.icon}>
          <Zap size={14} strokeWidth={2.4} />
        </span>
        <h3 className={styles.title}>Hızlı Ekle</h3>
        <span className={styles.hint}>Sık kullandığın işlemler</span>
        <button
          type="button"
          className={styles.fullBtn}
          onClick={onAdd}
        >
          <Plus size={14} strokeWidth={2.4} />
          Detaylı
        </button>
      </header>

      <div className={styles.list}>
        {templates.map((tpl) => {
          const cat = catMap.get(tpl.category_id);
          const color = cat?.color ?? "#7dbb7c";
          const label =
            tpl.description?.trim() || cat?.name || "İşlem";

          return (
            <button
              key={tpl.key}
              type="button"
              className={styles.chip}
              onClick={() => onPick(tpl)}
              style={{
                borderColor: `${color}55`,
                background: `${color}12`,
              }}
            >
              <span
                className={styles.chipDot}
                style={{ background: color }}
                aria-hidden
              />
              <span className={styles.chipBody}>
                <span className={styles.chipLabel}>{label}</span>
                <span className={styles.chipMeta}>
                  {cat?.name ?? "Kategori"} · {tpl.count}× kullanıldı
                </span>
              </span>
              <span className={styles.chipAmount} style={{ color }}>
                {formatCurrency(tpl.amount, currency)}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
