import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 460,
          padding: "3rem 2rem",
          textAlign: "center",
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 24,
          boxShadow: "var(--shadow-md)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            margin: "0 auto 1rem",
            borderRadius: 18,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            background: "linear-gradient(135deg, var(--sage-300), var(--teal-400))",
          }}
        >
          <Compass size={28} />
        </div>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            marginBottom: 8,
            color: "var(--text-primary)",
          }}
        >
          Sayfa bulunamadı
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "var(--text-secondary)",
            lineHeight: 1.6,
            marginBottom: 24,
          }}
        >
          Aradığın sayfa taşınmış veya hiç var olmamış olabilir. Buradan
          devam edebilirsin.
        </p>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            height: 44,
            padding: "0 20px",
            alignItems: "center",
            background: "linear-gradient(135deg, var(--sage-400), var(--sage-500))",
            color: "#fff",
            fontWeight: 600,
            fontSize: 14,
            borderRadius: 10,
            boxShadow: "var(--shadow-md)",
          }}
        >
          Ana sayfaya dön
        </Link>
      </div>
    </div>
  );
}
