import { ArrowDownCircle, ArrowUpCircle, Scale } from "lucide-react";
import styles from "./FinalBalance.module.css";
import { formatCurrency } from "@/lib/format";

export interface FinalBalanceProps {
  totalExpenditure: number;
  totalEarnings: number;
  balance: number;
  currency?: string;
}

export function FinalBalance({
  totalExpenditure,
  totalEarnings,
  balance,
  currency = "TRY",
}: FinalBalanceProps) {
  const isPositive = balance >= 0;

  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <h3 className={styles.title}>Final Balance</h3>
      </header>

      <div className={styles.rows}>
        <div className={styles.row}>
          <span className={styles.rowIcon}>
            <ArrowDownCircle size={14} strokeWidth={2.2} />
          </span>
          <span className={styles.rowLabel}>TOTAL EXPENDITURE</span>
          <span className={`${styles.rowValue} ${styles.valueExpense}`}>
            {formatCurrency(totalExpenditure, currency)}
          </span>
        </div>

        <div className={styles.row}>
          <span className={styles.rowIcon}>
            <ArrowUpCircle size={14} strokeWidth={2.2} />
          </span>
          <span className={styles.rowLabel}>TOTAL EARNINGS</span>
          <span className={`${styles.rowValue} ${styles.valueIncome}`}>
            {formatCurrency(totalEarnings, currency)}
          </span>
        </div>

        <div
          className={`${styles.row} ${styles.rowBalance} ${
            isPositive ? styles.balancePositive : styles.balanceNegative
          }`}
        >
          <span className={styles.rowIcon}>
            <Scale size={14} strokeWidth={2.2} />
          </span>
          <span className={styles.rowLabel}>BALANCE</span>
          <span className={styles.rowValue}>
            {formatCurrency(balance, currency)}
          </span>
        </div>
      </div>
    </section>
  );
}
