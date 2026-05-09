"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { upsertOtherEarning, deleteOtherEarning } from "@/app/actions/earnings";
import styles from "../transactions/TransactionForm.module.css";
import type { OtherEarning } from "@/types";

export interface OtherEarningFormProps {
  open: boolean;
  onClose: () => void;
  initial?: OtherEarning | null;
}

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export function OtherEarningForm({
  open,
  onClose,
  initial,
}: OtherEarningFormProps) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayISO());
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDelete] = useTransition();

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setAmount(String(initial.amount));
      setDate(initial.date);
      setDescription(initial.description ?? "");
    } else {
      setAmount("");
      setDate(todayISO());
      setDescription("");
    }
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
    const numericAmount = parseFloat(amount.replace(",", "."));
    if (!numericAmount || numericAmount <= 0) {
      setError("Geçerli bir tutar girin.");
      return;
    }
    const fd = new FormData();
    if (initial?.id) fd.append("id", initial.id);
    fd.append("amount", String(numericAmount));
    fd.append("date", date);
    fd.append("description", description.trim());

    startTransition(async () => {
      const result = await upsertOtherEarning(fd);
      if (!result.ok) {
        setError(result.error ?? "Kaydetme başarısız.");
        return;
      }
      onClose();
    });
  };

  const handleDelete = () => {
    if (!initial?.id) return;
    if (!confirm("Bu ek geliri silmek istediğine emin misin?")) return;
    startDelete(async () => {
      const result = await deleteOtherEarning(initial.id);
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
              {initial ? "Ek Geliri Düzenle" : "Ek Gelir Ekle"}
            </h2>
            <p className={styles.subtitle}>
              Maaş dışı kazançlar (freelance, satış vb.)
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
            label="Tutar"
            type="text"
            inputMode="decimal"
            placeholder="0,00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            autoFocus
          />

          <Input
            label="Tarih"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <div className={styles.field}>
            <label className={styles.label}>Açıklama</label>
            <textarea
              className={styles.textarea}
              placeholder="Örn: Freelance proje"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <footer className={styles.footer}>
            {initial && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleDelete}
                loading={isDeleting}
                disabled={isPending}
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
