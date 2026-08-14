# HealthCouncil Desktop — Plan v3.0 Product Map

Bu belge, nihai birleşik proje planındaki ürün yüzeylerinin masaüstü uygulamasındaki karşılığını ve çalışma düzeyini kaydeder.

## Birleşik ürün yüzeyi

| Plan modülü | Uygulamadaki karşılığı | Mevcut çalışma düzeyi |
| --- | --- | --- |
| Onboarding | Dört adımlı güvenlik, yerel veri, provider ve ilk profil akışı | Etkileşimli ürün akışı |
| Health Inbox | Günlük görevler, kritik inceleme, aktif vaka ve takip kartları | Etkileşimli ürün akışı |
| Health Passport | Demografi, durumlar, alerji, ameliyat, aile öyküsü ve trust katmanları | Sentetik Patient State v31 |
| Documents | Yerel yükleme, OCR pipeline, arşiv ve provenance özeti | Pipeline arayüzü; sentetik işleme |
| Review Inbox | Çelişki, belirsizlik, kaynak karşılaştırma ve insan kararı | Etkileşimli ve geri alınabilir demo state |
| Timeline | Belirti, laboratuvar, ilaç, görüşme ve belge olayları | Filtrelenebilir sentetik event store |
| Labs | Bazal, trend, delta-check, birim ve formül açıklaması | Deterministik çekirdek + sentetik UI verisi |
| Medications | Aktif/geçmiş ilaçlar, uyum ve etkileşim uyarısı | Etkileşimli ürün yüzeyi |
| Cases & Chat | Safety Review, ön sorular ve vaka durum makinesi | Etkileşimli vaka prototipi |
| Research | Kanıt katmanları, kaynak kartları ve research manifest | Kaynaklı sentetik araştırma paketi |
| Auto Council | Gemini, GPT, Claude ve Safety Judge rolleri | Konsey orkestrasyonu ürün yüzeyi |
| Probabilities | Differential matrix, Tip A uyarısı ve must-not-miss alanı | Kalibrasyon uyarılı sentetik tahmin |
| Reports | Doktor özeti, kaynak eki ve Analysis Manifest | Etkileşimli rapor önizlemesi |
| Outcomes | Hekim sonucu, test ve takip geri bildirimi | Outcome capture ürün yüzeyi |
| Treatment / Nutrition / What-if | Capability-gated gelişmiş modüller | Güvenlik kapıları nedeniyle kilitli |
| Provider Connections | OpenAI API, ChatGPT, Anthropic API, Claude, Gemini API/hesap, DeepSeek, xAI, Kimi ve yerel AI | Bağlantı ve Privacy Preview ürün yüzeyi |

## Korunan güvenlik ilkeleri

- Uygulamanın kalıcı alt bandında tanı koymama ve acil durum sınırı görünür.
- API ile abonelik/hesap bağlantıları birbirinden ayrı gösterilir.
- Ham belge ve kimlik verisi sağlayıcıya varsayılan olarak gönderilmez.
- Kritik sağlık gerçekleri insan onayı olmadan Health Passport'a yazılmaz.
- Çelişkili değerler sessizce birleştirilmez; ilgili hesaplama kapatılır.
- Hastalık yüzdeleri kalibre edilmiş klinik olasılık gibi sunulmaz.
- Düşük yüzdeli fakat yüksek riskli durumlar ayrı must-not-miss alanında tutulur.
- Treatment, Nutrition ve What-if modülleri release/capability gate açılmadan klinik talimat üretmez.

## Uygulama sınırı

Bu sürüm, planın tamamını tek Windows uygulamasında gezilebilir ve yüksek doğruluklu ürün yüzeyi olarak birleştirir. Gerçek OCR, gerçek sağlayıcı çağrıları, klinik kaynak lisanslama, dış denetim, kalibrasyon çalışmaları ve regülasyon kapıları tamamlanmış gibi gösterilmez; bu operasyonlar açıkça sentetik, yapılandırılabilir veya kilitli durumdadır.
