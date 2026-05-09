"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tags,
  Settings,
  Plus,
} from "lucide-react";
import styles from "./BottomNav.module.css";

const ITEMS = [
  { href: "/", label: "Özet", icon: LayoutDashboard },
  { href: "/transactions", label: "İşlemler", icon: ArrowLeftRight },
  { href: "/categories", label: "Kategori", icon: Tags },
  { href: "/settings", label: "Ayarlar", icon: Settings },
];

export interface BottomNavProps {
  onAdd?: () => void;
}

export function BottomNav({ onAdd }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} aria-label="Alt menü">
      {ITEMS.slice(0, 2).map((item) => (
        <NavBtn key={item.href} item={item} pathname={pathname} />
      ))}

      {onAdd && (
        <button
          type="button"
          className={styles.addBtn}
          onClick={onAdd}
          aria-label="Yeni işlem ekle"
        >
          <Plus size={20} strokeWidth={2.6} />
        </button>
      )}

      {ITEMS.slice(2).map((item) => (
        <NavBtn key={item.href} item={item} pathname={pathname} />
      ))}
    </nav>
  );
}

function NavBtn({
  item,
  pathname,
}: {
  item: (typeof ITEMS)[number];
  pathname: string;
}) {
  const Icon = item.icon;
  const active =
    item.href === "/"
      ? pathname === "/"
      : pathname?.startsWith(item.href);

  return (
    <Link
      href={item.href}
      className={`${styles.item} ${active ? styles.active : ""}`}
    >
      <Icon size={18} strokeWidth={2.2} />
      <span>{item.label}</span>
    </Link>
  );
}
