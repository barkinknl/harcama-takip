"use client";

import { Calendar, Pencil } from "lucide-react";
import styles from "./NextPayBanner.module.css";
import { formatDottedDate } from "@/lib/format";

export interface NextPayBannerProps {
  nextPayDate: string | null;
  daysLeft: number | null;
  onEdit?: () => void;
}

export function NextPayBanner({
  nextPayDate,
  daysLeft,
  onEdit,
}: NextPayBannerProps) {
  return (
    <div className={styles.banner}>
      <div className={styles.left}>
        <span className={styles.iconWrap}>
          <Calendar size={16} strokeWidth={2.2} />
        </span>
        <div className={styles.text}>
          <span className={styles.label}>Next Pay</span>
          <span className={styles.value}>
            {nextPayDate ? formatDottedDate(nextPayDate) : "—"}
          </span>
        </div>
      </div>

      {daysLeft !== null && daysLeft >= 0 && (
        <div className={styles.countdown}>
          <span className={styles.countdownNumber}>{daysLeft}</span>
          <span className={styles.countdownLabel}>gün kaldı</span>
        </div>
      )}

      {onEdit && (
        <button
          type="button"
          className={styles.editBtn}
          onClick={onEdit}
          aria-label="Maaş tarihini düzenle"
        >
          <Pencil size={14} strokeWidth={2.2} />
        </button>
      )}
    </div>
  );
}
