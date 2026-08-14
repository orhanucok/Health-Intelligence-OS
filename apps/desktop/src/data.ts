export type AppView =
  | "inbox"
  | "passport"
  | "documents"
  | "review"
  | "timeline"
  | "labs"
  | "medications"
  | "cases"
  | "research"
  | "council"
  | "probabilities"
  | "reports"
  | "outcomes"
  | "providers"
  | "advanced";

export type TimelineEvent = {
  id: string;
  date: string;
  kind: "lab" | "medication" | "symptom" | "visit" | "document";
  title: string;
  detail: string;
  source: string;
  trust: "Doğrulandı" | "İncelenecek";
};

export const patient = {
  id: "SYN-001",
  name: "Deniz Yılmaz",
  initials: "DY",
  age: 34,
  sex: "Kadın",
  bloodType: "A Rh+",
  height: "168 cm",
  weight: "64,2 kg",
  bmi: "22,7",
  stateVersion: 31,
  completeness: 86,
  lastUpdate: "Bugün, 10:42",
};

export const inboxItems = [
  {
    id: "review-crp",
    tone: "danger",
    eyebrow: "KRİTİK İNCELEME",
    title: "CRP sonucu iki kaynakta farklı görünüyor",
    detail: "7,2 mg/L ve 1,2 mg/L · Trend hesabı durduruldu",
    meta: "SYN-LAB-2026-02 · 8 dk önce",
    action: "Çelişkiyi çöz",
    target: "documents" as AppView,
  },
  {
    id: "case-followup",
    tone: "warning",
    eyebrow: "VAKA TAKİBİ",
    title: "Karın ağrısı vakası için 3 soru bekliyor",
    detail: "Safety Review tamamlandı · Araştırmaya hazır değil",
    meta: "Vaka #HC-1042 · Dün",
    action: "Soruları yanıtla",
    target: "cases" as AppView,
  },
  {
    id: "lab-change",
    tone: "success",
    eyebrow: "YENİ DEĞİŞİM",
    title: "Ferritin kişisel bazalın %42 altında",
    detail: "31 → 18 ng/mL · 119 günde azalma",
    meta: "İki doğrulanmış gözlem",
    action: "Trendi incele",
    target: "labs" as AppView,
  },
  {
    id: "outcome",
    tone: "info",
    eyebrow: "SONUÇ BİLDİRİMİ",
    title: "Migren görüşmesinin sonucunu ekler misiniz?",
    detail: "Hekim sonucu, istenen testler ve tedavi değişikliği",
    meta: "Rapor #R-2026-014 · 12 gün önce",
    action: "Sonuç ekle",
    target: "outcomes" as AppView,
  },
];

export const documents = [
  {
    id: "SYN-LAB-2026-02",
    name: "Laboratuvar Sonuçları — Şubat 2026.pdf",
    type: "Laboratuvar",
    date: "10 Şub 2026",
    pages: 2,
    facts: 18,
    status: "İnceleme gerekli",
    progress: 92,
  },
  {
    id: "SYN-EPI-2025-11",
    name: "Dahiliye Epikriz.pdf",
    type: "Epikriz",
    date: "18 Kas 2025",
    pages: 4,
    facts: 26,
    status: "Doğrulandı",
    progress: 100,
  },
  {
    id: "SYN-RX-2025-10",
    name: "E-Reçete Ekim 2025.png",
    type: "Reçete",
    date: "14 Eki 2025",
    pages: 1,
    facts: 5,
    status: "Doğrulandı",
    progress: 100,
  },
  {
    id: "SYN-US-2025-07",
    name: "Abdominal Ultrason Raporu.pdf",
    type: "Görüntüleme raporu",
    date: "22 Tem 2025",
    pages: 2,
    facts: 9,
    status: "Doğrulandı",
    progress: 100,
  },
];

export const labRows = [
  {
    test: "Ferritin",
    code: "LOINC 2276-4",
    value: "18",
    unit: "ng/mL",
    range: "13–150",
    delta: "−41,9%",
    state: "Düşüyor",
    tone: "warning",
    date: "10 Şub 2026",
  },
  {
    test: "CRP",
    code: "LOINC 1988-5",
    value: "7,2",
    unit: "mg/L",
    range: "0–5",
    delta: "+500%",
    state: "Çelişkili",
    tone: "danger",
    date: "10 Şub 2026",
  },
  {
    test: "Hemoglobin",
    code: "LOINC 718-7",
    value: "12,6",
    unit: "g/dL",
    range: "12–16",
    delta: "−3,1%",
    state: "Kararlı",
    tone: "neutral",
    date: "10 Şub 2026",
  },
  {
    test: "TSH",
    code: "LOINC 3016-3",
    value: "2,14",
    unit: "mIU/L",
    range: "0,4–4,2",
    delta: "+2,8%",
    state: "Kararlı",
    tone: "success",
    date: "10 Şub 2026",
  },
  {
    test: "B12",
    code: "LOINC 2132-9",
    value: "286",
    unit: "pg/mL",
    range: "197–771",
    delta: "−8,6%",
    state: "Kararlı",
    tone: "neutral",
    date: "10 Şub 2026",
  },
];

export const medications = [
  {
    name: "Levotiroksin",
    brand: "Euthyrox",
    dose: "50 mcg",
    schedule: "Sabah, aç karnına",
    since: "12 Mart 2023",
    reason: "Hipotiroidi",
    adherence: 94,
    tone: "violet",
  },
  {
    name: "Ferrous bisglycinate",
    brand: "Demir takviyesi",
    dose: "25 mg",
    schedule: "Günde 1",
    since: "16 Şubat 2026",
    reason: "Düşen ferritin",
    adherence: 88,
    tone: "orange",
  },
  {
    name: "Sumatriptan",
    brand: "İmigran",
    dose: "50 mg",
    schedule: "Gerektiğinde",
    since: "8 Haziran 2024",
    reason: "Migren atağı",
    adherence: 100,
    tone: "blue",
  },
];

export const timelineEvents: TimelineEvent[] = [
  {
    id: "te-1",
    date: "10 Şub 2026",
    kind: "lab",
    title: "Laboratuvar paneli kaydedildi",
    detail: "Ferritin 18 ng/mL · CRP 7,2 mg/L · Hemoglobin 12,6 g/dL",
    source: "SYN-LAB-2026-02",
    trust: "İncelenecek",
  },
  {
    id: "te-2",
    date: "28 Oca 2026",
    kind: "symptom",
    title: "Karın ağrısı vakası açıldı",
    detail: "Sağ alt kadranda aralıklı ağrı ve şişkinlik bildirildi",
    source: "Manuel kullanıcı girişi",
    trust: "Doğrulandı",
  },
  {
    id: "te-3",
    date: "18 Kas 2025",
    kind: "visit",
    title: "Dahiliye görüşmesi",
    detail:
      "Epikrizden 26 klinik gerçek çıkarıldı ve kullanıcı tarafından doğrulandı",
    source: "SYN-EPI-2025-11",
    trust: "Doğrulandı",
  },
  {
    id: "te-4",
    date: "14 Eki 2025",
    kind: "lab",
    title: "Ferritin kişisel bazal ölçümü",
    detail: "Ferritin 31 ng/mL · Serum",
    source: "SYN-LAB-2025-10",
    trust: "Doğrulandı",
  },
  {
    id: "te-5",
    date: "14 Eki 2025",
    kind: "medication",
    title: "Demir takviyesi sonlandırıldı",
    detail: "Kullanıcı bildirimi · Tolere edememe",
    source: "İlaç günlüğü",
    trust: "Doğrulandı",
  },
  {
    id: "te-6",
    date: "22 Tem 2025",
    kind: "document",
    title: "Abdominal ultrason raporu",
    detail: "Akut patoloji tarif edilmedi; rapor arşive eklendi",
    source: "SYN-US-2025-07",
    trust: "Doğrulandı",
  },
];

export const researchSources = [
  {
    title: "AGA Clinical Practice Update on Iron Deficiency Anemia",
    source: "Gastroenterology",
    year: 2024,
    quality: "Yüksek",
    license: "Metadata + özet",
    status: "Doğrulandı",
    id: "PMID 38864796",
  },
  {
    title:
      "British Society of Gastroenterology guidelines for iron deficiency anaemia",
    source: "Gut",
    year: 2021,
    quality: "Yüksek",
    license: "CC BY-NC",
    status: "Doğrulandı",
    id: "PMID 34497146",
  },
  {
    title: "WHO guideline on ferritin concentrations",
    source: "World Health Organization",
    year: 2020,
    quality: "Resmî",
    license: "Açık kılavuz",
    status: "Doğrulandı",
    id: "ISBN 978-92-4-000012-4",
  },
  {
    title: "Iron deficiency without anaemia: a diagnosis that matters",
    source: "Clinical Medicine",
    year: 2021,
    quality: "Orta",
    license: "PMC OA",
    status: "Doğrulandı",
    id: "PMCID PMC8002799",
  },
];

export const councilAgents = [
  {
    name: "Gemini 3.7 Flash",
    provider: "Google Antigravity",
    role: "Kanıt tarayıcı",
    effort: "Orta",
    status: "Tamamlandı",
    duration: "42 sn",
    color: "#4f8df7",
    initials: "G",
  },
  {
    name: "GPT‑5.6 Sol",
    provider: "OpenAI Codex",
    role: "Klinik sentez",
    effort: "Yüksek",
    status: "Tamamlandı",
    duration: "1 dk 18 sn",
    color: "#22a77a",
    initials: "S",
  },
  {
    name: "Claude Opus",
    provider: "Anthropic",
    role: "Karşı kanıt",
    effort: "Yüksek",
    status: "Tamamlandı",
    duration: "1 dk 06 sn",
    color: "#c77850",
    initials: "C",
  },
  {
    name: "Safety Judge",
    provider: "Deterministik + Sol",
    role: "Güvenlik hakemi",
    effort: "Çok yüksek",
    status: "Hazır",
    duration: "—",
    color: "#8c6ad9",
    initials: "J",
  },
];

export const probabilityItems = [
  {
    name: "Demir eksikliği",
    estimate: 68,
    calibration: "Kalibre edilmemiş AI araştırma tahmini",
    evidence: "Orta–yüksek",
    agreement: "3/3",
    risk: "Orta",
    supports: [
      "Ferritin düşüşü",
      "Kişisel bazale göre −%42",
      "Önceki demir desteği öyküsü",
    ],
    against: ["Hemoglobin referans içinde"],
    missing: "Transferrin satürasyonu ve tam demir paneli",
  },
  {
    name: "Fonksiyonel gastrointestinal yakınma",
    estimate: 44,
    calibration: "Kalibre edilmemiş AI araştırma tahmini",
    evidence: "Orta",
    agreement: "2/3",
    risk: "Düşük",
    supports: ["Aralıklı şişkinlik", "Semptomların yemekle ilişkisi"],
    against: ["CRP kaydı henüz çelişkili"],
    missing: "Semptom günlüğü ve fizik muayene",
  },
  {
    name: "İnflamatuvar bağırsak hastalığı",
    estimate: 18,
    calibration: "Kalibre edilmemiş AI araştırma tahmini",
    evidence: "Düşük–orta",
    agreement: "1/3",
    risk: "Yüksek öncelik",
    supports: ["Olası CRP yüksekliği", "Karın ağrısı"],
    against: ["Kilo kaybı ve kalıcı ishal bildirilmedi"],
    missing: "Fekal kalprotektin ve klinisyen değerlendirmesi",
  },
];

export const providers = [
  {
    id: "openai-api",
    name: "OpenAI API",
    subtitle: "Responses API · Structured Outputs",
    auth: "API anahtarı",
    status: "Bağlanabilir",
    tone: "green",
    mark: "OA",
  },
  {
    id: "chatgpt",
    name: "ChatGPT hesabı",
    subtitle: "Abonelik API kullanımından ayrıdır",
    auth: "Resmî entegrasyon bekleniyor",
    status: "Kullanılamıyor",
    tone: "gray",
    mark: "CG",
  },
  {
    id: "anthropic-api",
    name: "Anthropic API",
    subtitle: "Claude modelleri",
    auth: "API anahtarı",
    status: "Bağlanabilir",
    tone: "orange",
    mark: "AN",
  },
  {
    id: "claude-cli",
    name: "Claude hesabı",
    subtitle: "Resmî Claude Code CLI",
    auth: "Official CLI",
    status: "Bağlı",
    tone: "orange",
    mark: "CL",
  },
  {
    id: "gemini-api",
    name: "Gemini API",
    subtitle: "Google AI Studio / Vertex",
    auth: "API anahtarı",
    status: "Bağlanabilir",
    tone: "blue",
    mark: "GA",
  },
  {
    id: "gemini-account",
    name: "Gemini hesabı",
    subtitle: "Antigravity · ahmetmaster88@gmail.com",
    auth: "Official CLI",
    status: "Bağlı",
    tone: "blue",
    mark: "GE",
  },
  {
    id: "deepseek",
    name: "DeepSeek API",
    subtitle: "OpenAI uyumlu API",
    auth: "API anahtarı",
    status: "Bağlanabilir",
    tone: "indigo",
    mark: "DS",
  },
  {
    id: "xai",
    name: "xAI API",
    subtitle: "Grok modelleri · OpenAI uyumlu",
    auth: "API anahtarı",
    status: "Bağlanabilir",
    tone: "gray",
    mark: "xAI",
  },
  {
    id: "kimi",
    name: "Kimi API",
    subtitle: "Moonshot AI · uzun bağlam",
    auth: "API anahtarı",
    status: "Bağlanabilir",
    tone: "purple",
    mark: "KM",
  },
  {
    id: "local",
    name: "Yerel AI",
    subtitle: "Ollama / OpenAI uyumlu endpoint",
    auth: "Local endpoint",
    status: "Yapılandır",
    tone: "purple",
    mark: "AI",
  },
];

export const stateMachine = [
  "NEW",
  "DATA COLLECTION",
  "SAFETY REVIEW",
  "QUESTIONS REQUIRED",
  "READY FOR RESEARCH",
  "RESEARCHING",
  "EVIDENCE READY",
  "COUNCIL RUNNING",
  "REPORT READY",
  "FOLLOW UP",
];
