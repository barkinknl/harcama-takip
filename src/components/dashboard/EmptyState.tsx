"use client";

import { useTransition } from "react";
import { Sparkles, Wand2, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { seedDemoData } from "@/app/actions/seed";
import styles from "./EmptyState.module.css";

export interface EmptyStateProps {
  onAddTransaction: () => void;
}

export function EmptyState({ onAddTransaction }: EmptyStateProps) {
  const [pending, start] = useTransition();

  const handleSeed = () => {
    start(async () => {
      await seedDemoData();
    });
  };

  return (
    <section className={styles.card}>
      <div className={styles.iconWrap}>
        <Sparkles size={28} strokeWidth={2.2} />
      </div>
      <h2 className={styles.title}>Hoş geldin!</h2>
      <p className={styles.lead}>
        Takip etmeye başlamak için ya hemen ilk işlemini ekle ya da örnek
        verilerle dene. Örnek verileri istediğin zaman ayarlardan
        temizleyebilirsin.
      </p>

      <div className={styles.actions}>
        <Button
          onClick={onAddTransaction}
          leftIcon={<Plus size={16} strokeWidth={2.4} />}
        >
          İlk İşlemi Ekle
        </Button>
        <Button
          variant="secondary"
          onClick={handleSeed}
          loading={pending}
          leftIcon={!pending && <Wand2 size={16} strokeWidth={2.4} />}
        >
          Örnek Veriyle Başla
        </Button>
      </div>

      <ul className={styles.points}>
        <li>Aylık otomatik bakiye devri</li>
        <li>Kategori bazlı renkli grafikler</li>
        <li>Yaklaşan sabit ödemeler için hatırlatma</li>
        <li>Verin sende — istediğin zaman dışa aktar</li>
      </ul>
    </section>
  );
}
