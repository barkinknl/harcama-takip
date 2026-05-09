"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { X, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { upsertCategory } from "@/app/actions/categories";
import type { Category, TransactionType } from "@/types";
import styles from "../transactions/TransactionForm.module.css";

const PRESET_COLORS = [
  "#cd5848",
  "#d97757",
  "#e0a162",
  "#ecc36b",
  "#7dbb7c",
  "#4a8350",
  "#629c8f",
  "#8fbcb1",
  "#a87dbb",
  "#94a3b8",
];

export interface CategoryFormProps {
  open: boolean;
  onClose: () => void;
  initial?: Category | null;
  defaultType?: TransactionType;
}

export function CategoryForm({
  open,
  onClose,
  initial,
  defaultType = "expense",
}: CategoryFormProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<TransactionType>(defaultType);
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setName(initial.name);
      setType(initial.type);
      setColor(initial.color);
    } else {
      setName("");
      setType(defaultType);
      setColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
    }
    setError(null);
    setFieldErrors({});
  }, [open, initial, defaultType]);

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
    setFieldErrors({});

    const fd = new FormData();
    if (initial?.id) fd.append("id", initial.id);
    fd.append("name", name.trim());
    fd.append("type", type);
    fd.append("color", color);
    fd.append("icon", initial?.icon ?? "tag");

    startTransition(async () => {
      const result = await upsertCategory(fd);
      if (!result.ok) {
        setError(result.error ?? "Kaydetme başarısız.");
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
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
              {initial ? "Kategoriyi Düzenle" : "Yeni Kategori"}
            </h2>
            <p className={styles.subtitle}>
              İsim, tür ve rengini belirle.
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
            label="İsim"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Örn: Kahve, Spor Salonu"
            error={fieldErrors.name?.[0]}
            autoFocus
            required
          />

          <div className={styles.field}>
            <label className={styles.label}>Renk</label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(10, 1fr)",
                gap: 8,
              }}
            >
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{
                    aspectRatio: "1 / 1",
                    background: c,
                    borderRadius: 999,
                    border:
                      color === c
                        ? "3px solid var(--text-primary)"
                        : "2px solid transparent",
                    cursor: "pointer",
                  }}
                  aria-label={`Renk ${c}`}
                />
              ))}
            </div>
          </div>

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
              {initial ? "Güncelle" : "Oluştur"}
            </Button>
          </footer>
        </form>
      </div>
    </div>
  );
}
