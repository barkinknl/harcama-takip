"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import styles from "./ExpenseChart.module.css";
import type { CategorySummary } from "@/types";

export interface ExpenseChartProps {
  data: CategorySummary[];
  currency?: string;
  title?: string;
  subtitle?: string;
}

const formatCurrency = (value: number, currency = "TRY") => {
  try {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${value.toFixed(0)} ${currency}`;
  }
};

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: CategorySummary }>;
  currency?: string;
}

function ChartTooltip({ active, payload, currency }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0].payload;
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipHeader}>
        <span
          className={styles.tooltipDot}
          style={{ background: item.category_color }}
          aria-hidden
        />
        <span className={styles.tooltipName}>{item.category_name}</span>
      </div>
      <div className={styles.tooltipValue}>
        {formatCurrency(item.total, currency)}
      </div>
      <div className={styles.tooltipMeta}>
        <span>{item.percentage.toFixed(1)}% pay</span>
        <span>•</span>
        <span>{item.count} işlem</span>
      </div>
    </div>
  );
}

export function ExpenseChart({
  data,
  currency = "TRY",
  title = "Harcama Dağılımı",
  subtitle = "Kategorilere göre giderler",
}: ExpenseChartProps) {
  const total = useMemo(
    () => data.reduce((sum, item) => sum + item.total, 0),
    [data]
  );

  const isEmpty = data.length === 0 || total === 0;

  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <div>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
      </header>

      {isEmpty ? (
        <div className={styles.empty}>
          <div className={styles.emptyCircle} aria-hidden />
          <p className={styles.emptyText}>
            Henüz bir gider girmediniz.
          </p>
          <p className={styles.emptyHint}>
            Yeni işlem ekleyerek harcama analizini görüntüleyin.
          </p>
        </div>
      ) : (
        <div className={styles.body}>
          <div className={styles.chartWrap}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="total"
                  nameKey="category_name"
                  innerRadius="62%"
                  outerRadius="92%"
                  paddingAngle={2}
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                >
                  {data.map((item) => (
                    <Cell
                      key={item.category_id}
                      fill={item.category_color}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={(props: unknown) => (
                    <ChartTooltip
                      {...(props as ChartTooltipProps)}
                      currency={currency}
                    />
                  )}
                  wrapperStyle={{ outline: "none" }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className={styles.center}>
              <span className={styles.centerLabel}>Toplam Gider</span>
              <span className={styles.centerValue}>
                {formatCurrency(total, currency)}
              </span>
            </div>
          </div>

          <ul className={styles.legend}>
            {data.slice(0, 6).map((item) => (
              <li key={item.category_id} className={styles.legendItem}>
                <span
                  className={styles.legendDot}
                  style={{ background: item.category_color }}
                  aria-hidden
                />
                <span className={styles.legendName}>
                  {item.category_name}
                </span>
                <span className={styles.legendPct}>
                  {item.percentage.toFixed(1)}%
                </span>
                <span className={styles.legendValue}>
                  {formatCurrency(item.total, currency)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
