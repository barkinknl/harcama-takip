import Link from "next/link";
import { ArrowLeft, Wallet } from "lucide-react";
import styles from "./legal.module.css";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>
          <span className={styles.brandIcon}>
            <Wallet size={20} strokeWidth={2.4} />
          </span>
          <span className={styles.brandTitle}>Harcama Takip</span>
        </Link>
        <Link href="/" className={styles.back}>
          <ArrowLeft size={14} strokeWidth={2.4} />
          Ana Sayfa
        </Link>
      </header>

      <main className={styles.content}>{children}</main>
    </div>
  );
}
