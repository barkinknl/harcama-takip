"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  Plus,
  LogOut,
  Settings,
  User,
  Tags,
} from "lucide-react";
import { signOut } from "@/app/(auth)/actions";
import styles from "./Header.module.css";

export interface HeaderProps {
  onMenuClick?: () => void;
  onAddTransaction?: () => void;
  userName?: string;
  userEmail?: string;
}

export function Header({
  onMenuClick,
  onAddTransaction,
  userName,
  userEmail,
}: HeaderProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const current =
      (document.documentElement.getAttribute("data-theme") as
        | "light"
        | "dark") ?? "light";
    setTheme(current);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* localStorage devre dışı */
    }
    setTheme(next);
  };

  const initials = (userName || userEmail || "?")
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button
          type="button"
          className={styles.menuBtn}
          onClick={onMenuClick}
          aria-label="Menüyü aç"
        >
          <Menu size={20} />
        </button>

        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} aria-hidden />
          <input
            type="search"
            placeholder="İşlem, kategori veya açıklama ara..."
            className={styles.searchInput}
          />
          <kbd className={styles.kbd}>⌘ K</kbd>
        </div>
      </div>

      <div className={styles.right}>
        {onAddTransaction && (
          <button
            type="button"
            className={styles.addBtn}
            onClick={onAddTransaction}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Yeni İşlem</span>
          </button>
        )}

        <button
          type="button"
          className={styles.iconBtn}
          onClick={toggleTheme}
          aria-label="Tema değiştir"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          type="button"
          className={styles.iconBtn}
          aria-label="Bildirimler"
        >
          <Bell size={18} />
        </button>

        <div className={styles.userMenu} ref={menuRef}>
          <button
            type="button"
            className={styles.avatar}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Hesap menüsü"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            {initials || "?"}
          </button>

          {menuOpen && (
            <div className={styles.dropdown} role="menu">
              <div className={styles.dropdownHeader}>
                <span className={styles.dropdownName}>
                  {userName || "Kullanıcı"}
                </span>
                {userEmail && (
                  <span className={styles.dropdownEmail}>{userEmail}</span>
                )}
              </div>

              <Link
                href="/settings"
                className={styles.dropdownItem}
                onClick={() => setMenuOpen(false)}
                role="menuitem"
              >
                <User size={15} strokeWidth={2.2} />
                Profil
              </Link>
              <Link
                href="/categories"
                className={styles.dropdownItem}
                onClick={() => setMenuOpen(false)}
                role="menuitem"
              >
                <Tags size={15} strokeWidth={2.2} />
                Kategoriler
              </Link>
              <Link
                href="/settings"
                className={styles.dropdownItem}
                onClick={() => setMenuOpen(false)}
                role="menuitem"
              >
                <Settings size={15} strokeWidth={2.2} />
                Ayarlar
              </Link>

              <div className={styles.divider} />

              <form action={signOut}>
                <button
                  type="submit"
                  className={`${styles.dropdownItem} ${styles.dropdownDanger}`}
                  role="menuitem"
                >
                  <LogOut size={15} strokeWidth={2.2} />
                  Çıkış Yap
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
