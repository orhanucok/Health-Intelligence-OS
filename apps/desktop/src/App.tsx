import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  BadgeCheck,
  Beaker,
  Bell,
  BookOpen,
  Bot,
  BrainCircuit,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleUserRound,
  ClipboardCheck,
  Clock3,
  Cloud,
  Database,
  Download,
  FileCheck2,
  FileHeart,
  FileSearch,
  FileText,
  Filter,
  FlaskConical,
  FolderHeart,
  HeartPulse,
  HelpCircle,
  History,
  Home,
  KeyRound,
  Layers3,
  LineChart,
  Link2,
  ListChecks,
  LockKeyhole,
  Menu,
  MessageCircle,
  Milestone as TimelineIcon,
  Microscope,
  Moon,
  MoreHorizontal,
  Network,
  PanelRightOpen,
  Pill,
  Plus,
  RefreshCcw,
  Search,
  Send,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Sun,
  Target,
  TestTubes,
  TrendingDown,
  TrendingUp,
  UploadCloud,
  UserRound,
  UsersRound,
  Utensils,
  WandSparkles,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { UiBadge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import {
  councilAgents,
  documents,
  inboxItems,
  labRows,
  medications,
  patient,
  probabilityItems,
  providers,
  researchSources,
  stateMachine,
  timelineEvents,
  type AppView,
} from "./data";

export const SAFETY_COPY =
  "HealthCouncil tıbbi tanı koymaz ve hekimin yerini almaz. Acil veya hızla kötüleşen bir durumda yerel acil yardım hizmetine başvurun.";

type NavItem = { id: AppView; label: string; icon: LucideIcon; badge?: string };
type NavSection = { label: string; items: NavItem[] };

const navSections: NavSection[] = [
  {
    label: "Çalışma alanı",
    items: [{ id: "inbox", label: "Health Inbox", icon: Home, badge: "4" }],
  },
  {
    label: "Sağlığım",
    items: [
      { id: "passport", label: "Health Passport", icon: CircleUserRound },
      { id: "documents", label: "Belgeler", icon: FolderHeart, badge: "1" },
      { id: "review", label: "İnceleme Kutusu", icon: ListChecks, badge: "3" },
      { id: "timeline", label: "Timeline", icon: TimelineIcon },
      { id: "labs", label: "Labs", icon: TestTubes },
      { id: "medications", label: "Medications", icon: Pill },
    ],
  },
  {
    label: "Sağlık zekâsı",
    items: [
      { id: "cases", label: "Cases & Chat", icon: MessageCircle, badge: "1" },
      { id: "research", label: "Research", icon: FileSearch },
      { id: "council", label: "AI Council", icon: UsersRound },
      { id: "probabilities", label: "Probabilities", icon: BrainCircuit },
    ],
  },
  {
    label: "Çıktılar",
    items: [
      { id: "reports", label: "Reports", icon: FileHeart },
      { id: "outcomes", label: "Outcomes", icon: ClipboardCheck },
      { id: "advanced", label: "Treatment & What‑if", icon: WandSparkles },
    ],
  },
];

const viewTitles: Record<AppView, { title: string; subtitle: string }> = {
  inbox: { title: "Health Inbox", subtitle: "Bugün ilgilenmeniz gerekenler" },
  passport: {
    title: "Health Passport",
    subtitle: "Doğrulanmış sağlık profiliniz",
  },
  documents: {
    title: "Belgeler",
    subtitle: "İçe aktarma, çıkarım ve doğrulama",
  },
  review: {
    title: "İnceleme Kutusu",
    subtitle: "Belirsiz, çelişkili ve kritik sağlık gerçekleri",
  },
  timeline: {
    title: "Timeline",
    subtitle: "Sağlık geçmişinizin birleşik zaman çizelgesi",
  },
  labs: { title: "Labs", subtitle: "Kişisel bazal, trend ve değişim analizi" },
  medications: {
    title: "Medications",
    subtitle: "İlaç geçmişi, uyum ve etkileşimler",
  },
  cases: {
    title: "Cases & Chat",
    subtitle: "Güvenli ve yapılandırılmış sağlık görüşmesi",
  },
  research: {
    title: "Research",
    subtitle: "Kaynaklı derin araştırma ve kanıt haritası",
  },
  council: {
    title: "AI Council",
    subtitle: "Ölçülen anlaşmazlıkla tırmanan uzman ajanlar",
  },
  probabilities: {
    title: "Probabilities",
    subtitle: "Şeffaf differential matrix ve risk önceliği",
  },
  reports: {
    title: "Reports",
    subtitle: "Doktor görüşmesine hazır, kaynaklı raporlar",
  },
  outcomes: {
    title: "Outcomes",
    subtitle: "Hekim sonucu ve takip geri bildirimi",
  },
  providers: {
    title: "AI & Provider Connections",
    subtitle: "API, resmî hesap ve yerel model bağlantıları",
  },
  advanced: {
    title: "Treatment, Nutrition & What‑if",
    subtitle: "Kanıt kapıları arkasındaki gelişmiş modüller",
  },
};

function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return (
    <UiBadge variant="secondary" className={`badge badge-${tone}`}>
      {children}
    </UiBadge>
  );
}

function IconButton({
  label,
  children,
  onClick,
}: {
  label: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="icon-button"
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function PageHeading({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <header className="page-heading">
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions ? <div className="heading-actions">{actions}</div> : null}
    </header>
  );
}

function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow ? <span>{eyebrow}</span> : null}
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  );
}

function MetricCard({
  icon: Icon,
  value,
  label,
  detail,
  tone = "teal",
  onClick,
}: {
  icon: LucideIcon;
  value: string;
  label: string;
  detail: string;
  tone?: string;
  onClick?: () => void;
}) {
  return (
    <button className={`metric-card metric-${tone}`} onClick={onClick}>
      <span className="metric-icon">
        <Icon size={19} />
      </span>
      <span className="metric-copy">
        <small>{label}</small>
        <strong>{value}</strong>
        <span>{detail}</span>
      </span>
      <ChevronRight size={17} className="metric-arrow" />
    </button>
  );
}

function HealthInbox({ navigate }: { navigate: (view: AppView) => void }) {
  const [ask, setAsk] = useState("");
  return (
    <div className="screen dashboard-screen">
      <section className="welcome-panel">
        <div className="welcome-copy">
          <Badge tone="green">
            <ShieldCheck size={13} /> Yerel sağlık çalışma alanı
          </Badge>
          <h1>Günaydın, Deniz.</h1>
          <p>
            Sağlık geçmişiniz güncel. Bugün doğrulamanız gereken bir kritik
            çelişki ve yanıt bekleyen bir vaka var.
          </p>
          <div className="ask-bar">
            <Sparkles size={19} />
            <input
              aria-label="Sağlığınız hakkında yazın"
              value={ask}
              onChange={(event) => setAsk(event.target.value)}
              placeholder="Sağlığınız hakkında ne konuşmak istersiniz?"
            />
            <button onClick={() => navigate("cases")}>
              <Send size={17} /> Yeni vaka başlat
            </button>
          </div>
          <div className="prompt-chips">
            <button onClick={() => navigate("labs")}>
              Son laboratuvarımda ne değişti?
            </button>
            <button onClick={() => navigate("cases")}>
              Karın ağrımı değerlendirelim
            </button>
            <button onClick={() => navigate("reports")}>
              Doktor özeti hazırla
            </button>
          </div>
        </div>
        <div className="health-score-card">
          <div
            className="score-ring"
            style={
              { "--score": `${patient.completeness * 3.6}deg` } as CSSProperties
            }
          >
            <span>
              <strong>{patient.completeness}</strong>
              <small>%</small>
            </span>
          </div>
          <div>
            <small>HEALTH PASSPORT</small>
            <strong>Profiliniz güçlü</strong>
            <p>5 alan daha doğrulanırsa tam analiz kapsamına ulaşacak.</p>
          </div>
          <button onClick={() => navigate("passport")}>
            Profili tamamla <ArrowRight size={15} />
          </button>
        </div>
      </section>

      <div className="metrics-grid four">
        <MetricCard
          icon={AlertTriangle}
          value="1"
          label="Kritik inceleme"
          detail="Çelişkili CRP"
          tone="red"
          onClick={() => navigate("documents")}
        />
        <MetricCard
          icon={Activity}
          value="−42%"
          label="Ferritin değişimi"
          detail="119 günlük trend"
          tone="orange"
          onClick={() => navigate("labs")}
        />
        <MetricCard
          icon={MessageCircle}
          value="1"
          label="Aktif vaka"
          detail="3 soru bekliyor"
          tone="blue"
          onClick={() => navigate("cases")}
        />
        <MetricCard
          icon={CalendarDays}
          value="12 gün"
          label="Takip bekliyor"
          detail="Migren outcome"
          tone="purple"
          onClick={() => navigate("outcomes")}
        />
      </div>

      <div className="dashboard-columns">
        <section className="card attention-card">
          <SectionHeading
            eyebrow="ÖNCELİKLİ AKIŞ"
            title="Bugün ilgilenmeniz gerekenler"
            action={
              <button className="text-button">
                Tümünü gör <ArrowRight size={14} />
              </button>
            }
          />
          <div className="attention-list">
            {inboxItems.map((item, index) => (
              <button
                key={item.id}
                className="attention-item"
                onClick={() => navigate(item.target)}
              >
                <span className={`attention-index tone-${item.tone}`}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="attention-main">
                  <small>{item.eyebrow}</small>
                  <strong>{item.title}</strong>
                  <span>{item.detail}</span>
                  <em>{item.meta}</em>
                </span>
                <span className="attention-action">
                  {item.action}
                  <ChevronRight size={16} />
                </span>
              </button>
            ))}
          </div>
        </section>

        <aside className="dashboard-rail">
          <section className="card next-visit-card">
            <div className="rail-icon">
              <Stethoscope size={21} />
            </div>
            <small>SONRAKİ GÖRÜŞME</small>
            <h3>Dahiliye kontrolü</h3>
            <p>18 Mart 2026 · 14:30</p>
            <div className="visit-progress">
              <span style={{ width: "72%" }} />
            </div>
            <strong>Rapor hazırlığı %72</strong>
            <button onClick={() => navigate("reports")}>
              Görüşme paketini aç
            </button>
          </section>
          <section className="card activity-card">
            <SectionHeading eyebrow="SON HAREKETLER" title="Yeni ne değişti?" />
            {timelineEvents.slice(0, 3).map((event) => (
              <div className="mini-event" key={event.id}>
                <span className={`event-dot event-${event.kind}`} />
                <div>
                  <strong>{event.title}</strong>
                  <small>
                    {event.date} · {event.source}
                  </small>
                </div>
              </div>
            ))}
            <button
              className="text-button"
              onClick={() => navigate("timeline")}
            >
              Timeline’ı aç <ArrowRight size={14} />
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}

function HealthPassport() {
  const profileSections = [
    {
      icon: AlertTriangle,
      title: "Alerjiler",
      value: "Penisilin",
      detail: "Döküntü · 2018 · Doğrulandı",
      tone: "red",
    },
    {
      icon: HeartPulse,
      title: "Aktif durumlar",
      value: "Hipotiroidi · Migren",
      detail: "2 aktif · 1 geçmiş durum",
      tone: "purple",
    },
    {
      icon: Pill,
      title: "Aktif ilaçlar",
      value: "3 ilaç",
      detail: "Son güncelleme 2 gün önce",
      tone: "blue",
    },
    {
      icon: Activity,
      title: "Yaşam tarzı",
      value: "Orta aktif",
      detail: "Uyku 7,1 sa · Sigara yok",
      tone: "green",
    },
  ];
  return (
    <div className="screen">
      <PageHeading
        eyebrow={`PATIENT STATE V${patient.stateVersion}`}
        title="Health Passport"
        description="Sağlık geçmişinizin doğrulanmış, sürümlü ve kaynak izlenebilir görünümü."
        actions={
          <>
            <button className="secondary-button">
              <Download size={16} /> JSON dışa aktar
            </button>
            <button className="primary-button">
              <Plus size={16} /> Bilgi ekle
            </button>
          </>
        }
      />
      <section className="passport-hero card">
        <div className="avatar large">{patient.initials}</div>
        <div className="passport-identity">
          <div>
            <h2>{patient.name}</h2>
            <Badge tone="green">
              <BadgeCheck size={13} /> Doğrulanmış demo profil
            </Badge>
          </div>
          <p>
            {patient.age} yaş · {patient.sex} · Profil {patient.id}
          </p>
          <span>Son güncelleme {patient.lastUpdate}</span>
        </div>
        <div className="passport-facts">
          <div>
            <small>Kan grubu</small>
            <strong>{patient.bloodType}</strong>
          </div>
          <div>
            <small>Boy / Kilo</small>
            <strong>
              {patient.height} / {patient.weight}
            </strong>
          </div>
          <div>
            <small>VKI</small>
            <strong>{patient.bmi}</strong>
          </div>
          <div>
            <small>Profil bütünlüğü</small>
            <strong>%{patient.completeness}</strong>
          </div>
        </div>
      </section>
      <div className="passport-layout">
        <div className="passport-main">
          <div className="profile-grid">
            {profileSections.map(({ icon: Icon, ...item }) => (
              <article className="card profile-card" key={item.title}>
                <span className={`profile-icon tone-${item.tone}`}>
                  <Icon size={19} />
                </span>
                <div>
                  <small>{item.title}</small>
                  <strong>{item.value}</strong>
                  <p>{item.detail}</p>
                </div>
                <ChevronRight size={17} />
              </article>
            ))}
          </div>
          <section className="card detail-card">
            <SectionHeading
              eyebrow="KLİNİK ÖZET"
              title="Sağlık geçmişi"
              action={<button className="text-button">Düzenle</button>}
            />
            <div className="detail-rows">
              <div>
                <span>Geçmiş ameliyatlar</span>
                <strong>Apendektomi · 2012</strong>
                <Badge tone="green">Doğrulandı</Badge>
              </div>
              <div>
                <span>Aile öyküsü</span>
                <strong>Anne: Tip 2 diyabet</strong>
                <Badge tone="amber">Kullanıcı bildirimi</Badge>
              </div>
              <div>
                <span>Aşılar</span>
                <strong>8 kayıt · Son: İnfluenza 2025</strong>
                <Badge tone="green">Güncel</Badge>
              </div>
              <div>
                <span>Sağlık hedefi</span>
                <strong>
                  Demir depolarını ve enerji düzeyini iyileştirmek
                </strong>
                <Badge tone="blue">Aktif</Badge>
              </div>
            </div>
          </section>
        </div>
        <aside className="passport-side">
          <section className="card confidence-card">
            <SectionHeading eyebrow="VERİ GÜVENİ" title="Trust katmanları" />
            <div className="confidence-donut">
              <span>
                <strong>86%</strong>
                <small>doğrulanmış</small>
              </span>
            </div>
            <ul>
              <li>
                <i className="dot verified" /> Doğrulanmış <strong>74</strong>
              </li>
              <li>
                <i className="dot extracted" /> Yüksek güvenli çıkarım{" "}
                <strong>8</strong>
              </li>
              <li>
                <i className="dot uncertain" /> Belirsiz <strong>3</strong>
              </li>
              <li>
                <i className="dot conflicted" /> Çelişkili <strong>1</strong>
              </li>
            </ul>
          </section>
          <section className="card missing-card">
            <div>
              <HelpCircle size={19} />
              <strong>Eksik kritik bilgiler</strong>
            </div>
            <p>
              Acil durumda kullanılacak kişi ve son tetanoz tarihi henüz
              eklenmedi.
            </p>
            <button>Bilgileri tamamla</button>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Documents({
  notify,
  navigate,
}: {
  notify: (message: string) => void;
  navigate: (view: AppView) => void;
}) {
  const [uploaded, setUploaded] = useState(false);
  return (
    <div className="screen">
      <PageHeading
        eyebrow="LOCAL-FIRST DOCUMENT PIPELINE"
        title="Sağlık belgeleri"
        description="PDF, JPG ve PNG dosyalarını yerel olarak içe aktarın; çıkarılan alanları kaynağıyla doğrulayın."
        actions={
          <button
            className="primary-button"
            onClick={() => {
              setUploaded(true);
              notify("Sentetik belge demo kuyruğuna eklendi.");
            }}
          >
            <UploadCloud size={17} /> Belge yükle
          </button>
        }
      />
      <section className={`upload-zone ${uploaded ? "upload-success" : ""}`}>
        <span className="upload-icon">
          {uploaded ? <FileCheck2 size={28} /> : <UploadCloud size={28} />}
        </span>
        <div>
          <h3>
            {uploaded
              ? "Sentetik belge kuyruğa alındı"
              : "Belgelerinizi buraya bırakın"}
          </h3>
          <p>
            {uploaded
              ? "OCR → çıkarım → tekilleştirme → inceleme akışı başlatıldı."
              : "PDF, JPG veya PNG · Ham belge varsayılan olarak cloud’a gönderilmez."}
          </p>
        </div>
        <button className="secondary-button" onClick={() => setUploaded(true)}>
          Dosya seç
        </button>
        <Badge tone="green">
          <LockKeyhole size={13} /> Bu cihazda işlenir
        </Badge>
      </section>
      <section className="pipeline card">
        <div className="pipeline-step complete">
          <Check size={15} />
          <span>
            <small>01</small>
            <strong>İçe aktarma</strong>
            <em>Hash + metadata</em>
          </span>
        </div>
        <ArrowRight size={17} />
        <div className="pipeline-step complete">
          <Check size={15} />
          <span>
            <small>02</small>
            <strong>Yerel OCR</strong>
            <em>Layout-aware</em>
          </span>
        </div>
        <ArrowRight size={17} />
        <div className="pipeline-step active">
          <RefreshCcw size={15} />
          <span>
            <small>03</small>
            <strong>Entity resolution</strong>
            <em>Canonical eşleme</em>
          </span>
        </div>
        <ArrowRight size={17} />
        <div className="pipeline-step">
          <Clock3 size={15} />
          <span>
            <small>04</small>
            <strong>İnsan incelemesi</strong>
            <em>Trust tier</em>
          </span>
        </div>
      </section>
      <section className="card table-card">
        <SectionHeading
          eyebrow="BELGE ARŞİVİ"
          title="Tüm belgeler"
          action={
            <div className="table-actions">
              <button>
                <Filter size={15} /> Filtrele
              </button>
              <button>
                <Search size={15} /> Ara
              </button>
            </div>
          }
        />
        <div className="document-table">
          <div className="table-head">
            <span>Belge</span>
            <span>Tarih</span>
            <span>Çıkarılan veri</span>
            <span>Durum</span>
            <span />
          </div>
          {documents.map((doc) => (
            <div className="document-row" key={doc.id}>
              <div className="document-name">
                <span className="file-type">PDF</span>
                <div>
                  <strong>{doc.name}</strong>
                  <small>
                    {doc.type} · {doc.pages} sayfa · {doc.id}
                  </small>
                </div>
              </div>
              <span>{doc.date}</span>
              <div className="fact-progress">
                <strong>{doc.facts} gerçek</strong>
                <span>
                  <i style={{ width: `${doc.progress}%` }} />
                </span>
              </div>
              <Badge tone={doc.status === "Doğrulandı" ? "green" : "amber"}>
                {doc.status}
              </Badge>
              <IconButton label="Belge seçenekleri">
                <MoreHorizontal size={17} />
              </IconButton>
            </div>
          ))}
        </div>
      </section>
      <section className="review-strip">
        <AlertTriangle size={20} />
        <div>
          <strong>1 kritik çelişki inceleme bekliyor</strong>
          <p>
            CRP için iki farklı değer aynı tarih ve kaynak grubunda bulundu.
            Birleştirme durduruldu.
          </p>
        </div>
        <button onClick={() => navigate("review")}>
          İnceleme Kutusu’nu aç <ArrowRight size={15} />
        </button>
      </section>
    </div>
  );
}

function ReviewInbox({ notify }: { notify: (message: string) => void }) {
  const [resolved, setResolved] = useState<string[]>([]);
  const items = [
    {
      id: "crp",
      priority: "Kritik çelişki",
      tone: "red",
      title: "CRP sonucu eşleşmiyor",
      detail:
        "Aynı tarih için 4,2 mg/L ve 42 mg/L çıkarıldı. Ondalık ayracı veya OCR hatası olabilir.",
      sourceA: "Lab_Sonuclari_2026.pdf · s.2",
      sourceB: "e-Nabız_Export.pdf · s.18",
    },
    {
      id: "allergy",
      priority: "Kimlik çözümleme",
      tone: "amber",
      title: "İlaç alerjisi doğrulanmalı",
      detail:
        "‘Penisilin?’ ifadesi hekim notunda belirsiz olarak geçiyor; hasta beyanıyla doğrulanmadan aktif alerjiye eklenmez.",
      sourceA: "Dahiliye_Epikriz.pdf · s.1",
      sourceB: "Hasta anketi · eksik",
    },
    {
      id: "ferritin",
      priority: "Birim kontrolü",
      tone: "blue",
      title: "Ferritin birimi normalize edildi",
      detail:
        "µg/L ve ng/mL sayısal olarak eşdeğer. Deterministik dönüştürme önerisi onay bekliyor.",
      sourceA: "Lab_2025-10.pdf · s.1",
      sourceB: "UCUM eşleme tablosu v1.4",
    },
  ];
  const pending = items.filter((item) => !resolved.includes(item.id));
  return (
    <div className="screen">
      <PageHeading
        eyebrow="HUMAN-IN-THE-LOOP REVIEW"
        title="İnceleme Kutusu"
        description="Model çıkarımı sağlık gerçeği değildir. Belirsiz ve çelişkili alanlar onaylanmadan Health Passport’a yazılmaz."
        actions={
          <Badge tone="amber">
            <AlertTriangle size={13} /> {pending.length} karar bekliyor
          </Badge>
        }
      />
      <div className="review-stats">
        <MetricCard
          icon={AlertTriangle}
          value={String(pending.length)}
          label="Bekleyen"
          detail="1 kritik öncelik"
          tone="orange"
        />
        <MetricCard
          icon={BadgeCheck}
          value="26"
          label="Bu hafta onaylanan"
          detail="Tam kaynak iziyle"
          tone="teal"
        />
        <MetricCard
          icon={History}
          value="100%"
          label="Geri alınabilir"
          detail="Append-only olay günlüğü"
          tone="blue"
        />
      </div>
      <div className="review-workspace">
        <section className="review-queue">
          {pending.length ? (
            pending.map((item) => (
              <article className="card review-card" key={item.id}>
                <header>
                  <Badge tone={item.tone}>{item.priority}</Badge>
                  <small>
                    Çıkarım güveni: %
                    {item.id === "crp"
                      ? "58"
                      : item.id === "allergy"
                        ? "64"
                        : "96"}
                  </small>
                </header>
                <h2>{item.title}</h2>
                <p>{item.detail}</p>
                <div className="source-compare">
                  <button>
                    <FileSearch size={16} />
                    <span>
                      <small>KAYNAK A</small>
                      <strong>{item.sourceA}</strong>
                    </span>
                  </button>
                  <button>
                    <Link2 size={16} />
                    <span>
                      <small>KAYNAK B</small>
                      <strong>{item.sourceB}</strong>
                    </span>
                  </button>
                </div>
                <footer>
                  <button
                    className="secondary-button"
                    onClick={() => notify("Alan düzenleme paneli açıldı.")}
                  >
                    Alanı düzenle
                  </button>
                  <button
                    className="secondary-button"
                    onClick={() => setResolved((value) => [...value, item.id])}
                  >
                    <X size={15} /> Reddet
                  </button>
                  <button
                    className="primary-button"
                    onClick={() => {
                      setResolved((value) => [...value, item.id]);
                      notify(
                        "Karar olay günlüğüne kaydedildi ve Health Passport güncellendi.",
                      );
                    }}
                  >
                    <Check size={15} /> Öneriyi onayla
                  </button>
                </footer>
              </article>
            ))
          ) : (
            <section className="card empty-review">
              <CheckCircle2 size={34} />
              <h2>İnceleme kutusu temiz</h2>
              <p>
                Tüm çıkarımlar karara bağlandı. Her karar olay günlüğünde geri
                alınabilir.
              </p>
            </section>
          )}
        </section>
        <aside className="card review-rules">
          <SectionHeading eyebrow="TRUST POLICY" title="Yazma kuralları" />
          <div>
            <ShieldCheck size={17} />
            <p>
              <strong>Kritik alanlar</strong>İnsan onayı olmadan kan grubu,
              alerji, ilaç ve tanı listesine yazılmaz.
            </p>
          </div>
          <div>
            <Database size={17} />
            <p>
              <strong>Kaynak zorunluluğu</strong>Her değer belge, sayfa ve metin
              bölgesiyle izlenir.
            </p>
          </div>
          <div>
            <History size={17} />
            <p>
              <strong>Geçmiş korunur</strong>Düzeltmeler önceki değeri silmez;
              yeni olay üretir.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function TimelineScreen() {
  const [filter, setFilter] = useState("Tümü");
  const kindLabel: Record<string, string> = {
    lab: "Laboratuvar",
    medication: "İlaç",
    symptom: "Belirti",
    visit: "Görüşme",
    document: "Belge",
  };
  return (
    <div className="screen">
      <PageHeading
        eyebrow="APPEND-ONLY PATIENT EVENT STORE"
        title="Birleşik Timeline"
        description="Belirti, ilaç, laboratuvar ve görüşme olayları kaynaklarıyla birlikte; geçmiş kayıtların üzerine yazılmaz."
        actions={
          <button className="secondary-button">
            <CalendarDays size={16} /> Tarih aralığı
          </button>
        }
      />
      <div className="filter-tabs">
        {["Tümü", "Laboratuvar", "İlaç", "Belirti", "Görüşme", "Belge"].map(
          (item) => (
            <button
              className={filter === item ? "active" : ""}
              onClick={() => setFilter(item)}
              key={item}
            >
              {item}
            </button>
          ),
        )}
      </div>
      <div className="timeline-layout">
        <section className="card timeline-card">
          <div className="timeline-month">
            <span>2026</span>
            <strong>Şubat</strong>
          </div>
          <div className="timeline-list">
            {timelineEvents
              .filter(
                (event) =>
                  filter === "Tümü" || kindLabel[event.kind] === filter,
              )
              .map((event) => (
                <article className="timeline-event" key={event.id}>
                  <time>{event.date}</time>
                  <div className={`timeline-pin event-${event.kind}`}>
                    {event.kind === "lab" ? (
                      <Beaker size={15} />
                    ) : event.kind === "medication" ? (
                      <Pill size={15} />
                    ) : event.kind === "symptom" ? (
                      <Activity size={15} />
                    ) : event.kind === "visit" ? (
                      <Stethoscope size={15} />
                    ) : (
                      <FileText size={15} />
                    )}
                  </div>
                  <div className="timeline-content">
                    <div>
                      <Badge
                        tone={event.trust === "Doğrulandı" ? "green" : "amber"}
                      >
                        {event.trust}
                      </Badge>
                      <span>{kindLabel[event.kind]}</span>
                    </div>
                    <h3>{event.title}</h3>
                    <p>{event.detail}</p>
                    <button>
                      <Link2 size={13} /> {event.source}
                    </button>
                  </div>
                </article>
              ))}
          </div>
        </section>
        <aside className="timeline-insight">
          <section className="card">
            <SectionHeading
              eyebrow="TEMPORAL ENGINE"
              title="Bu dönemde ne değişti?"
            />
            <div className="insight-item">
              <TrendingDown size={18} />
              <div>
                <strong>Ferritin azalıyor</strong>
                <p>Son 119 günde −%41,9. Kişisel bazalın altında.</p>
              </div>
            </div>
            <div className="insight-item">
              <Pill size={18} />
              <div>
                <strong>Takviye yeniden başlandı</strong>
                <p>Son düşük ölçümden 6 gün sonra.</p>
              </div>
            </div>
            <div className="insight-item">
              <Activity size={18} />
              <div>
                <strong>Yeni semptom vakası</strong>
                <p>Ferritin ölçümünden 13 gün önce açıldı.</p>
              </div>
            </div>
            <button>
              İlişki haritasını aç <Network size={15} />
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Labs() {
  const [selected, setSelected] = useState("Ferritin");
  return (
    <div className="screen">
      <PageHeading
        eyebrow="DETERMINISTIC LAB INTELLIGENCE · LAB-LINEAR-V1"
        title="Laboratuvar zekâsı"
        description="Orijinal sonuç korunur; birim, referans, kişisel bazal ve trend hesapları sürümlü kodla üretilir."
        actions={
          <>
            <button className="secondary-button">
              <Filter size={16} /> Filtrele
            </button>
            <button className="primary-button">
              <Plus size={16} /> Sonuç ekle
            </button>
          </>
        }
      />
      <div className="metrics-grid four">
        <MetricCard
          icon={TestTubes}
          value="42"
          label="Takip edilen test"
          detail="5 panelde"
          tone="blue"
        />
        <MetricCard
          icon={TrendingDown}
          value="2"
          label="Dikkat gereken trend"
          detail="Ferritin · D vitamini"
          tone="orange"
        />
        <MetricCard
          icon={AlertTriangle}
          value="1"
          label="Delta-check"
          detail="CRP çelişkisi"
          tone="red"
        />
        <MetricCard
          icon={BadgeCheck}
          value="91%"
          label="Doğrulama oranı"
          detail="38/42 sonuç"
          tone="teal"
        />
      </div>
      <div className="labs-layout">
        <section className="card lab-chart-card">
          <SectionHeading
            eyebrow="KİŞİSEL BAZAL KARŞILAŞTIRMASI"
            title={`${selected} trendi`}
            action={
              <select
                aria-label="Laboratuvar seç"
                value={selected}
                onChange={(event) => setSelected(event.target.value)}
              >
                {labRows.map((row) => (
                  <option key={row.test}>{row.test}</option>
                ))}
              </select>
            }
          />
          <div className="chart-summary">
            <div>
              <small>SON DEĞER</small>
              <strong>
                18 <em>ng/mL</em>
              </strong>
              <Badge tone="amber">
                <ArrowDown size={12} /> Bazalın %42 altında
              </Badge>
            </div>
            <div className="chart-stat">
              <small>119 günlük değişim</small>
              <strong>−13 ng/mL</strong>
            </div>
            <div className="chart-stat">
              <small>Lineer eğim</small>
              <strong>−0,109 / gün</strong>
            </div>
            <div className="chart-stat">
              <small>Referans</small>
              <strong>13–150 ng/mL</strong>
            </div>
          </div>
          <div className="lab-chart">
            <div className="chart-y">
              <span>40</span>
              <span>30</span>
              <span>20</span>
              <span>10</span>
            </div>
            <div className="chart-surface">
              <i className="range-band" />
              <svg viewBox="0 0 800 230" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="labArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#377d72" stopOpacity=".28" />
                    <stop offset="1" stopColor="#377d72" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M20 46 C180 52 270 84 390 100 S610 145 780 180 L780 220 L20 220 Z"
                  fill="url(#labArea)"
                />
                <path
                  d="M20 46 C180 52 270 84 390 100 S610 145 780 180"
                  fill="none"
                  stroke="#226d64"
                  strokeWidth="4"
                />
                <circle cx="20" cy="46" r="6" />
                <circle cx="390" cy="100" r="6" />
                <circle cx="780" cy="180" r="7" className="last-point" />
              </svg>
              <div className="chart-labels">
                <span>
                  Eki 2025
                  <br />
                  <b>31</b>
                </span>
                <span>
                  Ara 2025
                  <br />
                  <b>26</b>
                </span>
                <span>
                  Şub 2026
                  <br />
                  <b>18</b>
                </span>
              </div>
            </div>
          </div>
          <div className="formula-note">
            <ShieldCheck size={16} />
            <span>
              <strong>Hesap güvenli:</strong> 3 doğrulanmış Ferritin · aynı
              birim · serum numunesi · Çelişki yok
            </span>
            <button>Formülü ve girdileri gör</button>
          </div>
        </section>
        <aside className="card lab-context">
          <SectionHeading eyebrow="BAĞLAM" title="Bu sonuç neden önemli?" />
          <div className="context-block">
            <span className="context-icon amber">
              <TrendingDown size={18} />
            </span>
            <div>
              <strong>Kişisel bazal değişimi</strong>
              <p>
                Referans aralığında olsa bile kişinin önceki kararlı düzeyinden
                belirgin düşüş var.
              </p>
            </div>
          </div>
          <div className="context-block">
            <span className="context-icon blue">
              <Pill size={18} />
            </span>
            <div>
              <strong>İlaç zaman ilişkisi</strong>
              <p>Demir desteği önceki ölçümden 4 ay önce bırakılmış.</p>
            </div>
          </div>
          <div className="context-block">
            <span className="context-icon purple">
              <HelpCircle size={18} />
            </span>
            <div>
              <strong>Eksik veri</strong>
              <p>
                Transferrin satürasyonu ve total demir bağlama kapasitesi yok.
              </p>
            </div>
          </div>
          <button>Bu sonuçla vaka aç</button>
        </aside>
      </div>
      <section className="card table-card">
        <SectionHeading
          eyebrow="KANONİK GÖZLEMLER"
          title="Son laboratuvar sonuçları"
        />
        <div className="lab-table">
          <div className="table-head">
            <span>Test</span>
            <span>Sonuç</span>
            <span>Referans</span>
            <span>Değişim</span>
            <span>Durum</span>
            <span>Tarih</span>
          </div>
          {labRows.map((row) => (
            <button
              className="lab-row"
              key={row.test}
              onClick={() => setSelected(row.test)}
            >
              <div>
                <strong>{row.test}</strong>
                <small>{row.code}</small>
              </div>
              <strong>
                {row.value} <small>{row.unit}</small>
              </strong>
              <span>{row.range}</span>
              <span
                className={
                  row.delta.startsWith("+") ? "delta-up" : "delta-down"
                }
              >
                {row.delta}
              </span>
              <Badge
                tone={
                  row.tone === "danger"
                    ? "red"
                    : row.tone === "warning"
                      ? "amber"
                      : row.tone === "success"
                        ? "green"
                        : "neutral"
                }
              >
                {row.state}
              </Badge>
              <span>{row.date}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function Medications() {
  return (
    <div className="screen">
      <PageHeading
        eyebrow="MEDICATION INTELLIGENCE"
        title="İlaçlarım"
        description="Marka–etken madde eşlemesi, doz geçmişi, kullanım uyumu ve kaynaklı etkileşim kontrolü."
        actions={
          <button className="primary-button">
            <Plus size={16} /> İlaç ekle
          </button>
        }
      />
      <div className="medication-alert">
        <ShieldCheck size={21} />
        <div>
          <strong>
            Aktif ilaçlar arasında doğrulanmış ciddi etkileşim bulunmadı
          </strong>
          <p>
            Kontrol kapsamı: yapılandırılmış demo ilaç listesi · Kaynak kapsamı
            sınırlıdır; eczacı veya hekime danışın.
          </p>
        </div>
        <button>Kontrol kapsamı</button>
      </div>
      <section>
        <SectionHeading eyebrow="AKTİF TEDAVİLER" title="3 aktif ilaç" />
        <div className="med-grid">
          {medications.map((med) => (
            <article className={`card med-card med-${med.tone}`} key={med.name}>
              <div className="med-top">
                <span>
                  <Pill size={21} />
                </span>
                <Badge tone="green">Aktif</Badge>
                <IconButton label="İlaç seçenekleri">
                  <MoreHorizontal size={17} />
                </IconButton>
              </div>
              <h3>{med.name}</h3>
              <p>
                {med.brand} · {med.dose}
              </p>
              <div className="med-details">
                <div>
                  <Clock3 size={14} />
                  <span>
                    <small>Kullanım</small>
                    <strong>{med.schedule}</strong>
                  </span>
                </div>
                <div>
                  <CalendarDays size={14} />
                  <span>
                    <small>Başlangıç</small>
                    <strong>{med.since}</strong>
                  </span>
                </div>
                <div>
                  <Target size={14} />
                  <span>
                    <small>Neden</small>
                    <strong>{med.reason}</strong>
                  </span>
                </div>
              </div>
              <div className="adherence">
                <div>
                  <span>Kullanım uyumu</span>
                  <strong>%{med.adherence}</strong>
                </div>
                <span>
                  <i style={{ width: `${med.adherence}%` }} />
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
      <div className="two-column">
        <section className="card medication-timeline">
          <SectionHeading
            eyebrow="İLAÇ ZAMAN ÇİZELGESİ"
            title="Başlangıç, doz ve bırakma olayları"
          />
          <div className="med-history">
            <div>
              <time>16 Şub 2026</time>
              <span className="history-pin start" />
              <div>
                <Badge tone="green">Başlandı</Badge>
                <strong>Ferrous bisglycinate 25 mg</strong>
                <p>Düşen ferritin nedeniyle kullanıcı bildirimi</p>
              </div>
            </div>
            <div>
              <time>14 Eki 2025</time>
              <span className="history-pin stop" />
              <div>
                <Badge tone="red">Bırakıldı</Badge>
                <strong>Ferrous fumarate 100 mg</strong>
                <p>Gastrointestinal intolerans bildirildi</p>
              </div>
            </div>
            <div>
              <time>4 Nis 2024</time>
              <span className="history-pin dose" />
              <div>
                <Badge tone="blue">Doz değişti</Badge>
                <strong>Levotiroksin 25 → 50 mcg</strong>
                <p>Hekim planı · Epikriz kaynağı</p>
              </div>
            </div>
          </div>
        </section>
        <section className="card interaction-card">
          <SectionHeading
            eyebrow="BAĞLAM KONTROLÜ"
            title="Dikkat edilmesi gerekenler"
          />
          <div className="interaction-item">
            <Utensils size={18} />
            <div>
              <strong>Levotiroksin + demir</strong>
              <p>
                Birlikte alım emilimi etkileyebilir. Zamanlama için hekim/eczacı
                önerisi alın.
              </p>
              <Badge tone="amber">İzlem gerekli</Badge>
            </div>
          </div>
          <div className="interaction-item">
            <Activity size={18} />
            <div>
              <strong>Semptom ilişkisi</strong>
              <p>
                Yeni demir desteğinden sonra tolerans günlüğü henüz
                doldurulmadı.
              </p>
              <Badge tone="blue">Takip sorusu</Badge>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function CasesChat({ navigate }: { navigate: (view: AppView) => void }) {
  const [message, setMessage] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const questions = [
    "Ağrı tam olarak nerede?",
    "Ne zaman başladı?",
    "Ateş, kusma veya bayılma var mı?",
  ];
  return (
    <div className="screen cases-screen">
      <PageHeading
        eyebrow="CASE STATE · QUESTIONS_REQUIRED"
        title="Cases & Chat"
        description="Önce güvenlik kontrolü, sonra uyarlanabilir sorular; gerekli olduğunda araştırma ve konseye tırmanır."
        actions={
          <button className="primary-button">
            <Plus size={16} /> Yeni vaka
          </button>
        }
      />
      <div className="case-state-strip">
        {stateMachine.map((state, index) => (
          <div
            className={index < 3 ? "complete" : index === 3 ? "active" : ""}
            key={state}
          >
            <span>{index < 3 ? <Check size={12} /> : index + 1}</span>
            <small>{state}</small>
          </div>
        ))}
      </div>
      <div className="case-layout">
        <aside className="card case-list">
          <div className="case-list-head">
            <div>
              <small>AKTİF VAKALAR</small>
              <strong>2 vaka</strong>
            </div>
            <IconButton label="Vaka ara">
              <Search size={17} />
            </IconButton>
          </div>
          <button className="case-item active">
            <span className="case-icon orange">
              <Activity size={18} />
            </span>
            <div>
              <strong>Karın ağrısı ve şişkinlik</strong>
              <small>#HC-1042 · 3 soru bekliyor</small>
              <em>Dün · Güvenlik kontrolü tamamlandı</em>
            </div>
            <Badge tone="amber">Aktif</Badge>
          </button>
          <button className="case-item">
            <span className="case-icon purple">
              <BrainCircuit size={18} />
            </span>
            <div>
              <strong>Tekrarlayan baş ağrısı</strong>
              <small>#HC-1028 · Rapor hazır</small>
              <em>12 gün önce · Takip bekliyor</em>
            </div>
            <Badge tone="green">Takip</Badge>
          </button>
          <div className="case-archive">
            <History size={16} /> 4 kapalı vakayı göster
          </div>
        </aside>
        <main className="card chat-panel">
          <header className="chat-header">
            <div>
              <span className="case-icon orange">
                <Activity size={19} />
              </span>
              <div>
                <h2>Karın ağrısı ve şişkinlik</h2>
                <p>Vaka #HC-1042 · Patient State v31</p>
              </div>
            </div>
            <div>
              <Badge tone="green">
                <ShieldCheck size={13} /> Safety Gate geçti
              </Badge>
              <IconButton label="Vaka menüsü">
                <MoreHorizontal size={18} />
              </IconButton>
            </div>
          </header>
          <div className="safety-check">
            <ShieldCheck size={20} />
            <div>
              <strong>Acil kırmızı bayrak bildirilmedi</strong>
              <p>
                Bu kontrol acil durumu dışlamaz. Yeni veya şiddetli belirti
                olursa acil yardım alın.
              </p>
            </div>
            <button>Safety detayları</button>
          </div>
          <div className="chat-thread">
            <div className="message user-message">
              <div className="avatar small">DY</div>
              <div>
                <p>
                  Son birkaç gündür karnımın sağ tarafında ağrı ve çok şişkinlik
                  var. Bazen yemek yedikten sonra artıyor.
                </p>
                <small>Dün · 21:14</small>
              </div>
            </div>
            <div className="message ai-message">
              <div className="ai-avatar">
                <Sparkles size={17} />
              </div>
              <div>
                <p>
                  Önce acil riskleri kontrol ettim. Şu an verdiğiniz bilgilerde
                  belirgin bir kırmızı bayrak yok; yine de bunu kesin dışlama
                  olarak görmeyin. Araştırmadan önce üç kritik ayrıntıyı
                  netleştirelim.
                </p>
                <small>HealthCouncil · Safety-first</small>
              </div>
            </div>
            <div className="adaptive-questions">
              <div className="questions-head">
                <div>
                  <HelpCircle size={18} />
                  <span>
                    <strong>Uyarlanabilir sorular</strong>
                    <small>Yanıtlar araştırma kapsamını belirleyecek</small>
                  </span>
                </div>
                <Badge tone="blue">3 soru</Badge>
              </div>
              {questions.map((question, index) => (
                <button
                  className={answers.includes(question) ? "answered" : ""}
                  onClick={() =>
                    setAnswers((items) =>
                      items.includes(question) ? items : [...items, question],
                    )
                  }
                  key={question}
                >
                  <span>
                    {answers.includes(question) ? (
                      <Check size={14} />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <div>
                    <strong>{question}</strong>
                    <small>
                      {index === 0
                        ? "Ağrının yerini ayırmak için"
                        : index === 1
                          ? "Zaman ilişkisini kurmak için"
                          : "Acil güvenlik açısından zorunlu"}
                    </small>
                  </div>
                  <ChevronRight size={17} />
                </button>
              ))}
            </div>
          </div>
          <footer className="chat-composer">
            <div className="composer-tools">
              <button>
                <Plus size={16} /> Belge ekle
              </button>
              <button>
                <Microscope size={16} /> Patient State
              </button>
            </div>
            <div>
              <textarea
                aria-label="Vaka mesajı"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Yanıtınızı yazın veya durumunuzu anlatın…"
              />
              <button className="send-button" onClick={() => setMessage("")}>
                <Send size={18} />
              </button>
            </div>
            <small>
              Yapay zekâ yanılabilir. Klinik kararlar hekim değerlendirmesi
              gerektirir.
            </small>
          </footer>
        </main>
        <aside className="case-context">
          <section className="card">
            <SectionHeading
              eyebrow="VAKA BAĞLAMI"
              title="İlgili hasta verisi"
            />
            <div className="case-fact">
              <Beaker size={16} />
              <span>
                <small>Ferritin</small>
                <strong>18 ng/mL · düşüyor</strong>
              </span>
              <Badge tone="green">FACT</Badge>
            </div>
            <div className="case-fact">
              <AlertTriangle size={16} />
              <span>
                <small>CRP</small>
                <strong>Çelişkili kayıt</strong>
              </span>
              <Badge tone="red">BLOCK</Badge>
            </div>
            <div className="case-fact">
              <Pill size={16} />
              <span>
                <small>Aktif ilaç</small>
                <strong>3 kayıt</strong>
              </span>
              <Badge tone="green">FACT</Badge>
            </div>
            <button onClick={() => navigate("passport")}>
              Patient State’i aç
            </button>
          </section>
          <section className="card case-next">
            <small>SONRAKİ AŞAMA</small>
            <div className="next-icon">
              <FileSearch size={21} />
            </div>
            <h3>Research hazırlığı</h3>
            <p>
              Sorular tamamlandıktan sonra 4 araştırma sorusu oluşturulacak.
            </p>
            <button
              disabled={answers.length < 3}
              onClick={() => navigate("research")}
            >
              Araştırmaya geç <ArrowRight size={15} />
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Research() {
  const [running, setRunning] = useState(false);
  const progress = running ? 72 : 100;
  return (
    <div className="screen">
      <PageHeading
        eyebrow="EVIDENCE ENGINE · CLOSED-WORLD CITATION"
        title="Derin araştırma"
        description="Sorgu ağacı, lisans kontrolü, kaynak kalitesi ve iddia–kaynak ilişkisi tek akışta."
        actions={
          <button
            className="primary-button"
            onClick={() => setRunning(!running)}
          >
            {running ? (
              <>
                <X size={16} /> Çalışmayı durdur
              </>
            ) : (
              <>
                <RefreshCcw size={16} /> Araştırmayı yeniden çalıştır
              </>
            )}
          </button>
        }
      />
      <section className="research-run card">
        <div className="run-title">
          <span className={`run-orb ${running ? "pulse" : ""}`}>
            <FileSearch size={22} />
          </span>
          <div>
            <Badge tone={running ? "blue" : "green"}>
              {running ? "Araştırılıyor" : "Evidence ready"}
            </Badge>
            <h2>Ferritin düşüşü ve karın semptomları</h2>
            <p>Vaka #HC-1042 · Research snapshot RS-88</p>
          </div>
        </div>
        <div className="run-metrics">
          <div>
            <small>İlerleme</small>
            <strong>%{progress}</strong>
          </div>
          <div>
            <small>Kaynak</small>
            <strong>12</strong>
          </div>
          <div>
            <small>Doğrulanan iddia</small>
            <strong>9</strong>
          </div>
          <div>
            <small>Geçen süre</small>
            <strong>1:42</strong>
          </div>
        </div>
        <div className="run-progress">
          <span style={{ width: `${progress}%` }} />
        </div>
      </section>
      <div className="research-layout">
        <section className="card query-tree">
          <SectionHeading
            eyebrow="CANLI SORGU AĞACI"
            title="Araştırma soruları"
            action={<Badge tone="blue">4 dal · 11 sorgu</Badge>}
          />
          <div className="tree-root">
            <span>
              <Target size={16} />
            </span>
            <strong>
              Ferritin düşüşü ve gastrointestinal yakınmalar birlikte nasıl
              değerlendirilir?
            </strong>
          </div>
          <div className="tree-branches">
            <div className="tree-branch complete">
              <span>
                <Check size={13} />
              </span>
              <div>
                <strong>Demir eksikliği değerlendirmesi</strong>
                <small>4 PubMed sorgusu · 6 kaynak</small>
                <em>Prevalans · tanısal yaklaşım · eksik testler</em>
              </div>
            </div>
            <div className="tree-branch complete">
              <span>
                <Check size={13} />
              </span>
              <div>
                <strong>Gastrointestinal nedenler</strong>
                <small>3 kılavuz sorgusu · 4 kaynak</small>
                <em>Alarm bulguları · klinik değerlendirme</em>
              </div>
            </div>
            <div className="tree-branch active">
              <span>
                <RefreshCcw size={13} />
              </span>
              <div>
                <strong>İlaç ve emilim ilişkisi</strong>
                <small>2 resmî etiket sorgusu</small>
                <em>Levotiroksin · demir zamanlaması</em>
              </div>
            </div>
            <div className="tree-branch">
              <span>4</span>
              <div>
                <strong>Karşı kanıt taraması</strong>
                <small>Bekliyor</small>
                <em>Alternatif açıklamalar · disconfirming evidence</em>
              </div>
            </div>
          </div>
        </section>
        <aside className="card evidence-summary">
          <SectionHeading eyebrow="KNOWLEDGE PACK" title="Kanıt özeti" />
          <div className="evidence-score">
            <span>8.4</span>
            <div>
              <strong>Kanıt kalitesi</strong>
              <p>Yüksek · 3 kılavuz, 1 sistematik derleme</p>
            </div>
          </div>
          <div className="evidence-stat">
            <span>
              <CheckCircle2 size={16} /> Doğrulanan
            </span>
            <strong>9 iddia</strong>
          </div>
          <div className="evidence-stat">
            <span>
              <AlertTriangle size={16} /> Çelişen
            </span>
            <strong>2 iddia</strong>
          </div>
          <div className="evidence-stat">
            <span>
              <HelpCircle size={16} /> Eksik
            </span>
            <strong>4 veri alanı</strong>
          </div>
          <button>
            Patient Knowledge Pack’i aç <ArrowRight size={15} />
          </button>
        </aside>
      </div>
      <section className="card source-card-table">
        <SectionHeading
          eyebrow="DOĞRULANMIŞ KAYNAKLAR"
          title="Kaynak ve lisans kayıtları"
          action={
            <button className="text-button">
              Provenance graph <Network size={15} />
            </button>
          }
        />
        {researchSources.map((source) => (
          <article className="research-source" key={source.id}>
            <span className="source-rank">
              <BookOpen size={18} />
            </span>
            <div>
              <h3>{source.title}</h3>
              <p>
                {source.source} · {source.year} · {source.id}
              </p>
              <div>
                <Badge tone="green">
                  <BadgeCheck size={12} /> {source.status}
                </Badge>
                <Badge tone="blue">{source.quality} kalite</Badge>
                <Badge>{source.license}</Badge>
              </div>
            </div>
            <button>
              Kanıt pasajları <ChevronRight size={16} />
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}

function Council() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="screen">
      <PageHeading
        eyebrow="AUTO COUNCIL · RUN CR-42"
        title="AI Council"
        description="İki bağımsız sağlayıcıyla başlar; ölçülen anlaşmazlıkta üçüncü ajan ve karşı-kanıt ajanı devreye girer."
        actions={
          <>
            <button className="secondary-button">
              <Settings size={16} /> Konseyi düzenle
            </button>
            <button className="primary-button">
              <Zap size={16} /> Konseyi çalıştır
            </button>
          </>
        }
      />
      <section className="council-status card">
        <div className="council-orbit">
          <span className="orbit-center">
            <UsersRound size={22} />
          </span>
          <i className="agent-dot dot-a">G</i>
          <i className="agent-dot dot-b">S</i>
          <i className="agent-dot dot-c">C</i>
        </div>
        <div>
          <Badge tone="green">
            <CheckCircle2 size={13} /> Sentez hazır
          </Badge>
          <h2>Ferritin düşüşü + karın yakınmaları</h2>
          <p>3 bağımsız görüş · 12 doğrulanmış kaynak · Patient State v31</p>
        </div>
        <div className="council-score">
          <small>KONSEY ANLAŞMASI</small>
          <strong>%74</strong>
          <span>
            <i style={{ width: "74%" }} />
          </span>
          <p>Orta–yüksek örtüşme</p>
        </div>
        <div className="council-cost">
          <div>
            <small>Süre</small>
            <strong>3 dk 06 sn</strong>
          </div>
          <div>
            <small>Tahmini maliyet</small>
            <strong>$0.42</strong>
          </div>
        </div>
      </section>
      <div className="agent-grid">
        {councilAgents.map((agent, index) => (
          <article
            className="card agent-card"
            style={{ "--agent": agent.color } as CSSProperties}
            key={agent.name}
          >
            <header>
              <span>{agent.initials}</span>
              <Badge tone={agent.status === "Tamamlandı" ? "green" : "blue"}>
                {agent.status}
              </Badge>
            </header>
            <h3>{agent.name}</h3>
            <p>{agent.provider}</p>
            <div>
              <span>
                <small>Rol</small>
                <strong>{agent.role}</strong>
              </span>
              <span>
                <small>Efor</small>
                <strong>{agent.effort}</strong>
              </span>
              <span>
                <small>Süre</small>
                <strong>{agent.duration}</strong>
              </span>
            </div>
            <button
              onClick={() => setExpanded(index === 2 ? !expanded : expanded)}
            >
              Ajan çıktısını gör <ChevronRight size={15} />
            </button>
          </article>
        ))}
      </div>
      <div className="council-results">
        <section className="card agreement-card">
          <SectionHeading
            eyebrow="AGREEMENT MATRIX"
            title="Ajanlar nerede birleşti?"
          />
          <div className="matrix-head">
            <span>Hipotez / bulgu</span>
            <span>Gemini</span>
            <span>Sol</span>
            <span>Claude</span>
            <span>Örtüşme</span>
          </div>
          {[
            ["Demir eksikliği", true, true, true, "3/3"],
            ["GI emilim sorunu", true, true, false, "2/3"],
            ["Fonksiyonel yakınma", true, false, true, "2/3"],
            ["IBD must-not-miss", false, true, true, "2/3"],
          ].map(([name, a, b, c, total]) => (
            <div className="matrix-row" key={String(name)}>
              <strong>{name}</strong>
              {[a, b, c].map((ok, index) => (
                <span className={ok ? "matrix-yes" : "matrix-no"} key={index}>
                  {ok ? <Check size={14} /> : <X size={14} />}
                </span>
              ))}
              <Badge tone={total === "3/3" ? "green" : "amber"}>{total}</Badge>
            </div>
          ))}
        </section>
        <aside className="card disagreement-card">
          <SectionHeading
            eyebrow="DISCONFIRMING AGENT"
            title="Ayrışılan noktalar"
          />
          <div className="disagreement">
            <AlertTriangle size={18} />
            <div>
              <strong>CRP kanıtı kullanılamaz</strong>
              <p>
                Kaynak çelişkisi çözülene kadar inflamasyon hipotezini
                güçlendirmemeli.
              </p>
            </div>
          </div>
          <div className="disagreement">
            <HelpCircle size={18} />
            <div>
              <strong>Eksik belirleyici veri</strong>
              <p>
                Transferrin satürasyonu ve kalprotektin sonucu fikri belirgin
                değiştirebilir.
              </p>
            </div>
          </div>
          <button onClick={() => setExpanded(!expanded)}>
            Tam anlaşmazlık analizini {expanded ? "kapat" : "aç"}
          </button>
        </aside>
      </div>
    </div>
  );
}

function Probabilities() {
  return (
    <div className="screen">
      <PageHeading
        eyebrow="DIFFERENTIAL MATRIX · TYPE A ESTIMATE"
        title="Olası açıklamalar"
        description="Hastalık adı ve risk önceliği önce; yüzdeler ikincil ve kalibrasyon durumu her zaman görünür."
        actions={
          <button className="secondary-button">
            <RefreshCcw size={16} /> Yeni veriyle güncelle
          </button>
        }
      />
      <section className="calibration-banner">
        <ShieldAlert size={22} />
        <div>
          <strong>
            Bu yüzdeler klinik olarak kalibre edilmiş olasılıklar değildir
          </strong>
          <p>
            Model ve araştırma tabanlı Tip A tahminleridir. Doktora gitmeyi
            ertelemek veya tedavi kararı vermek için kullanılamaz.
          </p>
        </div>
        <Badge tone="red">Kalibrasyon: Yok</Badge>
      </section>
      <section className="must-not-miss">
        <div>
          <AlertTriangle size={23} />
        </div>
        <div>
          <small>MUST-NOT-MISS · DÜŞÜK YÜZDE, YÜKSEK RİSK ÖNCELİĞİ</small>
          <h2>Akut veya ilerleyen abdominal durum</h2>
          <p>
            Şiddetlenen ağrı, ateş, tekrarlayan kusma, bayılma, kanama veya sert
            karın gelişirse yüzdeye bakmadan acil değerlendirme gerekir.
          </p>
        </div>
        <button>Acil belirtileri gör</button>
      </section>
      <div className="probability-list">
        {probabilityItems.map((item, index) => (
          <article className="card probability-card" key={item.name}>
            <div className="probability-rank">
              {String(index + 1).padStart(2, "0")}
            </div>
            <div className="probability-main">
              <div className="probability-title">
                <div>
                  <h2>{item.name}</h2>
                  <p>{item.calibration}</p>
                </div>
                <Badge
                  tone={
                    item.risk.includes("Yüksek")
                      ? "red"
                      : item.risk === "Orta"
                        ? "amber"
                        : "green"
                  }
                >
                  Risk önceliği: {item.risk}
                </Badge>
              </div>
              <div className="probability-meta">
                <span>
                  Kanıt düzeyi <strong>{item.evidence}</strong>
                </span>
                <span>
                  Konsey anlaşması <strong>{item.agreement}</strong>
                </span>
                <span>
                  Tahmin tipi <strong>Tip A</strong>
                </span>
              </div>
              <div className="evidence-columns">
                <div>
                  <strong>Destekleyen</strong>
                  {item.supports.map((fact) => (
                    <p key={fact}>
                      <Check size={13} /> {fact}
                    </p>
                  ))}
                </div>
                <div>
                  <strong>Karşı çıkan</strong>
                  {item.against.map((fact) => (
                    <p key={fact}>
                      <X size={13} /> {fact}
                    </p>
                  ))}
                </div>
                <div>
                  <strong>Eksik / fikri değiştirir</strong>
                  <p>
                    <HelpCircle size={13} /> {item.missing}
                  </p>
                </div>
              </div>
              <button>
                Bu neden burada? <Network size={15} />
              </button>
            </div>
            <div className="estimate">
              <span
                className="estimate-ring"
                style={
                  { "--estimate": `${item.estimate * 3.6}deg` } as CSSProperties
                }
              >
                <strong>%{item.estimate}</strong>
              </span>
              <small>
                AI araştırma
                <br />
                tahmini
              </small>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function Reports({ notify }: { notify: (message: string) => void }) {
  return (
    <div className="screen">
      <PageHeading
        eyebrow="REPORT CENTER · ANALYSIS MANIFEST"
        title="Raporlar"
        description="Doktor özeti, ayrıntılı klinik rapor, sade açıklama ve kaynak ekini aynı snapshot’tan üretin."
        actions={
          <>
            <button
              className="secondary-button"
              onClick={() => notify("JSON dışa aktarma demo akışı hazırlandı.")}
            >
              <Download size={16} /> JSON
            </button>
            <button
              className="primary-button"
              onClick={() =>
                notify(
                  "PDF önizleme oluşturuldu; imzalı export Gate 6’da açılacak.",
                )
              }
            >
              <FileText size={16} /> PDF oluştur
            </button>
          </>
        }
      />
      <div className="report-layout">
        <aside className="report-nav card">
          <small>RAPOR BÖLÜMLERİ</small>
          {[
            "Bir sayfalık doktor özeti",
            "Ayrıntılı klinik rapor",
            "Kullanıcı dostu açıklama",
            "Kaynak & provenance eki",
            "Analysis Manifest",
          ].map((item, index) => (
            <button className={index === 0 ? "active" : ""} key={item}>
              <span>{index + 1}</span>
              {item}
              <ChevronRight size={15} />
            </button>
          ))}
          <div className="snapshot-card">
            <LockKeyhole size={18} />
            <div>
              <strong>Dondurulmuş snapshot</strong>
              <p>
                Patient State v31
                <br />
                Case State v12 · RS-88
              </p>
            </div>
          </div>
        </aside>
        <article className="report-preview">
          <header>
            <div className="report-brand">
              <span>
                <HeartPulse size={20} />
              </span>
              <div>
                <strong>HealthCouncil</strong>
                <small>CLINICIAN BRIEF · SYNTHETIC</small>
              </div>
            </div>
            <div>
              <Badge tone="amber">Taslak · Hekim incelemesi gerekir</Badge>
              <small>Rapor #R-2026-021</small>
            </div>
          </header>
          <section className="report-patient">
            <div>
              <small>HASTA</small>
              <strong>{patient.name}</strong>
              <p>
                {patient.age} yaş · {patient.sex} · {patient.bloodType}
              </p>
            </div>
            <div>
              <small>BAŞVURU NEDENİ</small>
              <strong>Karın ağrısı ve şişkinlik</strong>
              <p>5 gündür · aralıklı · yemek sonrası artış</p>
            </div>
            <div>
              <small>RAPOR TARİHİ</small>
              <strong>14 Ağustos 2026</strong>
              <p>Patient State v31</p>
            </div>
          </section>
          <section className="report-section">
            <h3>Situation</h3>
            <p>
              Sağ alt abdominal bölgede aralıklı ağrı ve yemek sonrası
              şişkinlik. Kullanıcı tarafından ateş, tekrarlayan kusma, bayılma
              veya belirgin kanama bildirilmedi.
            </p>
          </section>
          <section className="report-section">
            <h3>Background</h3>
            <div className="report-facts">
              <p>
                <b>Aktif durumlar:</b> Hipotiroidi, migren
              </p>
              <p>
                <b>İlaçlar:</b> Levotiroksin 50 mcg, demir 25 mg, gerektiğinde
                sumatriptan
              </p>
              <p>
                <b>Alerji:</b> Penisilin — döküntü
              </p>
              <p>
                <b>Geçmiş:</b> Apendektomi (2012)
              </p>
            </div>
          </section>
          <section className="report-section">
            <h3>Assessment support</h3>
            <div className="report-callout">
              <TrendingDown size={18} />
              <div>
                <strong>Ferritin 31 → 18 ng/mL</strong>
                <p>
                  119 günde −%41,9 · kişisel bazalın altında · verified
                  FACT’lerden hesaplandı
                </p>
              </div>
            </div>
            <div className="report-callout danger">
              <AlertTriangle size={18} />
              <div>
                <strong>CRP çelişkisi çözülmedi</strong>
                <p>
                  7,2 ve 1,2 mg/L kaynakları; ilgili hassas hesaplar durduruldu.
                </p>
              </div>
            </div>
          </section>
          <section className="report-section">
            <h3>Doktora sorulacak sorular</h3>
            <ol>
              <li>Ferritin düşüşü için tam demir paneli uygun olur mu?</li>
              <li>
                Karın yakınmalarıyla ilaç zamanlaması arasında ilişki olabilir
                mi?
              </li>
              <li>
                Hangi alarm belirtilerinde daha erken değerlendirme gerekir?
              </li>
            </ol>
          </section>
          <footer>
            <div>
              <small>ANALYSIS MANIFEST</small>
              <code>PS:v31 · CS:v12 · RS:88 · policy:3.0 · schema:1.1</code>
            </div>
            <p>Bu belge tanı veya tedavi talimatı değildir.</p>
          </footer>
        </article>
        <aside className="report-side">
          <section className="card">
            <SectionHeading eyebrow="RAPOR HAZIRLIĞI" title="Tamlık kontrolü" />
            <div className="check-row complete">
              <Check size={14} />
              <span>Patient State snapshot</span>
            </div>
            <div className="check-row complete">
              <Check size={14} />
              <span>İlaç ve alerji listesi</span>
            </div>
            <div className="check-row complete">
              <Check size={14} />
              <span>Laboratuvar trendleri</span>
            </div>
            <div className="check-row warning">
              <AlertTriangle size={14} />
              <span>CRP çelişkisi açık</span>
            </div>
            <div className="check-row complete">
              <Check size={14} />
              <span>Kaynak varlık kontrolü</span>
            </div>
            <div className="report-readiness">
              <div>
                <span>Hazırlık</span>
                <strong>%88</strong>
              </div>
              <span>
                <i style={{ width: "88%" }} />
              </span>
            </div>
          </section>
          <section className="card">
            <SectionHeading eyebrow="GİZLİLİK" title="Rapora dahil edilenler" />
            <p className="privacy-line">
              <Check size={14} /> Yaş ve klinik bağlam
            </p>
            <p className="privacy-line">
              <Check size={14} /> İlgili doğrulanmış veriler
            </p>
            <p className="privacy-line excluded">
              <X size={14} /> T.C. kimlik numarası
            </p>
            <p className="privacy-line excluded">
              <X size={14} /> İlgisiz belgeler
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Outcomes() {
  return (
    <div className="screen">
      <PageHeading
        eyebrow="OUTCOME CAPTURE · DOCTOR COMPARE"
        title="Sonuçlar ve takip"
        description="Hekim sonucu, istenen testler ve uygulamanın etkisini ayrı rızayla kaydedin."
        actions={
          <button className="primary-button">
            <Plus size={16} /> Yeni sonuç ekle
          </button>
        }
      />
      <div className="metrics-grid four">
        <MetricCard
          icon={Stethoscope}
          value="3"
          label="Hekim görüşmesi"
          detail="2 sonuç tamam"
          tone="blue"
        />
        <MetricCard
          icon={ClipboardCheck}
          value="2"
          label="Outcome tamamlandı"
          detail="1 takip bekliyor"
          tone="teal"
        />
        <MetricCard
          icon={Target}
          value="67%"
          label="Örtüşme"
          detail="AI ↔ hekim"
          tone="purple"
        />
        <MetricCard
          icon={ShieldAlert}
          value="0"
          label="False reassurance"
          detail="Ciddi olay yok"
          tone="orange"
        />
      </div>
      <div className="outcome-layout">
        <section className="card outcome-form">
          <SectionHeading
            eyebrow="TAKİP BEKLİYOR"
            title="Migren görüşmesi · 2 Ağustos"
          />
          <div className="question-field">
            <label>Doktora gidildi mi?</label>
            <div className="choice-group">
              <button className="selected">Evet</button>
              <button>Hayır</button>
              <button>Randevu bekliyor</button>
            </div>
          </div>
          <div className="question-field">
            <label>Doktorun değerlendirmesi neydi?</label>
            <textarea placeholder="Hekimin söylediğini kendi sözlerinizle yazın…" />
          </div>
          <div className="form-grid">
            <div className="question-field">
              <label>Hangi testler istendi?</label>
              <input placeholder="MR, kan testi…" />
            </div>
            <div className="question-field">
              <label>Tedavide değişiklik oldu mu?</label>
              <input placeholder="İlaç / doz / izlem…" />
            </div>
          </div>
          <div className="question-field">
            <label>
              HealthCouncil nedeniyle doktora gitmeyi ertelediniz mi?
            </label>
            <div className="choice-group">
              <button>Hayır</button>
              <button>Evet</button>
              <button>Emin değilim</button>
            </div>
          </div>
          <div className="consent-row">
            <input type="checkbox" id="consent" />
            <label htmlFor="consent">
              Kimliksiz sonucu genel değerlendirme setine katkı için paylaşmayı
              ayrıca onaylıyorum.
            </label>
          </div>
          <button className="primary-button">Outcome’u kaydet</button>
        </section>
        <aside className="card doctor-compare">
          <SectionHeading
            eyebrow="OUTCOME ANALYSIS"
            title="AI ve hekim karşılaştırması"
          />
          <div className="compare-columns">
            <div>
              <small>AI DEĞERLENDİRMESİ</small>
              <Badge tone="purple">Migren</Badge>
              <Badge tone="neutral">Gerilim tipi</Badge>
              <Badge tone="neutral">İlaç ilişkili</Badge>
            </div>
            <ArrowRight size={19} />
            <div>
              <small>HEKİM SONUCU</small>
              <Badge tone="green">Migren</Badge>
            </div>
          </div>
          <div className="compare-result success">
            <CheckCircle2 size={18} />
            <div>
              <strong>Yakaladığı</strong>
              <p>Migren olasılığı ve nörolojik alarm bulgusu taraması.</p>
            </div>
          </div>
          <div className="compare-result warning">
            <AlertTriangle size={18} />
            <div>
              <strong>Kaçırdığı / eksik</strong>
              <p>
                Hekim uyku düzensizliğini ana tetikleyici olarak değerlendirdi.
              </p>
            </div>
          </div>
          <div className="compare-result info">
            <TestTubes size={18} />
            <div>
              <strong>Sonraki test</strong>
              <p>
                AI ve hekim ikisi de semptom günlüğü önerdi; ileri görüntüleme
                istenmedi.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Providers({ notify }: { notify: (message: string) => void }) {
  const [preview, setPreview] = useState(false);
  return (
    <div className="screen">
      <PageHeading
        eyebrow="MODEL ROUTER · CREDENTIAL MANAGER"
        title="AI ve sağlayıcı bağlantıları"
        description="API, resmî CLI/OAuth ve yerel endpoint bağlantılarını ayrı yönetin; abonelik API değildir."
        actions={
          <button className="secondary-button" onClick={() => setPreview(true)}>
            <Shield size={16} /> Privacy Preview
          </button>
        }
      />
      <section className="provider-summary card">
        <div>
          <span className="provider-summary-icon">
            <Network size={22} />
          </span>
          <div>
            <strong>2 sağlayıcı bağlı</strong>
            <p>
              Gemini Antigravity ve Claude Code · Son bağlantı testi bugün 18:42
            </p>
          </div>
        </div>
        <div>
          <Badge tone="green">
            <CheckCircle2 size={13} /> Hassas veri gönderilmedi
          </Badge>
          <button
            onClick={() =>
              notify(
                "Bağlantılar sentetik, hassas olmayan test istemiyle doğrulandı.",
              )
            }
          >
            <RefreshCcw size={15} /> Tümünü test et
          </button>
        </div>
      </section>
      <div className="provider-grid">
        {providers.map((provider) => (
          <article
            className={`card provider-card provider-${provider.tone}`}
            key={provider.id}
          >
            <header>
              <span className="provider-mark">{provider.mark}</span>
              <Badge
                tone={
                  provider.status === "Bağlı"
                    ? "green"
                    : provider.status === "Kullanılamıyor"
                      ? "neutral"
                      : "blue"
                }
              >
                {provider.status}
              </Badge>
            </header>
            <h3>{provider.name}</h3>
            <p>{provider.subtitle}</p>
            <div className="provider-auth">
              <KeyRound size={15} />
              <span>
                <small>Kimlik doğrulama</small>
                <strong>{provider.auth}</strong>
              </span>
            </div>
            <button
              disabled={provider.status === "Kullanılamıyor"}
              onClick={() =>
                provider.status === "Bağlı"
                  ? notify(`${provider.name} bağlantı ayarları açıldı.`)
                  : notify(
                      `${provider.name} için güvenli bağlantı sihirbazı açıldı.`,
                    )
              }
            >
              {provider.status === "Bağlı"
                ? "Bağlantıyı yönet"
                : provider.status === "Kullanılamıyor"
                  ? "Resmî entegrasyon bekleniyor"
                  : "Bağla"}
              <ChevronRight size={15} />
            </button>
          </article>
        ))}
      </div>
      <section className="routing-table card">
        <SectionHeading
          eyebrow="TASK ROUTER"
          title="Görev → model politikası"
          action={<button className="text-button">Politikayı düzenle</button>}
        />
        <div className="route-row">
          <span>
            <Microscope size={17} /> OCR ve PII temizliği
          </span>
          <strong>Yerel / deterministik</strong>
          <Badge tone="green">Cloud yok</Badge>
        </div>
        <div className="route-row">
          <span>
            <Search size={17} /> Sorgu ve makale tarama
          </span>
          <strong>Gemini 3.7 Flash</strong>
          <Badge tone="blue">Orta efor</Badge>
        </div>
        <div className="route-row">
          <span>
            <BrainCircuit size={17} /> Karmaşık klinik sentez
          </span>
          <strong>GPT‑5.6 Sol</strong>
          <Badge tone="purple">Yüksek efor</Badge>
        </div>
        <div className="route-row">
          <span>
            <ShieldAlert size={17} /> Bağımsız güvenlik görüşü
          </span>
          <strong>Claude + Safety Judge</strong>
          <Badge tone="red">Çok yüksek</Badge>
        </div>
      </section>
      {preview ? (
        <div className="drawer-backdrop" onClick={() => setPreview(false)}>
          <aside
            className="privacy-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Provider Privacy Preview"
            onClick={(event) => event.stopPropagation()}
          >
            <header>
              <div>
                <small>PROVIDER PRIVACY PREVIEW</small>
                <h2>OpenAI API’ye gönderilecekler</h2>
              </div>
              <IconButton label="Kapat" onClick={() => setPreview(false)}>
                <X size={19} />
              </IconButton>
            </header>
            <div className="privacy-provider">
              <span className="provider-mark">OA</span>
              <div>
                <strong>OpenAI Responses API</strong>
                <p>store:false · Patient Knowledge Pack</p>
              </div>
              <Badge tone="green">Minimum veri</Badge>
            </div>
            <section>
              <h3>Gönderilecek</h3>
              {[
                "Yaş aralığı (30–39)",
                "Doğrulanmış semptomlar",
                "İlgili laboratuvar sonuçları",
                "Aktif ilaçların etken maddeleri",
              ].map((item) => (
                <label className="privacy-toggle" key={item}>
                  <input type="checkbox" defaultChecked />
                  <span>
                    <Check size={13} />
                  </span>
                  {item}
                </label>
              ))}
            </section>
            <section>
              <h3>Gönderilmeyecek</h3>
              {[
                "Ad soyad",
                "T.C. kimlik numarası",
                "Hastane protokol numarası",
                "Adres ve iletişim",
                "Ham PDF ve ilgisiz belgeler",
              ].map((item) => (
                <div className="privacy-excluded" key={item}>
                  <X size={14} />
                  {item}
                </div>
              ))}
            </section>
            <div className="privacy-warning">
              <LockKeyhole size={17} />
              <p>
                Kimlik verileri yerel kasadan çıkmaz. Sağlayıcıya yalnız seçili
                alanlar gönderilir.
              </p>
            </div>
            <footer>
              <button
                className="secondary-button"
                onClick={() => setPreview(false)}
              >
                İptal
              </button>
              <button
                className="primary-button"
                onClick={() => {
                  setPreview(false);
                  notify(
                    "Gizlilik önizlemesi onaylandı; gerçek veri gönderilmedi.",
                  );
                }}
              >
                Seçimleri onayla
              </button>
            </footer>
          </aside>
        </div>
      ) : null}
    </div>
  );
}

function Advanced() {
  const modules = [
    {
      icon: Stethoscope,
      title: "Treatment Intelligence",
      subtitle:
        "Tedavi seçeneklerini kılavuz, kanıt ve kontrendikasyonlarla karşılaştırır.",
      gate: "Gate 2 + klinik doğrulama",
      color: "blue",
      items: [
        "Kılavuz önerileri",
        "İlaç–hasta uyumu",
        "Doktora sorulacak sorular",
      ],
    },
    {
      icon: Utensils,
      title: "Evidence-Based Nutrition",
      subtitle:
        "Hastalık, laboratuvar, ilaç ve tercihlere göre kaynaklı beslenme planı.",
      gate: "Gate 3 + kaynak lisansı",
      color: "green",
      items: [
        "İlaç–besin etkileşimi",
        "Alerji filtresi",
        "Uygulanabilir günlük plan",
      ],
    },
    {
      icon: FlaskConical,
      title: "What‑if Simulator",
      subtitle:
        "Yeni veya farklı bir verinin hipotezleri nasıl değiştireceğini karşı-olgusal gösterir.",
      gate: "Gate 4 + kalibrasyon",
      color: "purple",
      items: [
        "Fikri ne değiştirirdi?",
        "İlaç öncesi / sonrası",
        "Duyarlılık analizi",
      ],
    },
  ];
  return (
    <div className="screen">
      <PageHeading
        eyebrow="CAPABILITY-GATED ADVANCED MODULES"
        title="Treatment, Nutrition & What‑if"
        description="Planın gelişmiş modülleri tek uygulamada korunur; doğrulama kapıları geçmeden klinik talimat üretmez."
      />
      <section className="advanced-intro">
        <ShieldCheck size={23} />
        <div>
          <strong>Güvenlik kapıları etkin</strong>
          <p>
            Bu modüller reçete yazmaz, ilaç başlatmaz/kestirmez ve karşı-olgusal
            sonucu gerçek tanı gibi sunmaz.
          </p>
        </div>
        <button>Release gate durumları</button>
      </section>
      <div className="advanced-grid">
        {modules.map(({ icon: Icon, ...module }) => (
          <article
            className={`card advanced-card advanced-${module.color}`}
            key={module.title}
          >
            <div className="advanced-icon">
              <Icon size={25} />
            </div>
            <Badge tone="amber">
              <LockKeyhole size={12} /> {module.gate}
            </Badge>
            <h2>{module.title}</h2>
            <p>{module.subtitle}</p>
            <ul>
              {module.items.map((item) => (
                <li key={item}>
                  <Check size={14} />
                  {item}
                </li>
              ))}
            </ul>
            <button disabled>Doğrulama tamamlanınca açılacak</button>
          </article>
        ))}
      </div>
      <section className="card whatif-preview">
        <div>
          <Badge tone="purple">KARŞI-OLGUSAL ÖNİZLEME</Badge>
          <h2>“CRP doğrulanmış biçimde normal olsaydı ne değişirdi?”</h2>
          <p>
            Gerçek hasta sonucu değildir; yalnızca hipotez duyarlılığını
            göstermek için tasarım önizlemesi.
          </p>
        </div>
        <div className="whatif-bars">
          <div>
            <span>Demir eksikliği</span>
            <i>
              <b style={{ width: "68%" }} />
            </i>
            <strong>%68 → %68</strong>
          </div>
          <div>
            <span>Fonksiyonel yakınma</span>
            <i>
              <b style={{ width: "53%" }} />
            </i>
            <strong>%44 → %53</strong>
          </div>
          <div>
            <span>İnflamatuvar durum</span>
            <i>
              <b style={{ width: "8%" }} />
            </i>
            <strong>%18 → %8</strong>
          </div>
        </div>
      </section>
    </div>
  );
}

function Onboarding({ close }: { close: () => void }) {
  const [step, setStep] = useState(1);
  const steps = [
    "Güvenli başlangıç",
    "Veri & şifreleme",
    "AI bağlantıları",
    "İlk sağlık profili",
  ];
  return (
    <div className="onboarding-overlay">
      <div className="onboarding-shell">
        <aside>
          <div className="onboarding-logo">
            <span>
              <HeartPulse size={22} />
            </span>
            <strong>HealthCouncil</strong>
          </div>
          <div className="onboarding-steps">
            {steps.map((item, index) => (
              <div
                className={
                  step === index + 1
                    ? "active"
                    : step > index + 1
                      ? "complete"
                      : ""
                }
                key={item}
              >
                <span>
                  {step > index + 1 ? <Check size={14} /> : index + 1}
                </span>
                <div>
                  <strong>{item}</strong>
                  <small>
                    {index === 0
                      ? "Sınırlar ve acil durum"
                      : index === 1
                        ? "Local-first koruma"
                        : index === 2
                          ? "API ve resmî hesaplar"
                          : "Belgeler ve temel anket"}
                  </small>
                </div>
              </div>
            ))}
          </div>
          <div className="onboarding-security">
            <ShieldCheck size={20} />
            <p>Sağlık verileri varsayılan olarak bu bilgisayarda kalır.</p>
          </div>
        </aside>
        <main>
          <div className="onboarding-top">
            <Badge tone="green">ADIM {step} / 4</Badge>
            <button onClick={close}>Daha sonra tamamla</button>
          </div>
          {step === 1 ? (
            <div className="onboarding-content">
              <span className="onboarding-hero-icon">
                <ShieldAlert size={30} />
              </span>
              <h1>Sağlık zekâsı, güvenlik önce.</h1>
              <p>
                HealthCouncil belgelerinizi düzenler, değişimleri açıklar ve
                doktor görüşmesine hazırlanmanıza yardım eder. Tanı koymaz veya
                hekimin yerini almaz.
              </p>
              <div className="scope-grid">
                <article>
                  <CheckCircle2 size={20} />
                  <strong>Yapabilecekleri</strong>
                  <span>Belgeleri düzenlemek</span>
                  <span>Trendleri hesaplamak</span>
                  <span>Kaynaklı araştırma</span>
                  <span>Doktor raporu hazırlamak</span>
                </article>
                <article className="not-scope">
                  <X size={20} />
                  <strong>Yapmayacakları</strong>
                  <span>Acil durumu dışlamak</span>
                  <span>Kesin tanı koymak</span>
                  <span>Reçete veya doz vermek</span>
                  <span>Doktor ziyaretini ertelemek</span>
                </article>
              </div>
              <label className="onboarding-consent">
                <input type="checkbox" defaultChecked />
                <span>
                  <Check size={13} />
                </span>
                <p>
                  Ürünün sınırlarını ve acil durumda profesyonel yardım almam
                  gerektiğini anladım.
                </p>
              </label>
            </div>
          ) : step === 2 ? (
            <div className="onboarding-content">
              <span className="onboarding-hero-icon">
                <LockKeyhole size={30} />
              </span>
              <h1>Verinizin kontrolü sizde.</h1>
              <p>
                Yerel kasa, şifreli yedek ve sağlayıcı bazlı açık rıza
                ayarlarını seçin.
              </p>
              <div className="setup-options">
                <button className="selected">
                  <span>
                    <Database size={21} />
                  </span>
                  <div>
                    <strong>Yalnızca bu cihaz</strong>
                    <p>Belgeler ve sağlık profili yerel işlenir.</p>
                  </div>
                  <CheckCircle2 size={18} />
                </button>
                <button>
                  <span>
                    <Cloud size={21} />
                  </span>
                  <div>
                    <strong>İzinle cloud araştırması</strong>
                    <p>Her gönderimden önce Privacy Preview.</p>
                  </div>
                  <ChevronRight size={18} />
                </button>
                <button>
                  <span>
                    <KeyRound size={21} />
                  </span>
                  <div>
                    <strong>Kurtarma anahtarı</strong>
                    <p>Şifreli kasayı Windows kurulumu sonrasında kurtarın.</p>
                  </div>
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          ) : step === 3 ? (
            <div className="onboarding-content">
              <span className="onboarding-hero-icon">
                <Network size={30} />
              </span>
              <h1>AI sağlayıcılarını bağlayın.</h1>
              <p>
                API, resmî CLI veya yerel endpoint. ChatGPT aboneliği ve OpenAI
                API ayrı gösterilir.
              </p>
              <div className="mini-provider-grid">
                {providers.slice(0, 6).map((provider) => (
                  <button key={provider.id}>
                    <span className="provider-mark">{provider.mark}</span>
                    <div>
                      <strong>{provider.name}</strong>
                      <small>{provider.status}</small>
                    </div>
                    <ChevronRight size={16} />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="onboarding-content">
              <span className="onboarding-hero-icon">
                <FolderHeart size={30} />
              </span>
              <h1>Health Passport’ınızı başlatın.</h1>
              <p>
                Belgelerinizi yükleyin ve temel bilgileri tamamlayın. Çıkarılan
                her kritik alanı siz doğrularsınız.
              </p>
              <div className="onboarding-upload">
                <UploadCloud size={28} />
                <strong>İlk sağlık belgelerinizi bırakın</strong>
                <p>
                  e‑Nabız PDF, laboratuvar, epikriz, reçete veya görüntüleme
                  raporu
                </p>
                <button>Dosya seç</button>
              </div>
              <div className="basic-fields">
                <label>
                  Yaş
                  <input defaultValue="34" />
                </label>
                <label>
                  Kan grubu
                  <select defaultValue="A Rh+">
                    <option>A Rh+</option>
                    <option>B Rh+</option>
                  </select>
                </label>
                <label>
                  Boy
                  <input defaultValue="168 cm" />
                </label>
                <label>
                  Kilo
                  <input defaultValue="64,2 kg" />
                </label>
              </div>
            </div>
          )}
          <footer>
            <button
              className="secondary-button"
              disabled={step === 1}
              onClick={() => setStep((value) => value - 1)}
            >
              Geri
            </button>
            <span>Bilgileriniz demo profilinde saklanır.</span>
            <button
              className="primary-button"
              onClick={() =>
                step < 4 ? setStep((value) => value + 1) : close()
              }
            >
              {step < 4 ? "Devam et" : "HealthCouncil’ı aç"}
              <ArrowRight size={16} />
            </button>
          </footer>
        </main>
      </div>
    </div>
  );
}

export function App() {
  const [view, setView] = useState<AppView>("inbox");
  const [sidebarCompact, setSidebarCompact] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [toast, setToast] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = window.localStorage.getItem("healthcouncil-theme");
    return saved === "light" || saved === "dark" ? saved : "dark";
  });
  const current = viewTitles[view];
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("healthcouncil-theme", theme);
  }, [theme]);
  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3200);
  };
  const content = useMemo(() => {
    switch (view) {
      case "inbox":
        return <HealthInbox navigate={setView} />;
      case "passport":
        return <HealthPassport />;
      case "documents":
        return <Documents notify={notify} navigate={setView} />;
      case "review":
        return <ReviewInbox notify={notify} />;
      case "timeline":
        return <TimelineScreen />;
      case "labs":
        return <Labs />;
      case "medications":
        return <Medications />;
      case "cases":
        return <CasesChat navigate={setView} />;
      case "research":
        return <Research />;
      case "council":
        return <Council />;
      case "probabilities":
        return <Probabilities />;
      case "reports":
        return <Reports notify={notify} />;
      case "outcomes":
        return <Outcomes />;
      case "providers":
        return <Providers notify={notify} />;
      case "advanced":
        return <Advanced />;
    }
  }, [view]);
  return (
    <div className={`app-shell ${sidebarCompact ? "sidebar-compact" : ""}`}>
      <aside className="sidebar">
        <div className="brand-row">
          <span className="brand-icon">
            <HeartPulse size={22} />
          </span>
          <div className="brand-copy">
            <strong>HealthCouncil</strong>
            <small>PERSONAL HEALTH OS</small>
          </div>
        </div>
        <button className="patient-switcher">
          <span className="avatar">{patient.initials}</span>
          <div>
            <strong>{patient.name}</strong>
            <small>Demo profil · v{patient.stateVersion}</small>
          </div>
          <ChevronDown size={16} />
        </button>
        <nav aria-label="Ana navigasyon">
          {navSections.map((section) => (
            <section key={section.label}>
              <p>{section.label}</p>
              {section.items.map(({ icon: Icon, ...item }) => (
                <button
                  key={item.id}
                  className={view === item.id ? "active" : ""}
                  aria-current={view === item.id ? "page" : undefined}
                  onClick={() => setView(item.id)}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                  {item.badge ? <b>{item.badge}</b> : null}
                </button>
              ))}
            </section>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button
            className={view === "providers" ? "active" : ""}
            onClick={() => setView("providers")}
          >
            <Network size={18} />
            <span>AI Connections</span>
            <i className="connection-dot" />
          </button>
          <button onClick={() => setShowOnboarding(true)}>
            <Settings size={18} />
            <span>Settings & Onboarding</span>
          </button>
          <div className="local-status">
            <ShieldCheck size={16} />
            <span>
              <strong>Yerel kasa korumalı</strong>
              <small>Son yedek: Bugün 09:12</small>
            </span>
          </div>
        </div>
      </aside>
      <header className="topbar">
        <IconButton
          label="Menüyü daralt"
          onClick={() => setSidebarCompact(!sidebarCompact)}
        >
          <Menu size={18} />
        </IconButton>
        <span className="topbar-separator" />
        <div className="top-nav" aria-label="Bölüm navigasyonu">
          <button
            className={view === "inbox" ? "active" : ""}
            onClick={() => setView("inbox")}
          >
            Overview
          </button>
          <button
            className={
              [
                "passport",
                "documents",
                "review",
                "timeline",
                "labs",
                "medications",
              ].includes(view)
                ? "active"
                : ""
            }
            onClick={() => setView("passport")}
          >
            Health
          </button>
          <button
            className={
              ["cases", "research", "council", "probabilities"].includes(view)
                ? "active"
                : ""
            }
            onClick={() => setView("cases")}
          >
            Intelligence
          </button>
          <button
            className={
              ["reports", "outcomes", "advanced"].includes(view) ? "active" : ""
            }
            onClick={() => setView("reports")}
          >
            Outputs
          </button>
        </div>
        <div className="global-search">
          <Search size={16} />
          <input
            aria-label="Uygulamada ara"
            placeholder="Belge, sonuç, ilaç veya vaka ara…"
          />
          <kbd>Ctrl K</kbd>
        </div>
        <div className="top-actions">
          <Badge tone="green">
            <i className="connection-dot" /> Yerel & gizli
          </Badge>
          <IconButton
            label={theme === "dark" ? "Açık temaya geç" : "Koyu temaya geç"}
            onClick={() =>
              setTheme((value) => (value === "dark" ? "light" : "dark"))
            }
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </IconButton>
          <IconButton label="Yardım">
            <HelpCircle size={18} />
          </IconButton>
          <IconButton label="Bildirimler">
            <Bell size={18} />
            <i className="notification-dot" />
          </IconButton>
          <button className="top-avatar">{patient.initials}</button>
        </div>
      </header>
      <main className="workspace" aria-label={current.title}>
        {content}
      </main>
      <div className="safety-footer" role="status">
        <Shield size={13} />
        {SAFETY_COPY}
      </div>
      {toast ? (
        <div className="toast" role="status">
          <CheckCircle2 size={18} />
          <span>{toast}</span>
          <button aria-label="Bildirimi kapat" onClick={() => setToast("")}>
            <X size={15} />
          </button>
        </div>
      ) : null}
      {showOnboarding ? (
        <Onboarding close={() => setShowOnboarding(false)} />
      ) : null}
    </div>
  );
}
