/**
 * Legal texts shown in the auth modals. Each entry is a list of paragraphs.
 * A paragraph starting with "# " is rendered as a bold heading.
 *
 * DRAFT: these texts are a working draft written from how this application
 * actually behaves. Bracketed items ([...]) must be filled in with the real
 * company details, and the final text should be reviewed by counsel before
 * launch.
 */
export const LEGAL_TEXTS = {
  terms: {
    title: "Kullanıcı Sözleşmesi",
    paragraphs: [
      "Bu sözleşme, [Şirket Unvanı] (\"Şirket\") ile Ultima FX uygulaması ve internet sitesini (\"Platform\") kullanan kişi (\"Kullanıcı\") arasında kurulmuştur. Hesap açarak veya Platform'u kullanarak bu sözleşmeyi kabul etmiş olursunuz.",

      "# 1. Taraflar ve Kapsam",
      "Şirket, [MERSİS No] numaralı, [Adres] adresinde faaliyet gösteren bir şirkettir. Bu sözleşme, Platform'da sunulan hesap, piyasa verisi, portföy takibi ve işlem özelliklerinin kullanımını düzenler.",

      "# 2. Hesap Açma ve Kimlik Doğrulama",
      "Hesap açarken T.C. Kimlik numarası, telefon numarası, ad soyad ve şifre bilgileri istenir. Bu bilgilerin doğru ve güncel olması Kullanıcı'nın sorumluluğundadır. Her T.C. Kimlik numarası ve telefon numarası yalnızca bir hesapla ilişkilendirilebilir. Hesap bilgilerinizi üçüncü kişilerle paylaşmamanız, şifrenizi güvenli tutmanız gerekir. Hesabınız üzerinden yapılan tüm işlemler Kullanıcı'nın işlemi kabul edildiği anlamına gelir.",

      "# 3. Platformun Niteliği ve İşlemler",
      "Platform üzerindeki alım ve satım işlemleri, Şirket'in kendi iç kayıt sisteminde gerçekleşir; emirler gerçek bir borsaya, aracı kuruma veya başka bir piyasaya iletilmez. Platform'da gösterilen fiyatlar üçüncü taraf veri kaynaklarından alınır ve her zaman gerçek piyasa fiyatı olmayabilir; veri kaynağının gecikmeli veya eksik olabileceği, veri alanlarında her zaman doğrulanmış bilgi bulunmayabileceği Kullanıcı tarafından kabul edilir. Bu nedenle Platform'daki fiyat ve işlem sonuçları resmi kayıt niteliği taşımaz.",

      "# 4. Yatırım Tavsiyesi Değildir",
      "Platform'da yer alan haberler, grafikler, istatistikler ve piyasa verileri yalnızca bilgilendirme amaçlıdır; yatırım danışmanlığı, öneri veya tavsiye niteliği taşımaz. Finansal araçlar değer kaybedebilir ve yatırdığınız tutarın tamamını kaybedebilirsiniz. Her yatırım kararının sorumluluğu Kullanıcı'ya aittir.",

      "# 5. Halka Arz, Fon ve Haberler",
      "Platform'da yayımlanan halka arz, yatırım fonu ve haber içerikleri üçüncü kaynaklardan derlenebilir veya Şirket tarafından yayımlanabilir. Bu içeriklerin doğruluğu, güncelliği ve eksiksizliği garanti edilmez. Halka arz ve fon bilgileri, ilgili kuruluşların resmi açıklamalarının yerini tutmaz.",

      "# 6. Kullanıcı Yükümlülükleri",
      "Kullanıcı; Platform'u yasalara ve bu sözleşmeye uygun kullanacağını, hesabını başkasının kullanımına açmayacağını, Platform'un işleyişini bozacak, veri kaynaklarına zarar verecek veya otomatik yollarla aşırı yük oluşturacak girişimlerde bulunmayacağını kabul eder.",

      "# 7. Fikri Mülkiyet",
      "Platform'un yazılımı, tasarımı, markası ve içeriği Şirket'e veya lisans verenlere aittir. Kullanıcı, bu içerikleri Şirket'in yazılı izni olmadan kopyalayamaz, çoğaltamaz veya ticari amaçla kullanamaz.",

      "# 8. Sorumluluğun Sınırlandırılması",
      "Şirket, veri kaynaklarının kesintisinden, gecikmesinden veya hatalarından; Platform'un geçici olarak erişilemez olmasından; ve Kullanıcı'nın kendi yatırım kararlarından doğan doğrudan veya dolaylı zararlardan, yürürlükteki mevzuatın izin verdiği ölçüde sorumlu değildir.",

      "# 9. Hesabın Kapatılması",
      "Kullanıcı hesabını dilediği zaman kapatabilir. Şirket, bu sözleşmenin ihlali, dolandırıcılık şüphesi veya yasal bir zorunluluk halinde hesabı askıya alabilir veya kapatabilir. Hesap kapatıldığında, saklama yükümlülüğü bulunan kayıtlar yasal süre boyunca saklanır.",

      "# 10. Değişiklikler",
      "Şirket bu sözleşmeyi güncelleyebilir. Önemli değişiklikler Platform üzerinden duyurulur. Değişikliklerden sonra Platform'u kullanmaya devam etmeniz, güncel sözleşmeyi kabul ettiğiniz anlamına gelir.",

      "# 11. Uygulanacak Hukuk ve Yetki",
      "Bu sözleşme Türkiye Cumhuriyeti hukukuna tabidir. Doğacak uyuşmazlıklarda [İstanbul] Mahkemeleri ve İcra Daireleri yetkilidir.",

      "# 12. İletişim",
      "Sözleşmeyle ilgili sorularınız için: [e-posta adresi], [KEP adresi], [posta adresi].",
    ],
  },
  kvkk: {
    title: "KVKK Aydınlatma Metni",
    paragraphs: [
      "Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu'nun 10. maddesi uyarınca hazırlanmıştır. Veri sorumlusu [Şirket Unvanı]'dır.",

      "# 1. İşlenen Kişisel Veriler",
      "Ad soyad, T.C. Kimlik numarası, telefon numarası, şifreniz (yalnızca şifreli özet olarak), kullanıcı işlem kayıtları (emirler, portföy ve cüzdan hareketleri), oturum ve güvenlik kayıtları (IP adresi, cihaz ve tarayıcı bilgisi, giriş zamanları) ile destek talepleriniz işlenir.",

      "# 2. İşleme Amaçları",
      "Hesap açılması ve kimlik doğrulaması; giriş ve oturum güvenliği; işlem ve portföy hizmetlerinin sunulması; yasal saklama ve raporlama yükümlülüklerinin yerine getirilmesi; dolandırıcılık ve kötüye kullanımın önlenmesi; müşteri destek hizmetlerinin yürütülmesi amaçlarıyla işlenir.",

      "# 3. Hukuki Sebepler",
      "Veriler; sözleşmenin kurulması ve ifası, yasal yükümlülüklerin yerine getirilmesi, Şirket'in meşru menfaatleri (güvenlik ve dolandırıcılığın önlenmesi) ve gerektiğinde açık rızanız hukuki sebeplerine dayanılarak işlenir. T.C. Kimlik numaranız, kayıt sırasında kimlik tespiti için alınır ve güvenlik amacıyla şifrelenmiş biçimde saklanır.",

      "# 4. Aktarım",
      "Kişisel verileriniz; hizmetin yürütülmesi için sınırlı olarak altyapı ve bulut hizmet sağlayıcılarına, yetkili kamu kurum ve kuruluşlarına, yasal zorunluluk hallerinde yetkili mercilere aktarılabilir. Veriler yurt dışına, KVKK'nın yurt dışına aktarım hükümlerine uygun olarak aktarılabilir.",

      "# 5. Saklama Süresi",
      "Veriler, işleme amacının gerektirdiği süre ve ilgili mevzuatta öngörülen saklama süreleri boyunca saklanır; süre sonunda silinir, yok edilir veya anonim hale getirilir.",

      "# 6. Haklarınız",
      "KVKK'nın 11. maddesi uyarınca; kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme, işleme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme, yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme, eksik veya yanlış işlenmişse düzeltilmesini isteme, silinmesini veya yok edilmesini isteme, bu işlemlerin aktarıldığı üçüncü kişilere bildirilmesini isteme, münhasıran otomatik sistemler ile analiz edilmesi sonucu aleyhinize bir sonuç çıkmasına itiraz etme ve kanuna aykırı işlenmesi nedeniyle zarara uğramanız halinde zararın giderilmesini talep etme haklarına sahipsiniz.",

      "# 7. Başvuru",
      "Haklarınızı kullanmak için [e-posta adresi] veya [KEP adresi] üzerinden ya da [posta adresi] adresine yazılı olarak başvurabilirsiniz. Başvurular en geç 30 gün içinde yanıtlanır.",
    ],
  },
  privacy: {
    title: "Gizlilik Politikası",
    paragraphs: ["Gizlilik politikası metni henüz eklenmedi."],
  },
} as const;

export type LegalKey = keyof typeof LEGAL_TEXTS;
