export default function Loading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: "3px solid var(--border-strong)",
          borderTopColor: "var(--sage-500)",
          animation: "spin 0.8s linear infinite",
        }}
        aria-label="Yükleniyor"
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
