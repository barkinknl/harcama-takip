import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Harcama Takip — Bireysel Finans Yönetimi",
    template: "%s · Harcama Takip",
  },
  description:
    "Gelirlerinizi ve giderlerinizi takip edin, kategorilere ayırın ve harcama alışkanlıklarınızı şık grafiklerle analiz edin.",
  applicationName: "Harcama Takip",
  authors: [{ name: "Harcama Takip" }],
  keywords: [
    "harcama takip",
    "bütçe",
    "finans",
    "gider takibi",
    "kişisel finans",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0b14" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var m=window.matchMedia('(prefers-color-scheme: dark)').matches;var theme=t||(m?'dark':'light');document.documentElement.setAttribute('data-theme',theme);}catch(e){}})();`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
