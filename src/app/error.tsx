"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

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
          maxWidth: 480,
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
            background: "linear-gradient(135deg, #ee9a92, #cd5848)",
          }}
        >
          <AlertTriangle size={28} />
        </div>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            marginBottom: 8,
            color: "var(--text-primary)",
          }}
        >
          Bir şeyler yanlış gitti
        </h1>
        <p
          style={{
            fontSize: 13,
            color: "var(--text-secondary)",
            lineHeight: 1.6,
            marginBottom: 8,
          }}
        >
          Beklenmeyen bir hata oluştu. Tekrar denemek istersen aşağıdaki
          butona basabilirsin. Sorun devam ederse lütfen bize bildir.
        </p>
        {error.digest && (
          <p
            style={{
              fontSize: 11,
              color: "var(--text-tertiary)",
              fontFamily: "ui-monospace, SFMono-Regular, monospace",
              marginBottom: 24,
            }}
          >
            ID: {error.digest}
          </p>
        )}
        <button
          type="button"
          onClick={reset}
          style={{
            display: "inline-flex",
            height: 44,
            padding: "0 20px",
            alignItems: "center",
            gap: 8,
            background: "linear-gradient(135deg, var(--sage-400), var(--sage-500))",
            color: "#fff",
            fontWeight: 600,
            fontSize: 14,
            borderRadius: 10,
            border: "none",
            boxShadow: "var(--shadow-md)",
            cursor: "pointer",
          }}
        >
          <RotateCw size={14} strokeWidth={2.4} />
          Tekrar Dene
        </button>
      </div>
    </div>
  );
}
