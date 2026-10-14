# 9. Atölye

9. sınıf MEB ders kitapları ve Türkiye Yüzyılı Maarif Modeli konu yapısıyla hazırlanan bağımsız çalışma sitesi. Resmî MEB uygulaması değildir.

## Güncel sürümün kapsamı

0.4.0: MEB çalışma kitabından 51 biyoloji sorusu orijinal görselleri ve basılı 175. sayfadaki resmî cevap anahtarıyla eklendi.

- Matematik 1–2, coğrafya, kimya, biyoloji, fizik, tarih ve Türk dili ve edebiyatı: 7 ders, 8 ders kitabı ve matematik için ek MEB çalışma soruları kaynağı.
- MEB'in program sayfalarından alınmış 30 ünite/tema.
- Sekiz kitabın 2.008 PDF sayfasının dijital metin dizini; sayfa metinleri `ingestion/source-text/` altında sıkıştırılmış `.json.gz` dosyaları olarak tutulur. Bunlar ham kaynak metinleridir, soru olarak kullanılmaz.
- Soru bankasında 331 soru: matematik 146, coğrafya 38, kimya 19, biyoloji 66, fizik 23, tarih 16, edebiyat 23. Yedi dersin 30 ünite/temasının tümünde test açılabilir. Yeni ünitelerde 5–8 soruluk ilk gruplar vardır; bütün kazanımların veya kitap sorularının tamamlandığı anlamına gelmez.
- Matematik: Sayılar 14, Nicelikler ve Değişimler 52, Geometrik Şekiller 14, Eşlik ve Benzerlik 14, Algoritma ve Bilişim 20, İstatistiksel Araştırma Süreci 17, Veriden Olasılığa 15 soru.
- Her test en fazla 15 sorudur. Havuzlar kimliğe göre sabit sıralamayla Test 1, Test 2… olarak bölünür; aynı havuz içindeki testler soru tekrar etmez. Sorular test içinde rastgele sıralanır.
- Ek çalışma kaynağından güncel temalara eşleştirilen 75 soru, orijinal görselleri ve PDF’nin basılı 173. sayfasındaki MEB cevap anahtarıyla birlikte işlendi. Eski ünite numaraları, sitedeki güncel tema numaralarıyla karıştırılmamalıdır.
- Sorular kaynak kitabın etkinliklerinden veya değerlendirme bölümlerinden alınmıştır. Kısaltma, şekli metne dönüştürme, eşleştirmeyi seçenekli soruya çevirme gibi değişiklikler `provenance: adapted` olarak belirtilmiştir.
- Ek çalışma sorularının doğru seçenekleri PDF’deki MEB anahtarıyla karşılaştırılmıştır. Ders kitabından uyarlananların cevapları bağımsız çözüm yoluyla kontrol edilmiştir; EBA anahtarları giriş gerektirdiğinden bu grupta resmî anahtar karşılaştırması yapılmamıştır. Her sorudaki `answerVerification` ve `reviewNote` bu ayrımı belirtir. Açıklamalar MEB’in resmî çözümleri değildir; bazı sorularda çözüm yöntemi/ipucu sunulur.
- 1. ve 2. dönem 1. ve 2. yazılı alanları mevcut, ancak kapsam tablosu ve yazılı soru dosyaları sağlanana kadar kapalıdır.

Bu sürüm kitapların tamamındaki soruları kapsamaz. Açık uçlu, birden fazla doğru cevaplı veya görsel yorumu gerektiren sorular kontrol edilmeden otomatik puanlamaya alınmamalıdır. Öğrenme çıktısıyla eşleştirme, o çıktının tüm becerilerini tek bir testle ölçmek anlamına gelmez.

## Veli raporu

Sonuç ekranında öğrenci adı ve veli adresiyle e-posta taslağı açılabilir. Otomatik gönderim için ayrı Cloudflare Worker + Resend bağlantısı hazırlanmıştır; henüz yapılandırılmadı/yayımlanmadı. Kurulum: `mail-worker/README.md`. API anahtarları GitHub Pages içine konulmaz.

## Çalıştırma

Node.js 22 veya üzeriyle:

```bash
npm test
npm run build
python -m http.server 8000
```

`http://localhost:8000` adresini aç. Kaynak proje modül kullandığından `index.html` dosyasını çift tıklamak yerine HTTP üzerinden aç. Ayrı teslim edilen `atolye9-onizleme.html` dosyası bağımsızdır, çift tıklanarak açılabilir.

## GitHub Pages

1. Bu proje için boş bir GitHub deposu oluştur.
2. Bu dizinin içindeki dosyaları (dizinin kendisini değil) deponun `main` dalına yükle. `.github/workflows/pages.yml` dosyasının da depoya gitmesi gerekir.
3. Depoda **Settings → Pages → Build and deployment → Source → GitHub Actions** seç.
4. Actions sekmesindeki **GitHub Pages** iş akışını çalıştır. Başarıyla tamamlandığında dağıtım adresi GitHub tarafından gösterilir.

İş akışı bağımlılık yüklemeden testleri ve veri paketlemeyi çalıştırır. Yalnızca site dosyaları, `data/` ve `assets/` yayımlanır; ham kitap metinleri dağıtım paketine alınmaz. Depo herkese açıksa depo içindeki kaynak dosyalar da görünür. Çözümler tarayıcıya gelir; bu uygulama çalışma içindir, gizli cevap anahtarlı resmî sınav sistemi değildir.

## Yeni kaynak ve soru ekleme

Kalıcı içerik `data/sources.json`, `data/curriculum.json`, `data/questions.json`, `data/exams.json` dosyalarındadır. JSON dosyalarını düzenledikten sonra `npm run build` çalıştır; bu komut sitenin kullandığı `data/bundle.js` dosyasını günceller.

Sitedeki **Soru bankası** bölümünden kaynak şablonu ve soru şablonu indirilebilir. İçe aktarımlar yalnızca o tarayıcıda çalışır. Herkesin görmesi için güncel soruları ve kaynakları dışa aktar, depodaki JSON dosyalarını değiştir ve paketlemeyi yeniden çalıştır. Dosya yükleme PDF'den otomatik soru çıkarmaz.

Her soru benzersiz `id`, ders/ünite kimliği, konu, MEB öğrenme çıktısı kodu, soru metni, seçenekler, sıfır tabanlı cevap indeksi, açıklama, kaynak kimliği, kitap sayfası, kaynak türü ve `status: verified` alanlarını içerir. `page` basılı kitap sayfasıdır. Kayıtların kimliğini koru: daha önce çözülmüş testlerin soru ve cevapları sonuç kaydında anlık görüntü olarak tutulur.

Görseller `assets/` altında olmalı. Matematik soru görselleri JPEG atlaslarda tutulur ve `imageCrop` alanıyla yalnız ilgili soru gösterilir; atlas koordinatları doğrulanır. Yeni kaynağın kullanımı için gerekli izinleri kontrol et. İçe aktarma yinelenen kimlikleri ve birebir yinelenen soru metinlerini reddeder; farklı biçimde yazılan aynı soru için editoryal kontrol gerekir.

## Raporlama ve kayıt

Doğru, yanlış ve boşlar ayrı sayılır. Başarı = doğru / toplam soru. Konu başına 3 sorudan az varsa “Daha fazla soru çöz”; en az 3 soruda %60'ın altı “Tekrar çalış”, %60–79 “Pekiştir”, %80 ve üzeri “Bu testte başarılı” olarak gösterilir. Bunlar uygulamanın çalışma önerileridir, MEB'in belirlediği eşikler değildir.

Rapor JSON olarak indirilebilir; tarayıcının yazdır ekranından PDF olarak kaydedilebilir. Geçmiş ve eklenen içerikler `localStorage` içinde saklanır; öğrenci hesabı, cihazlar arası eşitleme veya merkezî öğretmen paneli yoktur. Tarayıcı verileri silinirse yerel kayıtlar silinir. Depolama hatasında kullanıcı raporu indirmeye yönlendirilir.

## Kaynak izlenebilirliği

`ingestion/inventory.json`: MEB kaynak/PDF bağlantıları, PDF boyutları, SHA-256 özetleri, sayfa sayıları ve aktarım durumları. Kaynak PDF dosyaları bu pakete konulmamıştır; MEB bağlantıları kullanılır. `data/sources.json` kitap bağlantılarını içerir.

## Doğrulama

`npm test`: puanlama, boş cevap, az soru, konu sıralama, farklı kitapların sayfa referansları ve geçersiz/tekrarlanan soru kayıtlarını sınar. `npm run build`: mevcut bütün soru kayıtlarını ve sınav kapsam referanslarını doğrular. Matematikteki 75 soru görseli kontakt sayfalar üzerinden incelenmiş, kesir üstleri ve şekillerin kırpılmaması kontrol edilmiştir. Canlı tarayıcı arayüzü bu çalışma ortamında test edilmemiştir.
