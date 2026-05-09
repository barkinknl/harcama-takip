import Link from "next/link";
import { Wallet } from "lucide-react";
import styles from "./auth.module.css";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.shell}>
      <aside className={styles.brandSide}>
        <Link href="/" className={styles.brand}>
          <span className={styles.brandIcon}>
            <Wallet size={22} strokeWidth={2.4} />
          </span>
          <span>
            <span className={styles.brandTitle}>Harcama Takip</span>
            <span className={styles.brandSubtitle}>Bireysel Finans</span>
          </span>
        </Link>

        <div className={styles.brandBody}>
          <h1 className={styles.headline}>
            Maaşından maaşına <span className={styles.gradient}>her şey kontrol altında.</span>
          </h1>
          <p className={styles.lead}>
            Excel kalitesinde takip, tek tıkla giriş, kategori bazlı analiz.
            Hesabını aç, başla.
          </p>

          <ul className={styles.points}>
            <li>Aylık otomatik bakiye devri</li>
            <li>Kategori bazlı renkli grafikler</li>
            <li>Verin sende — istediğin zaman dışa aktar</li>
          </ul>
        </div>

        <p className={styles.legal}>
          Devam ederek{" "}
          <Link href="/terms">Kullanım Koşulları</Link>’nı ve{" "}
          <Link href="/privacy">Gizlilik Politikası</Link>’nı kabul etmiş
          olursun.
        </p>
      </aside>

      <main className={styles.formSide}>
        <div className={styles.formInner}>{children}</div>
      </main>
    </div>
  );
}
