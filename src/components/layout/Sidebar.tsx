"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Tags,
  Settings,
  Wallet,
  X,
} from "lucide-react";
import styles from "./Sidebar.module.css";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Genel Bakış", icon: LayoutDashboard },
  { href: "/transactions", label: "İşlemler", icon: ArrowLeftRight },
  { href: "/analytics", label: "Analiz", icon: PieChart },
  { href: "/categories", label: "Kategoriler", icon: Tags },
  { href: "/settings", label: "Ayarlar", icon: Settings },
];

export interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <div
          className={styles.backdrop}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}
        aria-label="Yan menü"
      >
        <div className={styles.header}>
          <Link href="/" className={styles.brand} onClick={onClose}>
            <div className={styles.logoIcon}>
              <Wallet size={20} strokeWidth={2.5} />
            </div>
            <div className={styles.brandText}>
              <span className={styles.brandTitle}>Harcama Takip</span>
              <span className={styles.brandSubtitle}>Bireysel Finans</span>
            </div>
          </Link>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Menüyü kapat"
          >
            <X size={20} />
          </button>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${active ? styles.active : ""}`}
                onClick={onClose}
              >
                <Icon size={18} strokeWidth={2} />
                <span>{item.label}</span>
                {active && <span className={styles.activeBar} aria-hidden />}
              </Link>
            );
          })}
        </nav>

        <div className={styles.footer}>
          <div className={styles.upgradeCard}>
            <span className={styles.upgradeBadge}>Pro</span>
            <p className={styles.upgradeTitle}>
              Tüm özellikleri keşfet
            </p>
            <p className={styles.upgradeText}>
              Sınırsız işlem, gelişmiş analiz ve daha fazlası.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
