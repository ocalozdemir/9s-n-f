# Veli e-posta bağlantısı

Bu servis GitHub Pages'ten ayrı yayımlanır. Henüz dağıtılmadı; sitede varsayılan olarak sadece e-posta taslağı açılır.

1. Cloudflare hesabında Worker ve `ocalozdemir.github.io` hostname'ine izin veren Turnstile widget oluşturun.
2. Resend hesabında gönderici alan adını doğrulayın ve yalnız gönderim yetkili API anahtarı oluşturun. Deneme göndericisinin alıcı kısıtları sağlayıcı hesabından kontrol edilmelidir.
3. Worker secret ayarlarına `RESEND_API_KEY`, `TURNSTILE_SECRET`, `MAIL_FROM` ve `PARENT_EMAILS` ekleyin. `PARENT_EMAILS`, kullanılmasına izin verilen veli adreslerinin virgülle ayrılmış listesidir. Bu bilgiler GitHub'a yazılmaz.
4. Bu dizinde Wrangler 4.36+ ile `npx wrangler deploy` çalıştırın. `MAIL_LIMIT` namespace numarasının hesapta başka uygulama ile paylaşılmadığını kontrol edin.
5. Kök `mail-config.js` içindeki `endpoint` değerini `https://WORKER-ADRESI/report`, `sitekey` değerini Turnstile'ın **public** sitekey'i yapın; Pages'i yeniden yayımlayın.
6. Gerçek veli adresiyle bir test raporu gönderin, sağlayıcıda teslim durumunu kontrol edin ve ardından otomatik gönderim seçeneğini etkinleştirin.

API yalnız tanımlanan alıcılara gönderir; Turnstile tokenını sunucuda, hostname ve action ile doğrular. Gönderim sayısı Cloudflare konumu başına alıcı bazında 3/dakika ile sınırlıdır. Aynı raporun tekrarlanan istekleri için Resend idempotency anahtarı kullanılır. Gönderici ve API anahtarı tarayıcıya verilmez. CORS tek başına kimlik doğrulama değildir.

Veli bilgileri tarayıcıda saklanır. Otomatik gönderim ayrı bir seçimdir. Hizmetin raporu kabul etmesi, teslim edildiği anlamına gelmez. Öğrenci raporları tarayıcıdan üretilir; resmî veya değiştirilemez sınav kaydı değildir. Genel kullanıma açılacak bir platformda öğrenci hesabı ve doğrulanmış veli bağlantısı ayrıca kurulmalıdır.

Referanslar: https://resend.com/docs/api-reference/emails/send-email ; https://developers.cloudflare.com/turnstile/get-started/server-side-validation/ ; https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/
