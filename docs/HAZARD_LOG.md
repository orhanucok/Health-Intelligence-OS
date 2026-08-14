# HealthCouncil Desktop — Tehlike Kaydı (Hazard Log) v0.1

Durum: yaşayan mühendislik artefaktı (ISO 14971 tarzı tehlike kaydı)
Kapsam: `MASTER_PLAN.md` ve `CLINICAL_SAFETY_REVIEW.md` ile tutarlı; hedef bağlam
kontrollü beta (yetişkin 18+, gebe değil, kendi Türkçe kayıtları, klinisyen denetimli).
Veri politikası: yalnızca sentetik veya geri döndürülemez şekilde kimliksizleştirilmiş veri.

> Bu kayıt bir tasarım kısıtıdır, prosa değildir. Her satır izlenebilir bir mühendislik
> maddesidir. "Mevcut kontroller" sütunu **yalnızca depodaki kodun kanıtladığı** kontrolleri
> listeler; tasarım niyeti olup kodda karşılığı olmayan her şey "Eksik kontroller"e yazılır.

---

## 0. Genel varsayımlar ve üst düzey azaltıcı

**A0 — Mevcut yapı sentetik-yalnız, yetenek-kapılı, beta öncesi bir dikey dilimdir.**
Gerçek hasta, bulut sağlayıcı çağrısı, model muhakemesi, kanıt hattı, ilaç/alerji motoru,
konsey ve olasılık motoru **kodda yoktur**. Gerçek-hasta zararının bugünkü olasılığını
düşüren tek üst düzey kontrol budur; bir yetenek açıldığında ilgili tehlikenin olasılığı
yeniden değerlendirilmelidir. Aşağıdaki şiddet ve olasılık değerleri **hedef kontrollü-beta
bağlamında, mevcut kontrollerle** kalıcı (rezidüel) riski ifade eder — yani "bu yetenek
bugünkü kontrollerle sahaya çıksaydı" varsayımıyla. Bu nedenle çoğu satırın durumu
"AÇIK — sürüm engelleyici"dir.

### Şiddet ölçeği (S)
- S5 Katastrofik: ölüm veya kalıcı ciddi hasar; kritik/acil bakımın gecikmesi.
- S4 Kritik: ciddi ama geri döndürülebilir zarar; önemli yanlış yönlendirme, gizlilik ihlali.
- S3 Ciddi: orta düzey zarar; gereksiz tetkik/işlem, önemli kaygı, geri kazanılabilir veri kaybı.
- S2 Marjinal: küçük, geçici zarar.
- S1 Önemsiz: kayda değer klinik etki yok.

### Olasılık ölçeği (L) — mevcut kontrollerle
- L5 Sık, L4 Olası, L3 Ara sıra, L2 Uzak, L1 İhtimal dışı.

### Risk bandı (S × L)
- **Yüksek** = kabul edilemez; sürüm engelleyici, kontrol + otomatik test zorunlu.
- **Orta** = ALARP; azaltılmalı, kalıcı risk gerekçelendirilmeli.
- **Düşük** = kabul edilebilir; izlenir.

### Sürüm kapıları (MASTER_PLAN §28)
G1 Amaçlanan kullanım/mevzuat · G2 Kritik çıkarım+dedup · G3 Güvenlik & yanlış güven ·
G4 Kanıt/atıf/lisans · G5 Olasılık etiketleme & kalibrasyon · G6 Gizlilik/güvenlik/kurtarma ·
G7 Masaüstü güvenilirlik · G8 Model/prompt/politika/şema regresyonu.

### Sahip rolleri (AGENTS.md)
`clinical_safety` (Klinik Güvenlik) · `sol_reviewer` (Mimari/İnceleme) ·
`terra_researcher` (Kanıt/Araştırma) · `luna_worker` (Uygulama) · Platform/Gizlilik sahibi.

---

## 1. Tehlike kayıtları

### HZ-001 — Hasta karışması (yanlış kişinin verisi)
- **Tehlike:** Bir belgeden çıkarılan gözlemler yanlış hasta profiline bağlanır veya iki
  kişinin verisi tek profilde birleşir.
- **Başlatıcı neden:** Çok-hasta kimlik modeli yok; belge→hasta bağı ve kimlik çözümleme
  yok. Aynı cihazda birden çok kişinin belgesi (ör. aile üyesi) ayırt edilmez.
- **Öngörülebilir dizi:** İçe aktarım → hasta bağlama adımı olmadan tek profile yazım →
  başka kişinin ferritin/CRP değeri "hasta durumu"na girer → rapor yanlış kişiye ait
  bulguyla üretilir.
- **Zarar:** Yanlış kişiye ait bulguyla yanlış klinik yönlendirme; gizlilik ihlali. **S5.**
- **Olasılık:** L3 (beta niyeti "yalnızca kendi kayıtları" ama teknik giriş kapısı yok).
- **Risk: YÜKSEK.**
- **Mevcut kontroller:** Şema `syntheticPatientId` için `^SYN-` regex zorunluluğu
  (`packages/contracts/src/index.ts` `patientStateSchema`). Worker metadata'da doğrudan
  tanımlayıcı benzeri alanları reddeder (`services/clinical-worker/clinical_worker/worker.py`
  `_guard`). Bunlar kimliksizliği zorlar; **hasta ayrımı sağlamaz**.
- **Eksik kontroller:** Belge→hasta bağlama; kimlik/klinik veri ayrımı; çok-profil
  ambar izolasyonu; "bu belge bu hastaya mı ait?" doğrulama adımı; karışma önleyici
  eşleştirme testleri.
- **Doğrulama kanıtı:** YOK (mix-up senaryosu için otomatik test yok).
- **Sahip:** clinical_safety + Platform.
- **Sürüm kapısı/durum:** G1/G6 — **AÇIK, sürüm engelleyici.**

### HZ-002 — Bayat / güncel olmayan veri kararı etkiler
- **Tehlike:** Eski bir ölçüm güncelmiş gibi sunulur; "en son durum" aslında bayattır.
- **Başlatıcı neden:** Zamansal/tazelik motoru yok. `calculate_lab_trend` verilen noktaları
  gün sırasına dizer ama "bu ölçüm hâlâ geçerli mi / süresi doldu mu" mantığı yoktur
  (`crates/clinical-core/src/lib.rs`).
- **Öngörülebilir dizi:** Aylar önceki gözlem son snapshot'a taşınır → değişmemiş gibi
  görünür → klinisyen güncel sanır → gecikmiş/yanlış öncelik.
- **Zarar:** Yanlış güvence veya gecikmiş aksiyon. **S4.**
- **Olasılık:** L4.
- **Risk: YÜKSEK.**
- **Mevcut kontroller:** Gözlem `effectiveAt`/`effective_day` taşır ve trend deterministik
  olarak zaman sıralar (`calculate_lab_trend`, test `lab_trend_is_deterministic_and_preserves_inputs`).
  Olaylar append-only sıra numarası alır (`EventStore::append`). Tazelik yorumu yok.
- **Eksik kontroller:** Analit bazlı geçerlilik/tazelik penceresi; "yeni mi yoksa tekrar mı"
  ayrımı; bayat-veri uyarısı; snapshot zaman damgası ile karar zamanının kıyası testi.
- **Doğrulama kanıtı:** Kısmi (yalnızca sıralama/determinism testi); tazelik testi YOK.
- **Sahip:** luna_worker + clinical_safety.
- **Sürüm kapısı/durum:** G2/G3 — **AÇIK.**

### HZ-003 — Birim / referans aralığı uyuşmazlığı
- **Tehlike:** Farklı birimlerdeki değerler kıyaslanır veya yanlış referans aralığıyla
  "normal/anormal" kararı verilir (ör. ng/mL ↔ µg/L, mg/dL ↔ mmol/L).
- **Başlatıcı neden:** Birim normalizasyonu/dönüşümü ve lab-özel referans aralığı işleme
  **yok**. UI referans aralığını yalnızca statik gösterir (`ObservationRow`), trend
  referans aralığını hiç kullanmaz.
- **Öngörülebilir dizi:** İki farklı birimli ferritin trend'e girer → sayısal fark
  anlamsız hesaplanır → yanıltıcı "−%42" tipi değişim.
- **Zarar:** Yanlış trend/karar. **S4.**
- **Olasılık:** L4.
- **Risk: YÜKSEK.**
- **Mevcut kontroller (kısmi):** `attach_duplicate_source` birim **eşit değilse** birleştirmeyi
  reddedip incelemeye yönlendirir (`CanonicalizationError::ConflictRequiresReview`, test
  `conflicting_observations_are_not_silently_merged`). Bu yalnızca sessiz birleşmeyi engeller;
  **dönüşüm/normalizasyon yapmaz.** Trend girişleri finite kontrolünden geçer (`TrendError::NonFiniteValue`).
- **Eksik kontroller:** UCUM tabanlı birim normalizasyonu; analit+lab+demografi bağlamlı
  referans aralığı; farklı birimli aynı analit için dönüşüm veya güvenli reddetme; birim
  karışıklığı golden testleri.
- **Doğrulama kanıtı:** Kısmi (birim uyuşmazlığında birleşmeme testi var); normalizasyon testi YOK.
- **Sahip:** luna_worker + clinical_safety.
- **Sürüm kapısı/durum:** G2 — **AÇIK.**

### HZ-004 — Yinelenen / çelişkili sonuçların sessiz birleşmesi
- **Tehlike:** Aynı analitin çelişen değerleri sessizce birleşir ya da tekrar sonuç ayrı
  gözlem sanılır.
- **Başlatıcı neden:** Kanonik eşleştirmede yanlış hoşgörü; çelişki çözümünün insana
  yönlendirilmemesi.
- **Öngörülebilir dizi:** İki farklı CRP değeri → biri diğerinin yerine yazılır → çelişki
  gizlenir → hatalı trend.
- **Zarar:** Yanlış klinik tablo. **S4.**
- **Olasılık:** L3.
- **Risk: YÜKSEK** (ancak bu satırda kısmi kod kontrolü mevcut).
- **Mevcut kontroller:** `attach_duplicate_source` yalnızca concept/value/unit/gün/specimen
  **tam eşleşirse** kaynak (provenance) ekler; herhangi biri farklıysa
  `ConflictRequiresReview` döndürür (test `conflicting_observations_are_not_silently_merged`).
  Yinelenen kaynaklar edge-id'ye göre tekilleştirilir, değer üzerine yazılmaz (test
  `canonical_observations_keep_duplicate_provenance`). UI çelişkili tier'ı ayrı işaretler
  ve inceleme kartında en yükseğe önceliklendirir (`data.ts`, `ReviewInbox`).
- **Eksik kontroller:** Bulanık eşleşme skorlama ve eşiği; çelişki çözülene kadar bağımlı
  hesapları **motor düzeyinde** durduran kilit (şu an UI'daki "hassas hesaplama durur"
  ifadesi yalnızca demo metnidir, yürütme kapısı değildir); zaman-hoşgörülü eşleştirme testleri.
- **Doğrulama kanıtı:** Rust birim testleri (yukarıda) + UI testi
  `report preview preserves unresolved conflict` (`apps/desktop/tests/App.test.tsx`).
- **Sahip:** sol_reviewer + luna_worker.
- **Sürüm kapısı/durum:** G2 — **KISMİ KONTROL; motor kilidi için AÇIK.**

### HZ-005 — OCR / çıkarım hatası
- **Tehlike:** OCR veya ayrıştırma yanlış sayı/birim/etiket üretir (ör. virgül-nokta,
  "1,2" ↔ "12", tablo hücresi kayması).
- **Başlatıcı neden:** Gerçek OCR yok; mevcut çıkarım verilen metin üzerinde regex'tir
  (`worker.py` `extract_fixture`, yalnızca Hemoglobin/Glukoz/CRP). Düzen-farkında OCR,
  güven skoru ve doğrulama yok.
- **Öngörülebilir dizi:** Bozuk taramadan yanlış değer → yüksek güvenle çıkarım → insan
  bütçesi kısıtlı olduğundan gözden kaçar → yanlış FACT adayı.
- **Zarar:** Yanlış değerle klinik karar. **S4.**
- **Olasılık:** L4.
- **Risk: YÜKSEK.**
- **Mevcut kontroller:** Çıkarımlar `FACT`+`verified` olmadan doğrulanmış duruma geçemez
  (`can_project_to_verified_state` / `canEnterVerifiedState`, testler); yani ham çıkarım
  doğrudan hasta durumuna giremez, insan onayı gerekir. Sayısal değer şemada `finite`
  zorunludur. Kaynak pasaj + provenance her gözlemde zorunlu (`provenance.min(1)`).
- **Eksik kontroller:** Düzen-farkında OCR; çıkarım güven skoru; birim/ondalık ayracı
  doğrulama; belge-metni ile çıkarılan değer arasında entailment kontrolü; OCR golden
  eval seti (MASTER_PLAN §27 "lab OCR").
- **Doğrulama kanıtı:** Kısmi (trust-tier kapısı testleri); OCR doğruluk seti YOK.
- **Sahip:** luna_worker + terra_researcher.
- **Sürüm kapısı/durum:** G2 — **AÇIK.**

### HZ-006 — Prompt injection (belge metninin talimat gibi işlenmesi)
- **Tehlike:** İçe aktarılan belge metni model için sistem talimatı gibi yorumlanır ve
  güvenlik/gizlilik kurallarını atlatır.
- **Başlatıcı neden:** Belge metni ↔ sistem talimatı ayrımının kodla zorlanmaması. Not:
  bugün **hiç model çağrısı yoktur**, dolayısıyla saldırı yüzeyi henüz açık değildir.
- **Öngörülebilir dizi (gelecek):** Model muhakemesi eklenince → belge içine gömülü
  "önceki talimatları yok say" metni → istem sızıntısı/güvenli olmayan çıktı.
- **Zarar:** Güvenli olmayan çıktı, veri sızıntısı. **S4.**
- **Olasılık:** L3 (özellik açıldığında yükselir).
- **Risk: YÜKSEK** (tasarımsal).
- **Mevcut kontroller:** Provenance çekmecesinde "belge metni güvenilmeyen veri olarak
  işlenir" UI ifadesi (`ProvenanceDrawer`) — **yalnızca metin, teknik izolasyon değil.**
  Worker ağ erişimi yapmaz (tasarım gereği). Bugün model istemi oluşturan kod yok.
- **Eksik kontroller:** Belge metnini yapısal olarak veri kanalında tutan istem mimarisi;
  talimat/veri ayrımının şema düzeyinde zorlanması; adversaryal fixture'larla enjeksiyon
  testleri (CLINICAL_SAFETY_REVIEW §7); istem şablonlarının versiyonlanmış denetimi.
- **Doğrulama kanıtı:** YOK.
- **Sahip:** sol_reviewer + Gizlilik sahibi.
- **Sürüm kapısı/durum:** G8/G6 — **AÇIK (model katmanı öncesi bloklanmalı).**

### HZ-007 — Zehirlenmiş / güvenilmeyen web kaynakları
- **Tehlike:** Kanıt hattına düşük kaliteli, manipüle edilmiş veya lisanssız kaynak girer
  ve uydurma/yanıltıcı atıf üretir.
- **Başlatıcı neden:** Kanıt hattı, kaynak-politika/lisans kontrolü, atıf varlık ve
  entailment doğrulaması **kodda yok** (MASTER_PLAN §16).
- **Öngörülebilir dizi (gelecek):** Onaysız kaynaktan pasaj → doğrulanmamış iddia →
  rapora sızan uydurma DOI/PMID.
- **Zarar:** Yanlış kanıtla klinik yönlendirme; uydurma atıf. **S4.**
- **Olasılık:** L3 (özellik açıldığında yükselir).
- **Risk: YÜKSEK** (tasarımsal).
- **Mevcut kontroller:** YOK (özellik uygulanmadı). Bugün ağ/kanıt kodu yok.
- **Eksik kontroller:** Onaylı kaynak allowlist'i; lisans/kaynak-politika kapısı; atıf
  varlık doğrulaması; iddia→pasaj entailment; tazelik/düzeltme/geri çekme kontrolü;
  yalnızca kanıt-ambarı source ID'lerine atıf zorunluluğu; atıf golden testleri.
- **Doğrulama kanıtı:** YOK.
- **Sahip:** terra_researcher + clinical_safety.
- **Sürüm kapısı/durum:** G4 — **AÇIK, sürüm engelleyici.**

### HZ-008 — PHI'nin buluta sızması
- **Tehlike:** Doğrudan tanımlayıcı veya ilgisiz klinik veri, bir sağlayıcıya/buluta gönderilir.
- **Başlatıcı neden:** Gönderim öncesi alan-düzeyi önizleme, redaksiyon motoru ve
  sağlayıcı adaptörleri **kodda yok** (MASTER_PLAN §23).
- **Öngörülebilir dizi (gelecek):** Sağlayıcı çağrısı eklenir → ham belge/tanımlayıcı
  istemle birlikte gider → sağlayıcı tarafında saklanır.
- **Zarar:** Gizlilik ihlali (güvenlik hazardı olarak sınıflanır). **S4.**
- **Olasılık:** L3 (özellik açıldığında yükselir).
- **Risk: YÜKSEK** (tasarımsal).
- **Mevcut kontroller:** Worker sağlayıcıya bağlanmaz ve non-sentetik/tanımlayıcı-benzeri
  girdiyi reddeder (`_guard`, testler `test_synthetic_only_guard`, `test_non_turkish_fixture_rejected`).
  `check_fixtures.py` fixture'ları sentetik sınırda tutar. UI çevrimdışı ve "SENTETİK VERİ"
  rozetini gösterir. **Bunlar gerçek bulut yolu için redaksiyon sağlamaz** çünkü bulut yolu yok.
- **Eksik kontroller:** Alan-düzeyi gönderim önizlemesi; doğrudan tanımlayıcı/ilgisiz veri
  hariç tutma motoru; sağlayıcı-tarafı saklama ayarları; PHI-sızıntısı fuzz/adversaryal
  test seti (CLINICAL_SAFETY_REVIEW §8); loglarda PHI olmadığının testi.
- **Doğrulama kanıtı:** Kısmi (worker sentetik-yalnız guard testleri); bulut önizleme/redaksiyon testi YOK.
- **Sahip:** Gizlilik sahibi + clinical_safety.
- **Sürüm kapısı/durum:** G6 — **AÇIK, sürüm engelleyici.**

### HZ-009 — Abonelik / API karışıklığı (yetkisiz bağlantı)
- **Tehlike:** Kullanıcının tüketici aboneliği (ör. ChatGPT) üçüncü-parti uygulamayı
  yetkilendiriyormuş gibi varsayılır; yanlış yüzeyle bağlantı kurulur.
- **Başlatıcı neden:** Bağlantı modları (`api_key`/`official_oauth`/`official_cli`/
  `local_endpoint`/`unavailable`) **kodda uygulanmadı**; yalnızca plan metni var (MASTER_PLAN §23).
- **Öngörülebilir dizi (gelecek):** Kullanıcı abonelikle giriş sanır → resmi olmayan/beklenmedik
  yolla veri gönderimi veya erişim reddi → gizlilik/uyum riski, kafa karışıklığı.
- **Zarar:** Beklenmedik veri egress'i / yetkisiz erişim, kullanıcı yanılgısı. **S3.**
- **Olasılık:** L3.
- **Risk: ORTA.**
- **Mevcut kontroller:** YOK (bağlantı katmanı yok). Plan, desteklenmeyen tüketici-aboneliği
  auth'unu "görünür biçimde kullanılamaz" tutmayı şart koşar; kodda henüz yaptırım yok.
- **Eksik kontroller:** Bağlantı-modu durum makinesi; tüketici aboneliği ≠ API yüzeyi
  ayrımının UI+kodla zorlanması; tarayıcı-çerezi/oturum kopyalamanın engellenmesi; her
  mod için açık yetkilendirme akışı.
- **Doğrulama kanıtı:** YOK.
- **Sahip:** Platform + Gizlilik sahibi.
- **Sürüm kapısı/durum:** G6/G1 — **AÇIK.**

### HZ-010 — Yanlış kesinlik / hastalık yüzdeleri (kalibre edilmemiş olasılık)
- **Tehlike:** Kalibre edilmemiş yüzdeler kesin olasılık gibi sunulur; "%X" bakımın
  gereksizliği olarak okunur (yanlış güven).
- **Başlatıcı neden:** Tahmin-tipi (A/B/C) etiketleme, kalibrasyon ve olasılık motoru
  **kodda yok**. UI'daki "−%42" ve benzeri değerler sabit demo metnidir (`App.tsx`, `data.ts`);
  yaptırım mantığı yok.
- **Öngörülebilir dizi (gelecek):** Model yüzde üretir → tip/kaynak/kalibrasyon olmadan
  gösterilir → kullanıcı kesin sanır → bakımı erteler.
- **Zarar:** Yanlış güvenle bakım gecikmesi. **S4.**
- **Olasılık:** L4.
- **Risk: YÜKSEK.**
- **Mevcut kontroller:** Sabit demo değerleri deterministik türetme çerçevesinde sunulur
  (`DERIVED_FACT` etiketi, `formula_version = lab-linear-v1`) ve trend "klinik anlam
  çıkarılmamıştır" ifadesiyle gösterilir (`Labs`, `ReportPreview`). **Tahmin-tipi kapısı yok.**
- **Eksik kontroller:** Her yüzde için zorunlu tahmin-tipi (A/B/C) + destekleyen/çelişen
  bulgu/eksik bilgi alanları; model uyumunun olasılıkla karıştırılmasını engelleyen ayrım;
  yüzdenin 100'e zorlanmaması; "yüzdesiz gösterim yok" birim/snapshot testleri (CLINICAL_SAFETY_REVIEW §5).
- **Doğrulama kanıtı:** YOK (olasılık-etiketleme testi yok).
- **Sahip:** clinical_safety + sol_reviewer.
- **Sürüm kapısı/durum:** G5/G3 — **AÇIK, sürüm engelleyici.**

### HZ-011 — Acil semptom yönetimi (kapsam dışı akışın erişilebilir olması)
- **Tehlike:** Acil/akut sunum uygulamada işlenip yanlış güven verir; acil bakım gecikir.
- **Başlatıcı neden:** Amaçlanan kullanım "acil yönetimi hariç" der ama **teknik giriş
  kapısı (yaş/gebelik/acil tarama) kodda yok**; yalnızca banner metni var.
- **Öngörülebilir dizi:** Kullanıcı acil bir tabloyu girer → sistem sakin/arşiv tonuyla
  yanıtlar → 112/acil başvuru gecikir.
- **Zarar:** Kritik bakımın gecikmesi. **S5.**
- **Olasılık:** L3.
- **Risk: YÜKSEK.**
- **Mevcut kontroller:** Her görünümde "acil durum yönetimi bu sürümün kapsamı dışındadır"
  güvenlik metni (`SAFETY_COPY`, test `renders non-diagnostic safety copy on every view`).
  Bu bir **metindir, kontrol değildir** (CLINICAL_SAFETY_REVIEW §1: "disclaimer bir kontrol değildir").
- **Eksik kontroller:** Kırmızı-bayrak/acil semptom deterministik tespiti; acil durumda
  bastırılamayan "acile başvur" yönlendirmesi; kapsam-dışı vakanın konsey/olasılık/rapor
  yüzeylerine ulaşamamasını sağlayan yol kapatma; kırmızı-bayrak eval seti (MASTER_PLAN §27).
- **Doğrulama kanıtı:** Kısmi (yalnızca güvenlik-metni testi); acil-yönlendirme davranış testi YOK.
- **Sahip:** clinical_safety.
- **Sürüm kapısı/durum:** G3/G1 — **AÇIK, sürüm engelleyici.**

### HZ-012 — İlaç / alerji çakışması kaçırılır
- **Tehlike:** Yinelenen etken madde, ilaç-alerji çakışması veya kontrendikasyon
  tespit edilmez veya lisanssız DDI kaynağından uydurma iddia üretilir.
- **Başlatıcı neden:** İlaç zekâsı ve alerji modeli **kodda yok** (MASTER_PLAN §11).
- **Öngörülebilir dizi (gelecek):** İki ürün aynı etken maddeyi içerir → tespit edilmez →
  çift dozaj/alerjik ajan uyarısı çıkmaz.
- **Zarar:** İlaç kaynaklı zarar (ör. anafilaksi, doz aşımı). **S5.**
- **Olasılık:** L3 (özellik açıldığında yükselir).
- **Risk: YÜKSEK** (tasarımsal).
- **Mevcut kontroller:** YOK (modül uygulanmadı).
- **Eksik kontroller:** Türkçe marka→etken madde eşleme; yinelenen etken madde tespiti;
  ilaç-alerji çapraz kontrolü; DDI iddialarının yalnızca lisanslı/doğrulanmış kaynaktan
  gelmesi + kapsam sınırı ifadesi; alerji çıkarımı golden seti (MASTER_PLAN §27).
- **Doğrulama kanıtı:** YOK.
- **Sahip:** clinical_safety + terra_researcher.
- **Sürüm kapısı/durum:** G3/G4 — **AÇIK, sürüm engelleyici.**

### HZ-013 — Silme / yedek sızıntısı veya geri döndürülemez veri kaybı
- **Tehlike:** Silinen PHI yedeklerde/artıklarda kalır (sızıntı) **veya** kurtarılamayan
  yerel ambar boylamsal geçmişi yok eder (güvenlik kaybı).
- **Başlatıcı neden:** Şifreleme, DPAPI-sarmalı anahtar, kurtarma anahtarı, şifreli yedek,
  güvenli silme **kodda yok** (MASTER_PLAN §24).
- **Öngörülebilir dizi:** Kullanıcı kaydı siler → yedek/geçici dosyada kalır (sızıntı);
  veya disk/anahtar kaybı → geçmiş geri gelmez → boylamsal bağlam yok olur.
- **Zarar:** Gizlilik ihlali veya boylamsal geçmiş kaybı (hasta güvenliği kaybı sayılır). **S4.**
- **Olasılık:** L3.
- **Risk: YÜKSEK.**
- **Mevcut kontroller:** Olay ambarı bellek-içi append-only'dur (`EventStore`, test
  `event_store_is_append_only_and_rejects_duplicate_ids`) — **kalıcı depolama, şifreleme
  veya yedek yoktur.** Fixture'lar sentetiktir; gerçek PHI depolanmaz.
- **Eksik kontroller:** Şifreli yerel depolama; DPAPI-sarmalı ana anahtar + zorunlu
  dışa aktarılabilir kurtarma anahtarı; şifreli yedek + test edilmiş geri yükleme provası;
  güvenli/tam silme (artık/yedek dahil); çökme-kurtarma eval seti (silme sonrası artık PHI testi).
- **Doğrulama kanıtı:** Kısmi (append-only bellek testi); şifreleme/yedek/silme testi YOK.
- **Sahip:** Platform + Gizlilik sahibi.
- **Sürüm kapısı/durum:** G6 — **AÇIK, sürüm engelleyici.**

### HZ-014 — Denetim kaydı kurcalama / yeniden üretilememe
- **Tehlike:** Karar geçmişi (olaylar, Analiz Manifestosu) sonradan değiştirilebilir veya
  bir raporun hangi girdilerden üretildiği kanıtlanamaz.
- **Başlatıcı neden:** Kalıcı, kurcalamaya-dayanıklı denetim (hash zinciri/imza) ve
  Analiz Manifestosu **kodda yok**; olay ambarı yalnızca bellekte (MASTER_PLAN §9).
- **Öngörülebilir dizi:** Süreç yeniden başlar → geçmiş kaybolur/değiştirilebilir →
  bir çıktı denetlenemez veya sorumluluk izlenemez.
- **Zarar:** Güvenlik olayının incelenememesi, yeniden üretilemezlik. **S3.**
- **Olasılık:** L3.
- **Risk: ORTA.**
- **Mevcut kontroller:** `EventStore` append-only'dur ve yinelenen `event_id` reddedilir
  (test var), sıra numarası atanır. **Kalıcılık, hash-zinciri, imza veya kurcalama kanıtı yok.**
- **Eksik kontroller:** Kalıcı append-only denetim günlüğü; hash-zinciri/imzalı olaylar;
  patient-state sürüm+hash içeren Analiz Manifestosu (§9); dışa aktarım/denetim olayları;
  kurcalama-tespit testi ve çökme-kurtarma sonrası bütünlük testi.
- **Doğrulama kanıtı:** Kısmi (append-only + duplicate-id testi); kalıcılık/kurcalama testi YOK.
- **Sahip:** sol_reviewer + Platform.
- **Sürüm kapısı/durum:** G6/G7 — **AÇIK.**

### HZ-015 — Model uyuşmazlığının/uyumunun doğrulama sanılması
- **Tehlike:** Konsey üyelerinin anlaşması "doğrulanmış/kesin" gibi, anlaşmazlık ise
  "geçersiz" gibi okunur; model uyumu hastalık olasılığı sanılır.
- **Başlatıcı neden:** Konsey ve ölçülen-anlaşmazlık mantığı **kodda yok** (MASTER_PLAN §19);
  ayrıca UI'da "model uyumu ≠ olasılık" ayrımını zorlayan bileşen yok.
- **Öngörülebilir dizi (gelecek):** İki model aynı hipotezde birleşir → arayüz bunu
  güven olarak sunar → kullanıcı doğrulanmış sanır; ya da anlaşmazlık yanlışlıkla
  "sorun yok" gibi görünür (yanlış güven).
- **Zarar:** Yanlış güven veya yanlış geçersiz kılma → karar hatası. **S4.**
- **Olasılık:** L4 (özellik açıldığında).
- **Risk: YÜKSEK** (tasarımsal).
- **Mevcut kontroller:** YOK (konsey uygulanmadı).
- **Eksik kontroller:** "Model uyumu olasılık değildir" ayrımının veri modeli ve UI'da
  zorlanması; ölçülen anlaşmazlığın üçüncü ajan + karşıt-doğrulamayı tetiklemesi;
  anlaşmazlığın "sorun yok" olarak okunamamasını sağlayan yanlış-güven snapshot testleri;
  müzakere/agreement-matrix eval'i.
- **Doğrulama kanıtı:** YOK.
- **Sahip:** clinical_safety + sol_reviewer.
- **Sürüm kapısı/durum:** G3/G5 — **AÇIK.**

### HZ-016 — Çevrimdışı bozulma (sessiz düşük kalite)
- **Tehlike:** Ağ/servis erişilemezken sistem sessizce eksik/eskimiş sonuç verir; kullanıcı
  bunun kısmi olduğunu anlamaz.
- **Başlatıcı neden:** Bozunma/servis-durumu yönetimi yok; uygulama tamamen yerel demo,
  ağ özellikleri henüz yok. Servis kesintisinde açık bozunma bildirimi kodda yok.
- **Öngörülebilir dizi (gelecek):** Kanıt/sağlayıcı servisi erişilemez → boş/eski sonuç
  sessizce döner → kullanıcı tam analiz sanır.
- **Zarar:** Eksik bilgiyle yanlış güven; gözden kaçan bulgu. **S3.**
- **Olasılık:** L3.
- **Risk: ORTA.**
- **Mevcut kontroller:** UI "Yerel ve çevrimdışı" durumunu ve "Ağ bağlantısı yok" durumunu
  açıkça gösterir (`App.tsx` topbar, `HealthInbox`). Worker zaten ağ kullanmaz. Bu, mevcut
  demo için dürüst durum bildirimidir; **servis-bozunma senaryosu için genel bir kontrol değildir.**
- **Eksik kontroller:** Her ağ-bağımlı yetenek için açık "kısmi/bozunmuş sonuç" bildirimi;
  eski önbelleğin tazelik damgasıyla işaretlenmesi; kritik hesabın eksik veriyle sessiz
  ilerlememesi; çevrimdışı/bozunma davranış testleri.
- **Doğrulama kanıtı:** Kısmi (çevrimdışı durum-metni görünür); bozunma davranış testi YOK.
- **Sahip:** Platform + luna_worker.
- **Sürüm kapısı/durum:** G7 — **AÇIK.**

---

## 2. İzlenebilirlik özeti

| ID | Tehlike | S | L | Risk | Kapı | Durum |
|----|---------|---|---|------|------|-------|
| HZ-001 | Hasta karışması | S5 | L3 | Yüksek | G1/G6 | Açık — engelleyici |
| HZ-002 | Bayat veri | S4 | L4 | Yüksek | G2/G3 | Açık |
| HZ-003 | Birim/referans uyuşmazlığı | S4 | L4 | Yüksek | G2 | Açık (kısmi) |
| HZ-004 | Yinelenen/çelişkili sonuç | S4 | L3 | Yüksek | G2 | Kısmi kontrol |
| HZ-005 | OCR/çıkarım hatası | S4 | L4 | Yüksek | G2 | Açık |
| HZ-006 | Prompt injection | S4 | L3 | Yüksek | G8/G6 | Açık |
| HZ-007 | Zehirlenmiş web kaynağı | S4 | L3 | Yüksek | G4 | Açık — engelleyici |
| HZ-008 | PHI bulut sızıntısı | S4 | L3 | Yüksek | G6 | Açık — engelleyici |
| HZ-009 | Abonelik/API karışıklığı | S3 | L3 | Orta | G6/G1 | Açık |
| HZ-010 | Yanlış kesinlik/yüzdeler | S4 | L4 | Yüksek | G5/G3 | Açık — engelleyici |
| HZ-011 | Acil semptom yönetimi | S5 | L3 | Yüksek | G3/G1 | Açık — engelleyici |
| HZ-012 | İlaç/alerji çakışması | S5 | L3 | Yüksek | G3/G4 | Açık — engelleyici |
| HZ-013 | Silme/yedek sızıntısı & veri kaybı | S4 | L3 | Yüksek | G6 | Açık — engelleyici |
| HZ-014 | Denetim kurcalama | S3 | L3 | Orta | G6/G7 | Açık |
| HZ-015 | Model uyumu = doğrulama yanılgısı | S4 | L4 | Yüksek | G3/G5 | Açık |
| HZ-016 | Çevrimdışı bozulma | S3 | L3 | Orta | G7 | Açık |

## 3. Kayıt yönetimi kuralları

- Bu kayıt yaşayan bir artefakttır; güvenlik kural seti, trust-tier modeli, konsey topolojisi
  veya amaçlanan kullanım kapsamı **maddi olarak değişince** yeniden gözden geçirilir
  (CLINICAL_SAFETY_REVIEW §9).
- Her **yüksek** şiddetli tehlike, kapanmadan önce hem **uygulanmış bir kontrole** hem de
  **yeniden üretilebilir otomatik bir teste** eşlenmelidir (MASTER_PLAN §4).
- "Mevcut kontroller" sütununa yalnızca depoda kanıtı olan bir kontrol yazılır; kod
  değişince kanıt referansı (dosya/test adı) güncellenir.
- Kalıcı riski "kabul edilebilir"e indirmeyen hiçbir tehlike, ilgili sürüm kapısını geçemez.
