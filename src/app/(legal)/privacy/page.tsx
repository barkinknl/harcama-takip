import type { Metadata } from "next";

export const metadata: Metadata = { title: "Gizlilik Politikası" };

export default function PrivacyPage() {
  return (
    <article>
      <h1>Gizlilik Politikası</h1>
      <p className="lead">Son güncelleme: 8 Mayıs 2026</p>

      <p>
        Harcama Takip (&quot;hizmet&quot;), kişisel finans verilerinizin
        gizliliğini en üst seviyede tutmayı taahhüt eder. Bu politika
        verilerinizin nasıl toplandığını, saklandığını ve kullanıldığını
        açıklar.
      </p>

      <h2>1. Topladığımız bilgiler</h2>
      <ul>
        <li>
          <strong>Hesap bilgileri:</strong> e-posta adresiniz ve isteğe bağlı
          olarak ad-soyadınız.
        </li>
        <li>
          <strong>Finansal kayıtlar:</strong> oluşturduğunuz işlem, kategori,
          ek gelir ve aylık ayar verileri.
        </li>
        <li>
          <strong>Teknik bilgiler:</strong> hizmetin doğru çalışması için
          gereken oturum çerezleri.
        </li>
      </ul>

      <h2>2. Verilerinizi nasıl kullanırız</h2>
      <ul>
        <li>Hesabınızı oluşturmak ve oturumu sürdürmek</li>
        <li>Yalnızca size ait dashboard, grafik ve içgörüleri üretmek</li>
        <li>Yasal yükümlülükleri yerine getirmek (KVKK / GDPR)</li>
      </ul>
      <p>
        <strong>Verileriniz hiçbir şekilde reklam amaçlı kullanılmaz, üçüncü
        taraflara satılmaz.</strong>
      </p>

      <h2>3. Veri saklama</h2>
      <p>
        Verileriniz Supabase üzerinde, oturum başına izolasyon (RLS) ve
        şifreli aktarım (TLS) ile korunarak saklanır. Yedeklemeler periyodik
        olarak alınır.
      </p>

      <h2>4. Haklarınız</h2>
      <ul>
        <li>
          <strong>Erişim:</strong> İstediğiniz zaman tüm verinizi JSON olarak
          indirebilirsiniz (Ayarlar &rarr; Verilerim).
        </li>
        <li>
          <strong>Silme:</strong> Verilerinizi tek tıkla silebilirsiniz.
        </li>
        <li>
          <strong>Düzeltme:</strong> Tüm kayıtlarınız üzerinde tam yönetim
          hakkına sahipsiniz.
        </li>
      </ul>

      <h2>5. İletişim</h2>
      <p>
        Gizlilikle ilgili herhangi bir sorunuz olursa bize{" "}
        <a href="mailto:privacy@harcamatakip.app">privacy@harcamatakip.app</a>{" "}
        adresinden ulaşabilirsiniz.
      </p>
    </article>
  );
}
