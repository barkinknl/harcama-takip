"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Edit2, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/Button";
import { CategoryForm } from "./CategoryForm";
import { deleteCategory } from "@/app/actions/categories";
import type { Category, TransactionType } from "@/types";
import styles from "./CategoriesView.module.css";

export interface CategoriesViewProps {
  categories: Category[];
  userName?: string;
  userEmail?: string;
}

export function CategoriesView({
  categories,
  userName,
  userEmail,
}: CategoriesViewProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [defaultType, setDefaultType] = useState<TransactionType>("expense");
  const [, startDelete] = useTransition();

  const expense = categories.filter((c) => c.type === "expense");
  const income = categories.filter((c) => c.type === "income");

  const onDelete = (cat: Category) => {
    if (
      !confirm(
        `"${cat.name}" kategorisini silmek istediğine emin misin? Bu kategorideki işlemlerin kategorisi boşalır.`
      )
    )
      return;
    startDelete(async () => {
      await deleteCategory(cat.id);
    });
  };

  const openNew = (type: TransactionType) => {
    setEditing(null);
    setDefaultType(type);
    setFormOpen(true);
  };

  return (
    <div className={styles.shell}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={styles.main}>
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          userName={userName}
          userEmail={userEmail}
        />

        <main className={styles.content}>
          <header className={styles.pageHeader}>
            <div>
              <h1 className={styles.title}>Kategoriler</h1>
              <p className={styles.subtitle}>
                İşlemleri renkli ve adlandırılmış kategorilerle gruplandır.
              </p>
            </div>
          </header>

          <CategorySection
            title="Giderler"
            count={expense.length}
            color="#cd5848"
            categories={expense}
            onEdit={(c) => {
              setEditing(c);
              setFormOpen(true);
            }}
            onDelete={onDelete}
            onAdd={() => openNew("expense")}
          />

          <CategorySection
            title="Gelirler"
            count={income.length}
            color="#4a8350"
            categories={income}
            onEdit={(c) => {
              setEditing(c);
              setFormOpen(true);
            }}
            onDelete={onDelete}
            onAdd={() => openNew("income")}
          />
        </main>

        <BottomNav onAdd={() => openNew("expense")} />
      </div>

      <CategoryForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        initial={editing}
        defaultType={defaultType}
      />
    </div>
  );
}

function CategorySection({
  title,
  count,
  color,
  categories,
  onEdit,
  onDelete,
  onAdd,
}: {
  title: string;
  count: number;
  color: string;
  categories: Category[];
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
  onAdd: () => void;
}) {
  const isIncome = title === "Gelirler";

  return (
    <section className={styles.section}>
      <header className={styles.sectionHeader}>
        <span
          className={styles.sectionIcon}
          style={{ background: `${color}1f`, color }}
          aria-hidden
        >
          {isIncome ? (
            <ArrowDownLeft size={14} strokeWidth={2.4} />
          ) : (
            <ArrowUpRight size={14} strokeWidth={2.4} />
          )}
        </span>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <span className={styles.sectionCount}>{count} kategori</span>
        <Button
          size="sm"
          variant="secondary"
          onClick={onAdd}
          leftIcon={<Plus size={14} strokeWidth={2.4} />}
        >
          Yeni
        </Button>
      </header>

      {categories.length === 0 ? (
        <div className={styles.empty}>Henüz kategori yok.</div>
      ) : (
        <ul className={styles.list}>
          {categories.map((c) => (
            <li key={c.id} className={styles.item}>
              <span
                className={styles.itemDot}
                style={{ background: c.color }}
                aria-hidden
              />
              <div className={styles.itemBody}>
                <span className={styles.itemName}>{c.name}</span>
                <span className={styles.itemMeta}>
                  {c.is_default ? "Varsayılan" : "Özel"} · {c.color}
                </span>
              </div>
              <div className={styles.itemActions}>
                <button
                  type="button"
                  className={styles.iconBtn}
                  onClick={() => onEdit(c)}
                  aria-label="Düzenle"
                >
                  <Edit2 size={14} strokeWidth={2.2} />
                </button>
                <button
                  type="button"
                  className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                  onClick={() => onDelete(c)}
                  aria-label="Sil"
                >
                  <Trash2 size={14} strokeWidth={2.2} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
