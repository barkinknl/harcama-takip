export type TransactionType = "income" | "expense";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
  is_default: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: TransactionType;
  category_id: string;
  date: string;
  description: string | null;
  is_recurring: boolean;
  recurring_day: number | null;
  /** YYYY-MM formatlı ay anahtarı; ay-bazlı sorgular için */
  month_key: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionWithCategory extends Transaction {
  category: Category | null;
}

/**
 * Excel'deki "Other Earnings" tablosuna karşılık gelir.
 * Standart işlem akışından bağımsız, ek/sürpriz gelirler.
 */
export interface OtherEarning {
  id: string;
  user_id: string;
  month_key: string;
  date: string;
  amount: number;
  description: string | null;
  created_at: string;
}

/**
 * Aylık planlama / yapılandırma.
 * Excel'deki üst paneldeki INCOME, LAST MONTH'S DEBIT, NEXT PAY değerleri.
 */
export interface MonthlySettings {
  id: string;
  user_id: string;
  /** YYYY-MM */
  month_key: string;
  /** Beklenen aylık gelir (maaş vb.) */
  income: number;
  /** Geçen aydan devreden borç */
  last_month_debit: number;
  /** Bir sonraki maaş tarihi (ISO) */
  next_pay_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Excel'deki sol üst panelin tüm hesaplanmış değerleri.
 */
export interface MonthlySummaryData {
  income: number;
  last_month_debit: number;
  /** = income - last_month_debit */
  this_month_balance: number;
  /** = this_month_balance + other_earnings_total - total_expense */
  left_to_spend: number;
  next_pay_date: string | null;
  days_left_for_next_pay: number | null;
  total_expenditure: number;
  total_earnings: number;
  /** = total_earnings - total_expenditure */
  final_balance: number;
}

export interface CategorySummary {
  category_id: string;
  category_name: string;
  category_color: string;
  category_icon: string;
  total: number;
  percentage: number;
  count: number;
}

export interface DateRange {
  from: string;
  to: string;
}

export const MONTH_KEYS = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
] as const;

export const MONTH_NAMES_TR = [
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
] as const;

export const MONTH_SHORT_TR = [
  "Oca",
  "Şub",
  "Mar",
  "Nis",
  "May",
  "Haz",
  "Tem",
  "Ağu",
  "Eyl",
  "Eki",
  "Kas",
  "Ara",
] as const;

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, "created_at" | "updated_at">;
        Update: Partial<Omit<UserProfile, "id" | "created_at">>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, "id" | "created_at">;
        Update: Partial<Omit<Category, "id" | "user_id" | "created_at">>;
      };
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, "id" | "month_key" | "created_at" | "updated_at">;
        Update: Partial<
          Omit<Transaction, "id" | "user_id" | "created_at" | "updated_at">
        >;
      };
      other_earnings: {
        Row: OtherEarning;
        Insert: Omit<OtherEarning, "id" | "month_key" | "created_at">;
        Update: Partial<
          Omit<OtherEarning, "id" | "user_id" | "created_at">
        >;
      };
      monthly_settings: {
        Row: MonthlySettings;
        Insert: Omit<MonthlySettings, "id" | "created_at" | "updated_at">;
        Update: Partial<
          Omit<MonthlySettings, "id" | "user_id" | "created_at" | "updated_at">
        >;
      };
    };
  };
}
