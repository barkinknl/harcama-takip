import { Pencil } from "lucide-react";
import styles from "./MonthlySummary.module.css";
import { formatCurrency } from "@/lib/format";
import type { MonthlySummaryData } from "@/types";

export interface MonthlySummaryProps {
  data: MonthlySummaryData;
  currency?: string;
  monthLabel: string;
  onEdit?: () => void;
}

interface Row {
  key: keyof Pick<
    MonthlySummaryData,
    "income" | "last_month_debit" | "this_month_balance" | "left_to_spend"
  >;
  label: string;
  hint?: string;
}

const ROWS: Row[] = [
  { key: "income", label: "INCOME", hint: "Beklenen aylık gelir" },
  { key: "last_month_debit", label: "LAST MONTH'S DEBIT", hint: "Geçen aydan devreden" },
  { key: "this_month_balance", label: "THIS MONTH'S BALANCE", hint: "Gelir − devreden" },
  { key: "left_to_spend", label: "LEFT TO SPEND", hint: "Kalan harcama bütçesi" },
];

export function MonthlySummary({
  data,
  currency = "TRY",
  monthLabel,
  onEdit,
}: MonthlySummaryProps) {
  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <h2 className={styles.title}>Expense Tracker</h2>
          <span className={styles.month}>{monthLabel}</span>
        </div>
        {onEdit && (
          <button
            type="button"
            className={styles.editBtn}
            onClick={onEdit}
            aria-label="Düzenle"
          >
            <Pencil size={14} strokeWidth={2.2} />
          </button>
        )}
      </header>

      <div className={styles.rows}>
        {ROWS.map((row, idx) => {
          const value = data[row.key];
          const isNegative = value < 0;
          const isLeftToSpend = row.key === "left_to_spend";

          return (
            <div
              key={row.key}
              className={`${styles.row} ${
                isLeftToSpend ? styles.rowEmphasis : ""
              }`}
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              <div className={styles.rowLeft}>
                <span className={styles.rowLabel}>{row.label}</span>
                {row.hint && (
                  <span className={styles.rowHint}>{row.hint}</span>
                )}
              </div>
              <span
                className={`${styles.rowValue} ${
                  isNegative ? styles.valueNegative : ""
                }`}
              >
                {formatCurrency(value, currency)}
              </span>
            </div>
          );
        })}

        <div className={`${styles.row} ${styles.rowDays}`}>
          <div className={styles.rowLeft}>
            <span className={styles.rowLabel}>DAYS LEFT FOR THE NEXT PAY</span>
            <span className={styles.rowHint}>Sonraki maaşa kalan</span>
          </div>
          <span className={styles.rowDaysValue}>
            {data.days_left_for_next_pay ?? "—"}
            <span className={styles.rowDaysUnit}>gün</span>
          </span>
        </div>
      </div>
    </section>
  );
}
