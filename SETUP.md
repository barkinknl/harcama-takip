# Harcama Takip — Kurulum Rehberi

Bu doküman, projeyi kendi Supabase hesabınla canlı çalışır hale getirmen için
tüm adımları içerir.

## 1. Supabase projesi oluştur

1. <https://supabase.com/dashboard> adresinde ücretsiz hesap aç (yoksa).
2. **New Project** → bir isim, güçlü bir DB şifresi, en yakın bölge (örn.
   `eu-central-1` Frankfurt) seç. ~1-2 dakika sürer.
3. Proje açıldıktan sonra **Settings → API** menüsünden iki değeri kopyala:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` anahtar → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2. Şemayı yükle

1. Supabase dashboard'unda **SQL Editor** sekmesine git.
2. Bu repodaki `supabase/migrations/0001_init.sql` dosyasının tüm içeriğini
   kopyala, editöre yapıştır, **Run** bas.
3. Tablolar oluştu mu diye **Database → Tables** sekmesinden kontrol et.
   Görmen gerekenler: `profiles`, `categories`, `transactions`,
   `other_earnings`, `monthly_settings`.

## 3. Auth ayarları

Supabase dashboard → **Authentication → URL Configuration**:

- **Site URL** → projenin domain'i (yerelde `http://localhost:3000`,
  prod'da `https://yourdomain.com`).
- **Redirect URLs** → şu URL'leri ekle:
  - `http://localhost:3000/auth/callback`
  - `https://yourdomain.com/auth/callback`

**Email Templates** (opsiyonel ama önerilir): Authentication → Email Templates
altındaki "Confirm signup" ve "Reset password" e-postalarındaki linkleri
`{{ .SiteURL }}/auth/callback?next=/` formatına uyumlu olacak şekilde
özelleştir.

Geliştirme için "Confirm email" özelliğini kapatabilirsin (Authentication →
Providers → Email → Confirm email = off). Production'da açık olsun.

## 4. Lokal env

`.env.local` dosyasını oluştur (`.env.local.example`'i kopyala):

```bash
cp .env.local.example .env.local
```

İçine Supabase'den aldığın iki değeri yapıştır:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

## 5. Çalıştır

```bash
npm install
npm run dev
```

<http://localhost:3000> adresinde aç:

- `/sign-up` → ilk hesabını oluştur
- e-postanı doğrula (Supabase'de Confirm email kapalıysa atla)
- `/sign-in` → giriş yap
- Boş dashboard'da "Örnek Veriyle Başla" tuşuyla bir test seti yükleyebilirsin

## 6. Production deploy (Vercel önerilir)

1. <https://vercel.com> hesabı aç, repo'yu içe aktar (GitHub'a push edip
   bağlamak en basit yol).
2. **Environment Variables** kısmına aynı iki değişkeni ekle:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy. Vercel'in verdiği URL'i Supabase'de **Authentication → URL
   Configuration** kısmındaki **Site URL** ve **Redirect URLs** bölümüne
   ekle. Aksi halde e-posta doğrulama linkleri çalışmaz.

## Veri modeli kısaca

| Tablo | Amaç |
|---|---|
| `profiles` | Kullanıcı profili (auth.users'a 1-1 bağlı) |
| `categories` | Gelir/gider kategorileri |
| `transactions` | İşlemler (gelir + gider) |
| `other_earnings` | Maaş dışı ek gelirler — Excel'deki "Other Earnings" |
| `monthly_settings` | Aylık gelir, devir borcu, sonraki maaş tarihi |

Her tabloda **Row Level Security (RLS)** aktif — kullanıcı sadece kendi
verisini görür/değiştirir.

`carry_over_to_next_month(user_id, source_month)` fonksiyonu, ay sonunda eksiye
düşen bakiyeyi bir sonraki ayın `last_month_debit` alanına otomatik aktarır.
İleride bunu Supabase Cron Job veya bir Edge Function ile otomatik
tetikleyebilirsin.

## v2 yol haritası

V1 kapsamı dışında bıraktıklarımız (gerçek kullanıcı feedback'iyle
önceliklendirilecek):

- Hedefler / kumbara (savings goals)
- Otomatik abonelik tespiti (manuel flag mevcut)
- LLM tabanlı içgörüler (deterministik içgörüler şu an aktif)
- PLANLAMA sekmesi (zero-based budgeting)
- CSV import / banka ekstresi yapıştırma
- Receipt OCR
- Sesle ekleme
- Çoklu para birimi (DB hazır, UI sınırlı)
- Çiftler için ortak bütçe
- PWA ikon + offline cache
