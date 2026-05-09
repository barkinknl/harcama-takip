import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Database, Key, Rocket, Wallet } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import styles from "./setup.module.css";

export const metadata: Metadata = { title: "Kurulum" };

export default function SetupPage() {
  if (isSupabaseConfigured()) {
    redirect("/");
  }

  return (
    <main className={styles.shell}>
      <div className={styles.card}>
        <header className={styles.header}>
          <span className={styles.brandIcon}>
            <Wallet size={22} strokeWidth={2.4} />
          </span>
          <span className={styles.brandTitle}>Harcama Takip</span>
          <span className={styles.statusPill}>Kurulum gerekli</span>
        </header>

        <h1 className={styles.title}>
          Backend henüz <span className={styles.gradient}>bağlı değil</span>
        </h1>
        <p className={styles.lead}>
          Uygulamanın çalışması için bir Supabase projesi açıp{" "}
          <code>.env.local</code> dosyasına URL ve anon key&apos;i koyman gerek.
          5 dakikalık bir iş — adımları aşağıda.
        </p>

        <ol className={styles.steps}>
          <li>
            <span className={styles.stepIcon}>
              <Database size={16} strokeWidth={2.4} />
            </span>
            <div>
              <h3 className={styles.stepTitle}>Supabase projesi aç</h3>
              <p className={styles.stepText}>
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className={styles.stepLink}
                >
                  supabase.com/dashboard
                </a>{" "}
                → New Project. En yakın bölgeyi seç (Frankfurt önerilir).
              </p>
            </div>
          </li>

          <li>
            <span className={styles.stepIcon}>
              <Database size={16} strokeWidth={2.4} />
            </span>
            <div>
              <h3 className={styles.stepTitle}>Şemayı yükle</h3>
              <p className={styles.stepText}>
                Supabase dashboard&apos;unda <strong>SQL Editor</strong>&apos;a
                git, repodaki{" "}
                <code>supabase/migrations/0001_init.sql</code> dosyasını
                yapıştır, <strong>Run</strong>&apos;a bas.
              </p>
            </div>
          </li>

          <li>
            <span className={styles.stepIcon}>
              <Key size={16} strokeWidth={2.4} />
            </span>
            <div>
              <h3 className={styles.stepTitle}>Anahtarları kopyala</h3>
              <p className={styles.stepText}>
                <strong>Settings → API</strong> sekmesinden{" "}
                <code>Project URL</code> ve <code>anon public</code> anahtarını
                al.
              </p>
            </div>
          </li>

          <li>
            <span className={styles.stepIcon}>
              <Rocket size={16} strokeWidth={2.4} />
            </span>
            <div>
              <h3 className={styles.stepTitle}>
                <code>.env.local</code> dosyası oluştur
              </h3>
              <pre className={styles.code}>
                {`NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...`}
              </pre>
              <p className={styles.stepText}>
                Sonra dev sunucusunu yeniden başlat:{" "}
                <code>npm run dev</code>
              </p>
            </div>
          </li>
        </ol>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            Detaylı rehber repodaki <code>SETUP.md</code> dosyasında.
          </p>
          <Link href="/sign-in" className={styles.tryBtn}>
            Yine de auth sayfasını gör
            <ArrowRight size={14} strokeWidth={2.4} />
          </Link>
        </div>
      </div>
    </main>
  );
}
