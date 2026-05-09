"use client";

import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, ClipboardList } from "lucide-react";
import styles from "./MonthTabs.module.css";
import { MONTH_SHORT_TR, MONTH_NAMES_TR } from "@/types";

export interface MonthTabsProps {
  /** YYYY-MM */
  activeMonth: string;
  onMonthChange: (monthKey: string) => void;
  onPlanningClick?: () => void;
  isPlanning?: boolean;
  /** Hangi yıllar listelensin (varsayılan: aktif yıl ± 1) */
  year?: number;
  onYearChange?: (year: number) => void;
}

const COLORS = [
  "#fbe1de", // Oca - coral
  "#fde6df", // Şub - salmon
  "#fcefcf", // Mar - amber
  "#e2efdd", // Nis - sage
  "#d8e8e3", // May - teal
  "#dde6f5", // Haz - blue
  "#e8def5", // Tem - purple
  "#f5def0", // Ağu - pink
  "#fbe1de", // Eyl - coral
  "#fde6df", // Eki - salmon
  "#fcefcf", // Kas - amber
  "#e2efdd", // Ara - sage
];

export function MonthTabs({
  activeMonth,
  onMonthChange,
  onPlanningClick,
  isPlanning = false,
  year,
  onYearChange,
}: MonthTabsProps) {
  const [activeYear, activeMonthNum] = activeMonth.split("-").map(Number);
  const displayYear = year ?? activeYear;
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const activeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (activeBtnRef.current) {
      activeBtnRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeMonth, isPlanning]);

  const goPrevYear = () => onYearChange?.(displayYear - 1);
  const goNextYear = () => onYearChange?.(displayYear + 1);

  return (
    <div className={styles.bar}>
      <div className={styles.yearControl}>
        <button
          type="button"
          className={styles.yearBtn}
          onClick={goPrevYear}
          aria-label="Önceki yıl"
          disabled={!onYearChange}
        >
          <ChevronLeft size={14} strokeWidth={2.4} />
        </button>
        <span className={styles.yearLabel}>{displayYear}</span>
        <button
          type="button"
          className={styles.yearBtn}
          onClick={goNextYear}
          aria-label="Sonraki yıl"
          disabled={!onYearChange}
        >
          <ChevronRight size={14} strokeWidth={2.4} />
        </button>
      </div>

      <div className={styles.scroll} ref={scrollRef}>
        <button
          type="button"
          className={`${styles.tab} ${styles.planning} ${
            isPlanning ? styles.active : ""
          }`}
          onClick={onPlanningClick}
          ref={isPlanning ? activeBtnRef : null}
        >
          <ClipboardList size={13} strokeWidth={2.4} />
          <span>Planlama</span>
        </button>

        <span className={styles.divider} aria-hidden />

        {MONTH_SHORT_TR.map((short, idx) => {
          const monthNum = idx + 1;
          const monthKey = `${displayYear}-${String(monthNum).padStart(2, "0")}`;
          const active =
            !isPlanning &&
            activeYear === displayYear &&
            activeMonthNum === monthNum;

          return (
            <button
              key={monthKey}
              type="button"
              ref={active ? activeBtnRef : null}
              className={`${styles.tab} ${active ? styles.active : ""}`}
              onClick={() => onMonthChange(monthKey)}
              title={MONTH_NAMES_TR[idx]}
              style={
                active
                  ? ({ "--tab-color": COLORS[idx] } as React.CSSProperties)
                  : undefined
              }
            >
              <span className={styles.tabShort}>{short}</span>
              <span className={styles.tabLong}>{MONTH_NAMES_TR[idx]}</span>
              <span
                className={styles.tabBar}
                style={{ background: COLORS[idx] }}
                aria-hidden
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
