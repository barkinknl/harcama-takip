const CURRENCY_SYMBOLS: Record<string, string> = {
  TRY: "₺",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

/** Sembolsüz, "65.000,00" formatı (TR stili, SSR-güvenli, manuel) */
export function formatAmount(value: number): string {
  const negative = value < 0;
  const abs = Math.abs(value);
  const fixed = abs.toFixed(2);
  const [intPart, decPart] = fixed.split(".");
  const withThousand = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${negative ? "-" : ""}${withThousand},${decPart}`;
}

/** "₺65.000,00" — Excel'deki "0,00 TRY" formatına yakın, SSR-güvenli */
export function formatCurrency(value: number, currency = "TRY"): string {
  const symbol = CURRENCY_SYMBOLS[currency.toUpperCase()] ?? "";
  const amount = formatAmount(value);
  return symbol ? `${symbol}${amount}` : `${amount} ${currency}`;
}

/** "01.06" formatı — Excel'deki tarih hücresi */
export function formatDayMonth(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${day}.${month}`;
}

const TR_MONTHS = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

/** "8 Mayıs 2026" gibi okunaklı format */
export function formatLongDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getUTCDate()} ${TR_MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** "30.06.2026" — Excel'deki tarih formatı */
export function formatDottedDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}.${month}.${year}`;
}

/** YYYY-MM ay anahtarı (Date veya string) */
export function toMonthKey(date: Date | string = new Date()): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/** YYYY-MM → { year, month (1-12) } */
export function parseMonthKey(monthKey: string): {
  year: number;
  month: number;
} {
  const [y, m] = monthKey.split("-").map(Number);
  return { year: y, month: m };
}

/** İki ISO tarih arasındaki gün farkı (negatif olabilir) */
export function daysBetween(fromIso: string, toIso: string): number {
  const a = new Date(fromIso);
  const b = new Date(toIso);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 0;
  const ms = b.getTime() - a.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}
