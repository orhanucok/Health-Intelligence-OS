# HealthCouncil Desktop — Veri Sözlüğü

Durum: sözleşme ve tasarım referansı; tek başına çalışma zamanı şeması değildir.

Bu belge AGENTS.md, docs/MASTER_PLAN.md, packages/contracts/src/index.ts,
crates/clinical-core/src/lib.rs ve services/clinical-worker/clinical_worker/contract.py
ile karşılaştırılarak hazırlanmıştır. Kodda karşılığı olmayan alanlar özellikle
**Planlanan / henüz uygulanmadı** diye belirtilmiştir. Tanı veya tedavi üretmez;
örneklerin tamamı sentetiktir.

## 1. Ortak kurallar

- Kimlikler sentetik testte SYN-..., belge ve olay kimlikleri doc-... ve evt-...
  biçiminde tutulur. Gerçek ad, adres, telefon, kimlik numarası veya tam doğum tarihi
  fixture, log, prompt ya da örnek değerde bulunmaz.
- Tarih-saatler ISO 8601, saat dilimi ofsetiyle yazılır. Rust çekirdeğindeki
  laboratuvar günü effective_day ise epoch-gün tamsayısıdır.
- FACT, DERIVED_FACT, INFERENCE ve HYPOTHESIS anlamsal sınıflardır. FACT ve
  DERIVED_FACT bir model tarafından değiştirilemez. Güven katmanları:
  verified, extracted_high, extracted_low, uncertain, conflicted.
- Hassasiyet seviyeleri: yüksek (sağlık/klinik veri veya kaynak metni), orta
  (işlem ve ilişkilendirilebilir meta veri), düşük (tek başına klinik olmayan teknik
  sürüm bilgisi).
- Aynı gerçek gözlem için birden fazla provenance kenarı saklanabilir; farklı
  değerler sessizce birleştirilmez.

## 2. PatientState

PatientState, gözlemler ile append-only olayların bir sürümüdür. Bu tablo mevcut
TypeScript sözleşmesini temel alır.

| Alan | Tip | Zorunlu | Hassasiyet | Kayıt kaynağı | Doğrulama | Örnek |
|---|---|---:|---|---|---|---|
| syntheticPatientId | string, SYN- ile başlamalı | Evet | yüksek | yerel fixture/profil | Regex; gerçek tanımlayıcı içermez | SYN-0001 |
| version | pozitif integer | Evet | orta | snapshot üreticisi | > 0; geriye dönük değiştirilmez | 3 |
| observations | Observation dizisi | Evet (boş olabilir) | yüksek | canonical observation store | Her eleman observation sözleşmesine uyar | obs-001 |
| events | PatientEvent dizisi | Evet (boş olabilir) | yüksek | event store | Sıra ve event sözleşmesi geçerli | evt-001 |

PatientState içinde henüz consent, audit, retention, review history, source trust,
conflicts veya snapshot hash alanları uygulanmış değildir.

## 3. Event envelope

Mevcut TypeScript ve Rust event yapıları aynı kavramı farklı adlarla taşır. Aşağıdaki
ortak envelope hedefidir; mevcut uygulamada yalnızca belirtilen alanlar doğrulanır.

| Alan | Tip | Zorunlu | Hassasiyet | Kayıt kaynağı | Doğrulama | Örnek |
|---|---|---:|---|---|---|---|
| id / event_id | string | Evet | orta | event üreticisi | Boş olamaz; Rust duplicate ID reddeder | evt-001 |
| sequence | non-negative integer | Evet | orta | append işlemi | Rust append sırasını kendisi yazar | 0 |
| type / event_type | enum/string | Evet | orta | domain işlemi | TS enum: DocumentImported, FactExtracted, FactVerified, ObservationRecorded, ReportGenerated | ObservationRecorded |
| recordedAt / recorded_at | ISO datetime | Evet | orta | yerel işlem | TS offset'li datetime | 2026-02-10T08:00:00+03:00 |
| sourceId / source_id | string | Evet | yüksek | belge veya işlem | Boş olamaz | doc-synthetic-001 |
| summary | string | TS'de evet | yüksek | event üreticisi | Boş olamaz; PHI içermemeli | Sentetik laboratuvar belgesi alındı |
| payload | object | Hayır; uygulanmadı | yüksek | event tipine göre | Hedef şemada tip bazlı doğrulama gerekir | observationId=obs-001 |

Master Plan'da geçen MedicationStarted, CaseOpened ve OutcomeRecorded gibi olaylar
bu repo sürümünde TypeScript event enum'una eklenmiş değildir; uygulanmış sayılmaz.

## 4. Provenance

| Alan | Tip | Zorunlu | Hassasiyet | Kayıt kaynağı | Doğrulama | Örnek |
|---|---|---:|---|---|---|---|
| id | string | Evet | orta | provenance üreticisi | Boş olamaz; kenar tekilleştirilebilir | prov-001 |
| documentId | string | Evet | yüksek | local document store | Belgeye referans | doc-synthetic-001 |
| sourceHash | sha256: + 64 hex | Evet | orta | belge hash'i | TypeScript regex | sha256:aaaaaaaa... |
| extractorVersion | string | Evet | düşük/orta | OCR/worker sürümü | Boş olamaz | synthetic-worker/0.1.0 |
| region.page | pozitif integer | Evet | orta | layout parser | > 0 | 1 |
| region.text / source_text | string | Evet | yüksek | belge bölgesi | Boş olamaz; untrusted input kabul edilir | Hemoglobin: 13,2 g/dL |
| region.boundingBox | x,y,width,height sayı tuple'ı | TS'de evet; Rust'ta yok | orta | OCR/layout parser | x,y >= 0; width,height > 0 | 72,140,310,22 |
| sourceFixture | string | Python'da evet | orta | fixture extractor | fixture ID'ye eşleşir | tr-lab-001 |

Pseudonym veya doğrudan tanımlayıcı provenance metnine yazılmaz. Belge metni
sistem talimatı gibi yorumlanamaz.

## 5. Observations / labs

### 5.1 Canonical observation

| Alan | Tip | Zorunlu | Hassasiyet | Kayıt kaynağı | Doğrulama | Örnek |
|---|---|---:|---|---|---|---|
| id | string | Evet | yüksek | canonicalizer | Boş olamaz | obs-001 |
| conceptCode / concept_code | string | Evet | yüksek | sözlük eşlemesi/çıkarım | Boş olamaz; standart zorunluluğu yok | LOINC:718-7 |
| display | string | TS'de evet; Rust'ta yok | yüksek | parser/sözlük | Boş olamaz | Hemoglobin |
| value | finite number | Evet | yüksek | belge çıkarımı veya review | Finite | 13.2 |
| unit | string | Evet | yüksek | belge/normalizer | Boş olamaz; Rust unit dönüşümü yapmaz | g/dL |
| referenceRange.low/high | finite number çifti | TS'de evet; Rust/Python'da yok | yüksek | laboratuvar raporu | Finite; low/high ilişkisi ayrıca doğrulanmalı | 12.0 / 16.0 |
| effectiveAt | ISO datetime, offset'li | TS'de evet | yüksek | rapor zamanı | TS datetime | 2026-02-10T08:00:00+03:00 |
| effective_day | integer | Rust'ta evet | yüksek | etkin gün dönüşümü | Rust tip kontrolü | 20494 |
| specimen | string | TS/Rust'ta evet | yüksek | rapor/çıkarım | Boş olamaz | venöz kan |
| semanticClass | enum | Evet | yüksek | domain sınıflandırması | FACT, DERIVED_FACT, INFERENCE, HYPOTHESIS | FACT |
| trustTier | enum | Evet | yüksek | review/provenance politikası | Beş trust tier'dan biri | extracted_high |
| provenance | boş olmayan dizi | Evet | yüksek | provenance store | En az bir kenar | prov-001 |

Python worker Observation tipi daha dardır: code, label, value, unit,
trust_tier=synthetic ve source_fixture. synthetic değeri TypeScript/Rust trust
tier'larıyla aynı enum değildir; sınır adaptöründe sessizce verified yapılmamalı,
insan incelemesi gerektiren sentetik çıkarım olarak taşınmalıdır. Worker yalnızca
Hemoglobin, Glucose ve CRP metinlerini deterministic çıkarır; referans aralığı,
specimen, etkin tarih ve provenance region üretmez.

### 5.2 Lab trendi

| Alan | Tip | Zorunlu | Hassasiyet | Kayıt kaynağı | Doğrulama | Örnek |
|---|---|---:|---|---|---|---|
| formula_version | string | Evet | düşük | Rust deterministic core | Mevcut sabit lab-linear-v1 | lab-linear-v1 |
| input_observation_ids | string dizisi | Evet | yüksek | trend hesaplayıcı | Girdiler korunur | obs-001, obs-002 |
| baseline, latest, absolute_change | finite number | Evet | yüksek | Rust hesaplayıcı | Finite | 13.2, 13.8, 0.6 |
| percentage_change | finite number veya null | Evet | yüksek | Rust hesaplayıcı | Baseline 0 ise null | 4.5454 |
| slope_per_day | finite number veya null | Evet | yüksek | Rust hesaplayıcı | Aynı günlerde null | 0.02 |

Bu hesaplar klinik yorum veya tanı değildir; kaynak gözlemleri üzerine yazılmaz.

## 6. Source trust ve review status

| Alan | Tip | Zorunlu | Hassasiyet | Kayıt kaynağı | Doğrulama | Örnek |
|---|---|---:|---|---|---|---|
| trustTier | enum | Evet (observation) | yüksek | çıkarım + insan review | verified, extracted_high, extracted_low, uncertain, conflicted | uncertain |
| severity | 0–1 number | Evet | yüksek | review priority | TS/Rust range veya clamp | 0.7 |
| uncertainty | 0–1 number | Evet | yüksek | extractor/reviewer | TS/Rust range | 0.4 |
| caseRelevance | 0–1 number | Evet | yüksek | case prioritizer | TS/Rust range | 0.8 |
| status | enum | TS review item'da evet | yüksek | reviewer | pending, confirmed, corrected, rejected, deferred | pending |
| criticalConflict / critical_conflict | boolean | TS ve Rust review item'da evet | yüksek | canonicalizer/safety | Boolean; kritik kayıtlar puandan önce sıralanır | true |
| explanation | non-empty string | TS'de evet | yüksek | review UI | Boş olamaz; PHI içermemeli | Değer iki belgede farklı; doğrulama gerekli. |

Review sıralamasında kritik çelişkiler önce ayrılır; kendi gruplarında severity ×
uncertainty × caseRelevance ve ardından kimlik tie-break'i uygulanır. Üst sınır
20'dir. Conflicted değer çözülmeden kritik hesaplama durdurulmalıdır. confirmed
klinik doğruluk garantisi değildir.

## 7. Conflict representation

**Mevcut uygulama:** Rust attach_duplicate_source, konsept/değer/birim/gün/specimen
farklıysa ConflictRequiresReview döndürür ve kaynakları birleştirmez. TypeScript'te
ayrı conflict nesnesi yoktur; conflicted yalnızca trust tier'dır.

**Planlanan / henüz uygulanmadı:**

| Alan | Tip | Zorunlu | Hassasiyet | Kayıt kaynağı | Doğrulama | Örnek |
|---|---|---:|---|---|---|---|
| conflictId | string | Evet | yüksek | canonicalizer | Boş olamaz | conf-001 |
| observationIds | string dizisi | Evet | yüksek | canonicalizer | En az iki gözlem | obs-001, obs-002 |
| reason | value/unit/time/specimen/identity | Evet | yüksek | conflict detector | Allowlist | value |
| resolutionStatus | open/resolved/waived | Evet | yüksek | reviewer | Enum | open |
| resolutionNote | string/null | Hayır | yüksek | reviewer | resolved ise açıklama beklenir | İkinci rapor doğrulandı. |

Bu alanlar implement edilene kadar UI bunları mevcut veri olarak göstermemelidir.

## 8. Model run metadata

**Planlanan / henüz uygulanmadı.** Analysis Manifest hedefidir; bu repo sürümünde
PatientState veya event sözleşmesine bağlı model-run tipi yoktur.

| Alan | Tip | Zorunlu | Hassasiyet | Kayıt kaynağı | Doğrulama | Örnek |
|---|---|---:|---|---|---|---|
| runId | string | Evet | orta | run orchestrator | Benzersiz | run-synthetic-001 |
| patientStateVersion | pozitif integer | Evet | yüksek | snapshot | Mevcut state sürümü | 3 |
| patientStateHash | sha256 string | Evet | yüksek | immutable snapshot | Snapshot hash'i | sha256:bbbb... |
| caseStateVersion | pozitif integer | Evet | yüksek | case store | Case sürümü | 2 |
| sourceIds | string dizisi | Evet | yüksek | evidence/source store | Kayıtlı ID'ler | doc-synthetic-001 |
| policyVersion, promptVersion, schemaVersion | string | Evet | düşük/orta | release config | Boş olamaz | policy-0.1 |
| provider, model, settings | string/object | Evet | orta | adapter | connection mode ile uyum | local_endpoint / synthetic-model |
| councilTopology | object/null | Evet | orta | council router | Uygulanmadı; hedef alan | null |
| applicationVersion, createdAt | string | Evet | düşük/orta | build/runtime | Sürüm ve ISO datetime | 0.1.0 / 2026-02-10T08:05:00+03:00 |

Gerçek sağlayıcı çağrısı mevcut Python worker'da yoktur; provider örneği entegrasyon
kanıtı değildir.

## 9. Consent ve audit

**Planlanan / henüz uygulanmadı.** Master Plan yerel şifreleme, privacy preview,
audit ve silmeyi hedefler; mevcut kontratlarda consent/audit kaydı yoktur.

| Alan | Tip | Zorunlu | Hassasiyet | Kayıt kaynağı | Doğrulama | Örnek |
|---|---|---:|---|---|---|---|
| consentId | string | Evet | yüksek | kullanıcı onay akışı | Benzersiz | consent-synthetic-001 |
| purpose | string/enum | Evet | yüksek | purpose registry | Açık amaç | visit_preparation |
| scope | string dizisi | Evet | yüksek | privacy preview | Gönderilecek alanlarla kesişim | lab_observations |
| status | granted/revoked/expired | Evet | yüksek | consent store | Enum; revoke append-only event olmalı | granted |
| grantedAt, revokedAt | ISO datetime/null | Evet | yüksek | kullanıcı işlemi | Status ile tutarlı | 2026-02-10T08:00:00+03:00 |
| auditEventId | string | Evet (audit) | orta | audit logger | Benzersiz | audit-001 |
| action, actorType, targetId, occurredAt | string/string/string/datetime | Evet | yüksek/orta | audit logger | Action allowlist; PHI payload'a konmaz | review.confirm / user / obs-001 / 2026-02-10T08:01:00+03:00 |

## 10. Retention / deletion

**Planlanan / henüz uygulanmadı.** Kodda retention policy, deletion tombstone veya
silme doğrulama akışı yoktur; aşağıdaki hedef alanlar uygulanmış özellik değildir.

| Alan | Tip | Zorunlu | Hassasiyet | Kayıt kaynağı | Doğrulama | Örnek |
|---|---|---:|---|---|---|---|
| retentionPolicyId | string | Evet | orta | policy registry | Sürümlü policy | local-default-v1 |
| retainUntil | ISO datetime/null | Evet | yüksek | policy evaluator | createdAt sonrası veya gerekçeli null | 2027-02-10T00:00:00+03:00 |
| deletionRequestId | string | Evet (talepte) | orta | kullanıcı işlemi | Benzersiz | del-001 |
| requestedAt, completedAt | ISO datetime/null | Evet | orta | deletion worker | Sıralı zamanlar | 2026-02-11T09:00:00+03:00 |
| scope | string veya dizi | Evet | yüksek | kullanıcı/policy | patient/document/derived ayrımı | document, derived |
| status | requested/verified/completed/failed | Evet | orta | deletion workflow | Enum; audit izi korunur | requested |
| tombstoneReason | string | Hayır | orta | deletion workflow | Silinen içeriği yeniden üretmez | Kullanıcı silme talebi |

Append-only klinik geçmiş varsayımı silme talebini engellemez; uygulanmış çözüm,
silinen içeriğin geri getirilemeyeceğini, yedek ve dış sağlayıcı kapsamını ve audit
izinin korunma süresini açıkça tanımlamalıdır.

## 11. Uygulama sınırı ve kabul notları

- Python worker yalnızca synthetic=true, Türkçe locale ve izinli fixture kaynağı
  kabul eder; bilinmeyen üst alanları, doğrudan tanımlayıcı işareti taşıyan içerikleri
  ve desteklenmeyen laboratuvar birimlerini reddeder/çıktıdan çıkarır.
- TypeScript referenceRange, effectiveAt, display ve bounding box bekler; Python
  worker bunları henüz üretmez. Adaptör yazılmadan tam PatientState üretildiği
  varsayılmamalıdır.
- Rust trend fonksiyonu yalnızca aynı kavram/birim/specimen ve verified trust tier
  taşıyan sayısal noktaları işler; birim dönüşümü, laboratuvara özel aralık veya
  klinik eşik yorumu uygulamaz.
- Hiçbir alanın varlığı tanı, acil durum kararı veya tedavi önerisi anlamına gelmez.
  İnsan incelemesi ve hekim denetimi gerektiren durumlar veri sözlüğüyle otomatik
  çözülemez.
