import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  type LucideIcon,
} from "lucide-react";
import styles from "./SummaryCards.module.css";

export interface SummaryData {
  balance: number;
  income: number;
  expense: number;
  savings: number;
  currency?: string;
  changes?: {
    balance?: number;
    income?: number;
    expense?: number;
    savings?: number;
  };
}

interface CardConfig {
  key: keyof Omit<SummaryData, "currency" | "changes">;
  label: string;
  icon: LucideIcon;
  tone: "primary" | "success" | "danger" | "info";
}

const CARDS: CardConfig[] = [
  { key: "balance", label: "Toplam Bakiye", icon: Wallet, tone: "primary" },
  { key: "income", label: "Toplam Gelir", icon: TrendingUp, tone: "success" },
  { key: "expense", label: "Toplam Gider", icon: TrendingDown, tone: "danger" },
  { key: "savings", label: "Tasarruf", icon: PiggyBank, tone: "info" },
];

const formatCurrency = (value: number, currency = "TRY") => {
  try {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
};

const formatChange = (change?: number) => {
  if (change === undefined || Number.isNaN(change)) return null;
  const sign = change > 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}%`;
};

export interface SummaryCardsProps {
  data: SummaryData;
}

export function SummaryCards({ data }: SummaryCardsProps) {
  return (
    <div className={styles.grid}>
      {CARDS.map((card) => {
        const Icon = card.icon;
        const value = data[card.key];
        const change = data.changes?.[card.key];
        const changeLabel = formatChange(change);
        const isPositiveChange =
          change !== undefined && change >= 0;

        return (
          <article
            key={card.key}
            className={`${styles.card} ${styles[`tone-${card.tone}`]}`}
          >
            <div className={styles.cardHeader}>
              <span className={styles.label}>{card.label}</span>
              <span className={styles.iconWrap}>
                <Icon size={18} strokeWidth={2.2} />
              </span>
            </div>

            <div className={styles.value}>
              {formatCurrency(value, data.currency)}
            </div>

            {changeLabel && (
              <div
                className={`${styles.change} ${
                  isPositiveChange ? styles.changeUp : styles.changeDown
                }`}
              >
                {isPositiveChange ? (
                  <TrendingUp size={12} strokeWidth={2.5} />
                ) : (
                  <TrendingDown size={12} strokeWidth={2.5} />
                )}
                <span>{changeLabel}</span>
                <span className={styles.changeText}>geçen aya göre</span>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
