import type { Metadata } from "next";

export const metadata: Metadata = { title: "Kullanım Koşulları" };

export default function TermsPage() {
  return (
    <article>
      <h1>Kullanım Koşulları</h1>
      <p className="lead">Son güncelleme: 8 Mayıs 2026</p>

      <p>
        Harcama Takip&apos;i kullanarak aşağıdaki koşulları kabul etmiş
        olursunuz. Lütfen dikkatle okuyun.
      </p>

      <h2>1. Hizmetin tanımı</h2>
      <p>
        Harcama Takip, kişisel gelir-gider takibi yapmanıza ve finansal
        farkındalığınızı artırmanıza yardımcı olan bir web uygulamasıdır.{" "}
        <strong>
          Yatırım danışmanlığı, kredi tavsiyesi veya yasal mali danışmanlık
          sağlamaz.
        </strong>
      </p>

      <h2>2. Hesabınız</h2>
      <ul>
        <li>Tek bir kişiye ait olmak üzere açılır.</li>
        <li>Şifrenizin gizliliğinden siz sorumlusunuz.</li>
        <li>
          Yetkisiz erişim fark ederseniz hemen şifrenizi değiştirin ve bize
          bildirin.
        </li>
      </ul>

      <h2>3. Kullanım kuralları</h2>
      <ul>
        <li>Hizmeti yasalara aykırı şekilde kullanmamayı kabul edersiniz.</li>
        <li>
          Sistemi otomatik araçlarla aşırı yüklemek, güvenliği zorlamak veya
          başka kullanıcıların verilerine ulaşmaya çalışmak yasaktır.
        </li>
      </ul>

      <h2>4. Sorumluluk reddi</h2>
      <p>
        Hizmet &quot;olduğu gibi&quot; sunulur. Verilerin doğruluğu konusunda
        en yüksek özen gösterilse de, kullanıcı kararlarınızdan doğacak mali
        sonuçlardan Harcama Takip sorumlu tutulamaz.
      </p>

      <h2>5. Hizmette değişiklikler</h2>
      <p>
        Önceden haber vererek özellik ekleme, kaldırma veya değiştirme
        hakkımız saklıdır. Önemli değişiklikler e-posta ile bildirilir.
      </p>

      <h2>6. Hesap kapatma</h2>
      <p>
        Dilediğiniz zaman ayarlardan tüm verilerinizi silebilirsiniz. Hizmeti
        kötüye kullanan hesapları kapatma hakkımız saklıdır.
      </p>

      <h2>7. İletişim</h2>
      <p>
        Sorularınız için{" "}
        <a href="mailto:hello@harcamatakip.app">hello@harcamatakip.app</a>.
      </p>
    </article>
  );
}
