"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Download, LogOut, Trash2, Save, Sun, Moon } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { signOut } from "@/app/(auth)/actions";
import {
  updateProfile,
  exportData,
  deleteAccountData,
} from "@/app/actions/profile";
import type { UserProfile } from "@/types";
import styles from "./SettingsView.module.css";

const CURRENCIES = [
  { value: "TRY", label: "₺ — Türk Lirası" },
  { value: "USD", label: "$ — ABD Doları" },
  { value: "EUR", label: "€ — Euro" },
  { value: "GBP", label: "£ — İngiliz Sterlini" },
];

export interface SettingsViewProps {
  profile: UserProfile | null;
  email: string;
}

export function SettingsView({ profile, email }: SettingsViewProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [currency, setCurrency] = useState(profile?.currency ?? "TRY");
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isSaving, startSave] = useTransition();
  const [isExporting, startExport] = useTransition();
  const [isDeleting, startDelete] = useTransition();

  const onSaveProfile = (e: FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);
    setProfileError(null);
    const fd = new FormData();
    fd.append("full_name", fullName);
    fd.append("currency", currency);
    startSave(async () => {
      const result = await updateProfile(fd);
      if (!result.ok) {
        setProfileError(result.error ?? "Kaydetme başarısız.");
        return;
      }
      setProfileMessage("Profil güncellendi.");
    });
  };

  const onExport = () => {
    startExport(async () => {
      const result = await exportData();
      if (!result.ok || !result.data) {
        alert(result.error ?? "Dışa aktarma başarısız.");
        return;
      }
      const blob = new Blob([result.data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `harcama-takip-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
  };

  const onDelete = () => {
    if (
      !confirm(
        "Tüm verilerin (işlemler, kategoriler, ek gelirler, aylık ayarlar) silinecek ve oturumun kapatılacak. Devam etmek istiyor musun?"
      )
    )
      return;
    if (
      !confirm(
        "Son uyarı! Bu işlem geri alınamaz. Verilerini silmeden önce ihracat almak ister misin?"
      )
    )
      return;
    startDelete(async () => {
      await deleteAccountData();
    });
  };

  const onToggleTheme = () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* noop */
    }
  };

  return (
    <div className={styles.shell}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={styles.main}>
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          userName={profile?.full_name ?? undefined}
          userEmail={email}
        />

        <main className={styles.content}>
          <header className={styles.pageHeader}>
            <h1 className={styles.title}>Ayarlar</h1>
            <p className={styles.subtitle}>
              Profil, görünüm, gizlilik ve veri yönetimi.
            </p>
          </header>

          {/* Profil */}
          <section className={styles.section}>
            <header className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Profil</h2>
              <p className={styles.sectionDesc}>
                İsim ve para birimi tercihin
              </p>
            </header>

            <form onSubmit={onSaveProfile} className={styles.sectionBody}>
              <Input
                label="Ad Soyad"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Adın Soyadın"
              />
              <Input label="E-posta" value={email} readOnly disabled />

              <div className={styles.field}>
                <label className={styles.label}>Para Birimi</label>
                <select
                  className={styles.select}
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {profileError && (
                <div className={`${styles.banner} ${styles.bannerError}`}>
                  {profileError}
                </div>
              )}
              {profileMessage && (
                <div className={`${styles.banner} ${styles.bannerSuccess}`}>
                  {profileMessage}
                </div>
              )}

              <div className={styles.sectionFooter}>
                <Button
                  type="submit"
                  loading={isSaving}
                  leftIcon={!isSaving && <Save size={16} />}
                >
                  Kaydet
                </Button>
              </div>
            </form>
          </section>

          {/* Görünüm */}
          <section className={styles.section}>
            <header className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Görünüm</h2>
              <p className={styles.sectionDesc}>Tema tercihini değiştir</p>
            </header>
            <div className={styles.sectionBody}>
              <div className={styles.row}>
                <div>
                  <p className={styles.rowTitle}>Açık / Koyu Mod</p>
                  <p className={styles.rowText}>
                    Sistem temasını izleyebilir veya manuel ayarlayabilirsin.
                  </p>
                </div>
                <Button variant="secondary" onClick={onToggleTheme}>
                  <Sun size={14} />
                  <span style={{ margin: "0 4px" }}>/</span>
                  <Moon size={14} />
                </Button>
              </div>
            </div>
          </section>

          {/* Veri */}
          <section className={styles.section}>
            <header className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Verilerim</h2>
              <p className={styles.sectionDesc}>
                Tüm verini JSON olarak indirebilir, dilediğinde silebilirsin.
              </p>
            </header>
            <div className={styles.sectionBody}>
              <div className={styles.row}>
                <div>
                  <p className={styles.rowTitle}>Verileri Dışa Aktar</p>
                  <p className={styles.rowText}>
                    Profil, kategoriler, işlemler, ek gelirler ve aylık ayarlar
                    JSON dosyası olarak indirilir.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onClick={onExport}
                  loading={isExporting}
                  leftIcon={!isExporting && <Download size={16} />}
                >
                  İndir
                </Button>
              </div>

              <div className={styles.divider} />

              <div className={styles.row}>
                <div>
                  <p className={`${styles.rowTitle} ${styles.danger}`}>
                    Tüm Verileri Sil
                  </p>
                  <p className={styles.rowText}>
                    Tüm işlemler, kategoriler ve ayarlar silinir. Hesap
                    girişi devre dışı kalır.
                  </p>
                </div>
                <Button
                  variant="danger"
                  onClick={onDelete}
                  loading={isDeleting}
                  leftIcon={!isDeleting && <Trash2 size={16} />}
                >
                  Sil
                </Button>
              </div>
            </div>
          </section>

          {/* Hesap */}
          <section className={styles.section}>
            <header className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Hesap</h2>
            </header>
            <div className={styles.sectionBody}>
              <form action={signOut} className={styles.row}>
                <div>
                  <p className={styles.rowTitle}>Çıkış Yap</p>
                  <p className={styles.rowText}>
                    Bu cihazdaki oturumunu kapatır.
                  </p>
                </div>
                <Button
                  type="submit"
                  variant="ghost"
                  leftIcon={<LogOut size={16} />}
                >
                  Çıkış
                </Button>
              </form>
            </div>
          </section>
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
