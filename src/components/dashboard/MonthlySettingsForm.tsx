"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { upsertMonthlySettings } from "@/app/actions/monthlySettings";
import styles from "../transactions/TransactionForm.module.css";

export interface MonthlySettingsFormProps {
  open: boolean;
  onClose: () => void;
  monthKey: string;
  initial: {
    income: number;
    last_month_debit: number;
    next_pay_date: string | null;
  };
}

export function MonthlySettingsForm({
  open,
  onClose,
  monthKey,
  initial,
}: MonthlySettingsFormProps) {
  const [income, setIncome] = useState(String(initial.income ?? 0));
  const [debit, setDebit] = useState(String(initial.last_month_debit ?? 0));
  const [nextPay, setNextPay] = useState(initial.next_pay_date ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    setIncome(String(initial.income ?? 0));
    setDebit(String(initial.last_month_debit ?? 0));
    setNextPay(initial.next_pay_date ?? "");
    setError(null);
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData();
    fd.append("month_key", monthKey);
    fd.append("income", income.replace(",", "."));
    fd.append("last_month_debit", debit.replace(",", "."));
    if (nextPay) fd.append("next_pay_date", nextPay);

    startTransition(async () => {
      const result = await upsertMonthlySettings(fd);
      if (!result.ok) {
        setError(result.error ?? "Kaydetme başarısız.");
        return;
      }
      onClose();
    });
  };

  if (!open) return null;

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.dialog}>
        <header className={styles.header}>
          <div>
            <h2 className={styles.title}>Aylık Ayarlar</h2>
            <p className={styles.subtitle}>
              Beklenen gelir, devir borcu ve sonraki maaş tarihi
            </p>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Kapat"
          >
            <X size={20} />
          </button>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <Input
            label="Beklenen Aylık Gelir"
            type="text"
            inputMode="decimal"
            placeholder="0,00"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            autoFocus
          />

          <Input
            label="Geçen Aydan Devreden"
            type="text"
            inputMode="decimal"
            placeholder="0,00"
            value={debit}
            onChange={(e) => setDebit(e.target.value)}
            hint="Bir önceki ay eksiye düştüyse buraya girin"
          />

          <Input
            label="Sonraki Maaş Tarihi"
            type="date"
            value={nextPay}
            onChange={(e) => setNextPay(e.target.value)}
          />

          {error && <p className={styles.error}>{error}</p>}

          <footer className={styles.footer}>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isPending}
            >
              İptal
            </Button>
            <Button type="submit" loading={isPending}>
              Kaydet
            </Button>
          </footer>
        </form>
      </div>
    </div>
  );
}
