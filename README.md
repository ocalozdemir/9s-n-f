# 9. Atölye

9. sınıf MEB ders kitapları ve Türkiye Yüzyılı Maarif Modeli konu yapısıyla hazırlanan bağımsız çalışma sitesi. Resmî MEB uygulaması değildir.

## İlk sürümün kapsamı

- Matematik 1–2, coğrafya, kimya, biyoloji, fizik, tarih ve Türk dili ve edebiyatı: 7 ders, 8 kaynak kitap.
- MEB'in program sayfalarından alınmış 30 ünite/tema.
- Sekiz kitabın 2.008 PDF sayfasının dijital metin dizini; sayfa metinleri `ingestion/source-text/` altında sıkıştırılmış `.json.gz` dosyaları olarak tutulur. Bunlar ham kaynak metinleridir, soru olarak kullanılmaz.
- İlk soru bankasında 36 soru: matematik 5, coğrafya 8, kimya 6, biyoloji 7, fizik 5, tarih 2, edebiyat 3.
- Sorular kaynak kitabın etkinliklerinden veya değerlendirme bölümlerinden alınmıştır. Kısaltma, şekli metne dönüştürme, eşleştirmeyi seçenekli soruya çevirme gibi değişiklikler `provenance: adapted` olarak belirtilmiştir.
- Cevaplar kitap içeriği ve çözüm yoluyla kontrol edilmiştir. Kitaplardaki EBA cevap anahtarı bağlantıları oturum açmayı gerektirdiğinden resmî anahtarla karşılaştırılmamıştır. Açıklamalar MEB'in resmî çözümleri değildir.
- 1. ve 2. dönem 1. ve 2. yazılı alanları mevcut, ancak kapsam tablosu ve yazılı soru dosyaları sağlanana kadar kapalıdır.

Bu sürüm kitapların tamamındaki soruları kapsamaz. Açık uçlu, birden fazla doğru cevaplı veya görsel yorumu gerektiren sorular kontrol edilmeden otomatik puanlamaya alınmamalıdır. Öğrenme çıktısıyla eşleştirme, o çıktının tüm becerilerini tek bir testle ölçmek anlamına gelmez.

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

Görseller `assets/` altında olmalı. Yeni kaynağın kullanımı için gerekli izinleri kontrol et. İçe aktarma yinelenen kimlikleri ve birebir yinelenen soru metinlerini reddeder; farklı biçimde yazılan aynı soru için editoryal kontrol gerekir.

## Raporlama ve kayıt

Doğru, yanlış ve boşlar ayrı sayılır. Başarı = doğru / toplam soru. Konu başına 3 sorudan az varsa “Daha fazla soru çöz”; en az 3 soruda %60'ın altı “Tekrar çalış”, %60–79 “Pekiştir”, %80 ve üzeri “Bu testte başarılı” olarak gösterilir. Bunlar uygulamanın çalışma önerileridir, MEB'in belirlediği eşikler değildir.

Rapor JSON olarak indirilebilir; tarayıcının yazdır ekranından PDF olarak kaydedilebilir. Geçmiş ve eklenen içerikler `localStorage` içinde saklanır; öğrenci hesabı, cihazlar arası eşitleme veya merkezî öğretmen paneli yoktur. Tarayıcı verileri silinirse yerel kayıtlar silinir. Depolama hatasında kullanıcı raporu indirmeye yönlendirilir.

## Kaynak izlenebilirliği

`ingestion/inventory.json`: MEB kaynak/PDF bağlantıları, PDF boyutları, SHA-256 özetleri, sayfa sayıları ve aktarım durumları. Kaynak PDF dosyaları bu pakete konulmamıştır; MEB bağlantıları kullanılır. `data/sources.json` kitap bağlantılarını içerir.

## Doğrulama

`npm test`: puanlama, boş cevap, az soru, konu sıralama, farklı kitapların sayfa referansları ve geçersiz/tekrarlanan soru kayıtlarını sınar. `npm run build`: mevcut bütün soru kayıtlarını ve sınav kapsam referanslarını doğrular. Tarayıcıda görsel kontrol bu çalışma ortamında yapılmamıştır.
