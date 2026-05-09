"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { X, ArrowDownLeft, ArrowUpRight, Repeat } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import styles from "./TransactionForm.module.css";
import {
  upsertTransaction,
  deleteTransaction,
} from "@/app/actions/transactions";
import type { Category, TransactionType, TransactionWithCategory } from "@/types";

export interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  /** Düzenleme modu için */
  initial?: TransactionWithCategory | null;
}

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export function TransactionForm({
  open,
  onClose,
  categories,
  initial,
}: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(todayISO());
  const [description, setDescription] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDelete] = useTransition();

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setType(initial.type);
      setAmount(String(initial.amount));
      setCategoryId(initial.category_id);
      setDate(initial.date);
      setDescription(initial.description ?? "");
      setIsRecurring(initial.is_recurring ?? false);
    } else {
      setType("expense");
      setAmount("");
      setCategoryId("");
      setDate(todayISO());
      setDescription("");
      setIsRecurring(false);
    }
    setError(null);
    setFieldErrors({});
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

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const numericAmount = parseFloat(amount.replace(",", "."));
    if (!numericAmount || numericAmount <= 0) {
      setFieldErrors({ amount: ["Geçerli bir tutar girin."] });
      return;
    }
    if (!categoryId) {
      setFieldErrors({ category_id: ["Bir kategori seçin."] });
      return;
    }

    const fd = new FormData();
    if (initial?.id) fd.append("id", initial.id);
    fd.append("type", type);
    fd.append("amount", String(numericAmount));
    fd.append("category_id", categoryId);
    fd.append("date", date);
    fd.append("description", description.trim());
    fd.append("is_recurring", isRecurring ? "true" : "false");

    startTransition(async () => {
      const result = await upsertTransaction(fd);
      if (!result.ok) {
        setError(result.error ?? "Kaydetme başarısız.");
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
        return;
      }
      onClose();
    });
  };

  const handleDelete = () => {
    if (!initial?.id) return;
    if (!confirm("Bu işlemi silmek istediğine emin misin?")) return;
    startDelete(async () => {
      const result = await deleteTransaction(initial.id);
      if (!result.ok) {
        setError(result.error ?? "Silme başarısız.");
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
            <h2 className={styles.title}>
              {initial?.id ? "İşlemi Düzenle" : "Yeni İşlem Ekle"}
            </h2>
            <p className={styles.subtitle}>
              Gelir veya gider işleminizi kaydedin.
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
          <div
            className={`${styles.typeSwitch} ${
              type === "income" ? styles.typeIncome : styles.typeExpense
            }`}
          >
            <button
              type="button"
              className={`${styles.typeBtn} ${
                type === "expense" ? styles.typeBtnActive : ""
              }`}
              onClick={() => setType("expense")}
            >
              <ArrowUpRight size={16} strokeWidth={2.4} />
              Gider
            </button>
            <button
              type="button"
              className={`${styles.typeBtn} ${
                type === "income" ? styles.typeBtnActive : ""
              }`}
              onClick={() => setType("income")}
            >
              <ArrowDownLeft size={16} strokeWidth={2.4} />
              Gelir
            </button>
          </div>

          <Input
            label="Tutar"
            type="text"
            inputMode="decimal"
            placeholder="0,00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={fieldErrors.amount?.[0]}
            autoFocus
          />

          <div className={styles.field}>
            <label htmlFor="category" className={styles.label}>
              Kategori
            </label>
            <select
              id="category"
              className={styles.select}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Kategori seç…</option>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {fieldErrors.category_id?.[0] && (
              <span className={styles.fieldError}>
                {fieldErrors.category_id[0]}
              </span>
            )}
          </div>

          <Input
            label="Tarih"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            error={fieldErrors.date?.[0]}
          />

          <div className={styles.field}>
            <label htmlFor="description" className={styles.label}>
              Açıklama (opsiyonel)
            </label>
            <textarea
              id="description"
              className={styles.textarea}
              placeholder="Örn: Market alışverişi"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <label className={styles.recurringRow}>
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
            />
            <span className={styles.recurringIcon}>
              <Repeat size={14} strokeWidth={2.2} />
            </span>
            <span>
              <span className={styles.recurringLabel}>Tekrarlayan ödeme</span>
              <span className={styles.recurringHint}>
                Her ay aynı günde kendiliğinden hatırlatılsın
              </span>
            </span>
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <footer className={styles.footer}>
            {initial?.id && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleDelete}
                loading={isDeleting}
                disabled={isPending || isDeleting}
                className={styles.deleteBtn}
              >
                Sil
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isPending || isDeleting}
            >
              İptal
            </Button>
            <Button type="submit" loading={isPending} disabled={isDeleting}>
              {initial ? "Güncelle" : "Kaydet"}
            </Button>
          </footer>
        </form>
      </div>
    </div>
  );
}
