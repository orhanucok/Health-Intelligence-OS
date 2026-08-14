import { useEffect, useMemo, useRef, useState } from "react";
import {
  canEnterVerifiedState,
  rankReviewItems,
  type Observation,
  type ReviewItem,
  type TrustTier,
} from "@health-intelligence/contracts";
import { events, observations, reviewItems as seededReviewItems } from "./data";

export const SAFETY_COPY =
  "Bu dahili sentetik önizleme tanı veya tedavi önerisi üretmez. Bulgular klinisyen incelemesi gerektirir; acil durum yönetimi bu sürümün kapsamı dışındadır.";

type View = "inbox" | "review" | "state" | "timeline" | "labs" | "report";

const navItems: Array<{ id: View; icon: string; label: string }> = [
  { id: "inbox", icon: "⌂", label: "Sağlık Kutusu" },
  { id: "review", icon: "✓", label: "İnceleme Kutusu" },
  { id: "state", icon: "◫", label: "Doğrulanmış Durum" },
  { id: "timeline", icon: "↕", label: "Zaman Çizelgesi" },
  { id: "labs", icon: "⌁", label: "Laboratuvar & Trendler" },
  { id: "report", icon: "▤", label: "Rapor Önizleme" },
];

const tierLabels: Record<TrustTier, string> = {
  verified: "Doğrulandı",
  extracted_high: "Yüksek güvenli çıkarım",
  extracted_low: "Düşük güvenli çıkarım",
  uncertain: "Belirsiz",
  conflicted: "Çelişkili",
};

function TrustBadge({ tier }: { tier: TrustTier }) {
  return (
    <span className={`trust-badge trust-${tier}`}>
      <span aria-hidden="true">
        {tier === "verified" ? "✓" : tier === "conflicted" ? "×" : "!"}
      </span>
      {tierLabels[tier]}
    </span>
  );
}

function ObservationRow({
  observation,
  onInspect,
}: {
  observation: Observation;
  onInspect: (observation: Observation) => void;
}) {
  const outside =
    observation.value < observation.referenceRange.low ||
    observation.value > observation.referenceRange.high;
  return (
    <article className="observation-row">
      <div className="observation-name">
        <span>{observation.display}</span>
        <small>{observation.conceptCode}</small>
      </div>
      <strong className={outside ? "value-outside" : ""}>
        {observation.value.toLocaleString("tr-TR")} {observation.unit}
      </strong>
      <span className="range">
        {observation.referenceRange.low}–{observation.referenceRange.high}
        {outside ? " · Referans dışı" : ""}
      </span>
      <TrustBadge tier={observation.trustTier} />
      <button className="link-button" onClick={() => onInspect(observation)}>
        Neden burada?
      </button>
    </article>
  );
}

function HealthInbox({ onNavigate }: { onNavigate: (view: View) => void }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      <header className="page-heading">
        <div>
          <p className="eyebrow">Bugün · sentetik çalışma alanı</p>
          <h1>Sağlık Kutusu</h1>
          <p>
            Yeni kayıtları, değişiklikleri ve doğrulama gerektiren bulguları tek
            sırada inceleyin.
          </p>
        </div>
        <button className="primary-button" onClick={() => setLoaded(true)}>
          + Sentetik demo fixture’ını aç
        </button>
      </header>

      <section className="intake-card" aria-label="Sentetik belge alımı">
        <div className="document-icon" aria-hidden="true">
          LAB
        </div>
        <div>
          <strong>
            {loaded
              ? "SYN-LAB-2026-08 demo önizlemesi açıldı"
              : "Türkçe sentetik laboratuvar demosu"}
          </strong>
          <p>
            {loaded
              ? "Bu etkileşim dosya okumaz veya kayıt oluşturmaz; yalnızca yerel UI durumunu gösterir."
              : "Yalnızca sentetik fixture yüklenir. Gerçek hasta belgesi bu geliştirme sürümünde kabul edilmez."}
          </p>
        </div>
        <span className={`status-pill ${loaded ? "status-ready" : ""}`}>
          {loaded ? "UI simülasyonu" : "Ağ bağlantısı yok"}
        </span>
      </section>

      <div className="metric-grid">
        <button
          className="metric-card critical"
          onClick={() => onNavigate("review")}
        >
          <span className="metric-icon">!</span>
          <strong>1</strong>
          <span>Çelişki</span>
          <small>Şimdi doğrulayın</small>
        </button>
        <button
          className="metric-card review"
          onClick={() => onNavigate("review")}
        >
          <span className="metric-icon">?</span>
          <strong>2</strong>
          <span>İnceleme</span>
          <small>20 öğelik bütçe içinde</small>
        </button>
        <button
          className="metric-card changed"
          onClick={() => onNavigate("labs")}
        >
          <span className="metric-icon">↓</span>
          <strong>−42%</strong>
          <span>Ferritin değişimi</span>
          <small>Deterministik hesaplama</small>
        </button>
      </div>

      <section className="section-card">
        <div className="section-title">
          <div>
            <p className="eyebrow">Öncelikli akış</p>
            <h2>İlgilenmeniz gerekenler</h2>
          </div>
          <span>Risk sırasına göre</span>
        </div>
        <button
          className="inbox-item danger"
          onClick={() => onNavigate("review")}
        >
          <span className="item-marker">01</span>
          <span>
            <strong>CRP kaynakları birbiriyle uyuşmuyor</strong>
            <small>Çelişkili ölçüm · hassas trend durduruldu</small>
          </span>
          <b>Doğrula →</b>
        </button>
        <button className="inbox-item" onClick={() => onNavigate("review")}>
          <span className="item-marker">02</span>
          <span>
            <strong>Hemoglobin çıkarımını inceleyin</strong>
            <small>SYN-LAB-2026-02 · sayfa 1</small>
          </span>
          <b>İncele →</b>
        </button>
        <button className="inbox-item" onClick={() => onNavigate("labs")}>
          <span className="item-marker complete">✓</span>
          <span>
            <strong>Ferritin trendi güncellendi</strong>
            <small>İki doğrulanmış gözlem · lab-linear-v1</small>
          </span>
          <b>Trendi aç →</b>
        </button>
      </section>
    </>
  );
}

function ReviewInbox({
  items,
  onDecision,
  onInspect,
}: {
  items: ReviewItem[];
  onDecision: (id: string, status: ReviewItem["status"]) => void;
  onInspect: (observation: Observation) => void;
}) {
  const ranked = rankReviewItems(items);
  return (
    <>
      <header className="page-heading">
        <div>
          <p className="eyebrow">Risk × belirsizlik × kullanım</p>
          <h1>İnceleme Kutusu</h1>
          <p>
            Bu oturumda en fazla 20 öğe gösterilir; kritik çelişkiler
            ertelenmez.
          </p>
        </div>
        <span className="budget-chip">{ranked.length} / 20 bütçe</span>
      </header>
      <div className="review-list">
        {ranked.length === 0 ? (
          <section className="empty-state">
            <h2>İnceleme kuyruğu temiz</h2>
            <p>
              Demo kararları yalnızca bu ekranda gizlendi; kalıcı olay kaydı
              oluşturulmadı.
            </p>
          </section>
        ) : (
          ranked.map((item, index) => (
            <article
              className={`review-card ${item.observation.trustTier === "conflicted" ? "review-conflict" : ""}`}
              key={item.id}
            >
              <div className="priority-number">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div className="review-source">
                <span>
                  Kaynak pasaj · Sayfa{" "}
                  {item.observation.provenance[0]?.region.page}
                </span>
                <blockquote>
                  {item.observation.provenance[0]?.region.text}
                </blockquote>
                <button
                  className="link-button"
                  onClick={() => onInspect(item.observation)}
                >
                  Kaynağı ve provenance’ı aç
                </button>
              </div>
              <div className="review-extracted">
                <TrustBadge tier={item.observation.trustTier} />
                <h3>{item.observation.display}</h3>
                <p className="large-value">
                  {item.observation.value.toLocaleString("tr-TR")}{" "}
                  <small>{item.observation.unit}</small>
                </p>
                <p>{item.explanation}</p>
                <div className="review-actions">
                  <button
                    disabled={item.criticalConflict}
                    title={
                      item.criticalConflict
                        ? "Çelişki çözüm akışı bu sürümde kapalı"
                        : "Yalnızca UI simülasyonu; kalıcı kayıt oluşturmaz"
                    }
                    onClick={() => onDecision(item.id, "confirmed")}
                  >
                    Demo: Onayla
                  </button>
                  <button disabled title="Düzeltme formu henüz uygulanmadı">
                    Düzelt (yakında)
                  </button>
                  <button onClick={() => onDecision(item.id, "rejected")}>
                    Demo: Reddet
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </>
  );
}

function PatientState({
  onInspect,
}: {
  onInspect: (observation: Observation) => void;
}) {
  const verified = observations.filter(canEnterVerifiedState);
  return (
    <>
      <header className="page-heading">
        <div>
          <p className="eyebrow">Snapshot SYN-001 · sürüm 3</p>
          <h1>Doğrulanmış Hasta Durumu</h1>
          <p>
            Yalnızca insan tarafından doğrulanmış FACT kayıtları bu projeksiyona
            girer.
          </p>
        </div>
        <span className="verified-stamp">
          <span aria-hidden="true">✓</span>{" "}
          <span>{verified.length} doğrulanmış kayıt</span>
        </span>
      </header>
      <section className="section-card">
        <div className="section-title">
          <h2>Laboratuvar gözlemleri</h2>
          <span>Kimliksiz sentetik profil</span>
        </div>
        {verified.map((observation) => (
          <ObservationRow
            key={observation.id}
            observation={observation}
            onInspect={onInspect}
          />
        ))}
      </section>
      <section className="guard-card">
        <strong>Trust-tier kapısı etkin</strong>
        <p>
          Çıkarılmış, belirsiz veya çelişkili kayıtlar doğrulanmış duruma
          otomatik yükseltilemez.
        </p>
      </section>
    </>
  );
}

function Timeline() {
  return (
    <>
      <header className="page-heading">
        <div>
          <p className="eyebrow">Sentetik demo olay projeksiyonu</p>
          <h1>Zaman Çizelgesi</h1>
          <p>
            Düzeltmeler eski kayıtları değiştirmez; yeni olaylar olarak eklenir.
          </p>
        </div>
      </header>
      <section className="timeline">
        {events.map((event) => (
          <article key={event.id}>
            <time>
              {new Intl.DateTimeFormat("tr-TR", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(event.recordedAt))}
            </time>
            <div className="timeline-node" />
            <div>
              <span className="event-type">{event.type}</span>
              <h3>{event.summary}</h3>
              <p>
                Kaynak: {event.sourceId} · sıra #{event.sequence}
              </p>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}

function Labs({
  onInspect,
}: {
  onInspect: (observation: Observation) => void;
}) {
  const ferritin = observations.filter((item) => item.display === "Ferritin");
  return (
    <>
      <header className="page-heading">
        <div>
          <p className="eyebrow">Önceden hesaplanmış sentetik fixture</p>
          <h1>Laboratuvar & Trendler</h1>
          <p>
            Raporlanan değerler korunur; değişim ayrı bir DERIVED_FACT olarak
            hesaplanır.
          </p>
        </div>
        <span className="formula-chip">lab-linear-v1</span>
      </header>
      <section className="trend-card">
        <div className="trend-summary">
          <div>
            <span>Ferritin</span>
            <strong>
              31 → 18 <small>ng/mL</small>
            </strong>
            <p>119 günde −13 ng/mL · −41,9% · eğim −0,109/gün</p>
          </div>
          <span className="trend-direction">↓</span>
        </div>
        <div
          className="chart"
          role="img"
          aria-label="Ferritin sentetik trendi 31 değerinden 18 değerine düşüyor"
        >
          <div className="chart-grid" />
          <svg viewBox="0 0 600 180" preserveAspectRatio="none">
            <polyline
              points="35,35 565,142"
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
            />
            <circle cx="35" cy="35" r="7" />
            <circle cx="565" cy="142" r="7" />
          </svg>
          <span className="chart-label left">14 Eki · 31</span>
          <span className="chart-label right">10 Şub · 18</span>
        </div>
        <div className="derived-row">
          <span className="semantic-badge derived">DERIVED_FACT</span>
          <p>Girdiler: {ferritin.map((item) => item.id).join(" · ")}</p>
        </div>
      </section>
      <section className="section-card">
        <h2>Kaynak gözlemler</h2>
        {ferritin.map((observation) => (
          <ObservationRow
            key={observation.id}
            observation={observation}
            onInspect={onInspect}
          />
        ))}
      </section>
    </>
  );
}

function ReportPreview({
  onInspect,
}: {
  onInspect: (observation: Observation) => void;
}) {
  const reportObservation = observations.find(
    (observation) => observation.id === "obs-ferritin-2026",
  );
  return (
    <>
      <header className="page-heading">
        <div>
          <p className="eyebrow">Dondurulmuş sentetik snapshot</p>
          <h1>Rapor Önizleme</h1>
          <p>
            Klinisyen görüşmesine hazırlık için kaynak izlenebilirliğine sahip
            özet.
          </p>
        </div>
        <button className="secondary-button" disabled>
          PDF dışa aktarım sonraki kapıda
        </button>
      </header>
      <article className="report-paper">
        <div className="report-masthead">
          <div>
            <small>HEALTHCOUNCIL · SENTETİK</small>
            <h2>Klinisyen Görüşme Özeti</h2>
          </div>
          <span>ÖNİZLEME</span>
        </div>
        <div className="report-warning">
          Tanı veya tedavi önerisi değildir. Bulgular bir klinisyen tarafından
          kaynak belgelerle birlikte değerlendirilmelidir.
        </div>
        <section>
          <h3>Doğrulanmış değişiklik</h3>
          <p>
            Ferritin, iki doğrulanmış sentetik ölçüm arasında 31 ng/mL’den 18
            ng/mL’ye değişmiştir. Değişim deterministik kodla hesaplanmıştır;
            klinik anlam çıkarılmamıştır.
          </p>
          <button
            className="link-button"
            disabled={!reportObservation}
            onClick={() => reportObservation && onInspect(reportObservation)}
          >
            Kaynak zincirini görüntüle
          </button>
        </section>
        <section>
          <h3>Açık inceleme</h3>
          <p>
            <strong>CRP çelişkisi çözülmedi.</strong> Bu gözleme bağlı hassas
            hesaplamalar durdurulmuştur. “Şimdi doğrula” uyarısı kesin bir
            klinik sonuç değildir.
          </p>
        </section>
        <footer>
          <div>
            <small>Demo snapshot kimliği</small>
            <code>SYNTHETIC-PREVIEW-NOT-A-HASH</code>
          </div>
          <div>
            <small>Şema / formül</small>
            <code>contracts-v1 · lab-linear-v1</code>
          </div>
          <button
            className="unsafe-action"
            disabled
            title="Güvenlik bildirim akışı henüz uygulanmadı"
          >
            Güvenlik bildirimi (yakında)
          </button>
        </footer>
      </article>
    </>
  );
}

function ProvenanceDrawer({
  observation,
  onClose,
}: {
  observation: Observation;
  onClose: () => void;
}) {
  const closeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => closeButton.current?.focus(), []);
  return (
    <aside
      className="provenance-drawer"
      aria-label="Kaynak zinciri"
      aria-modal="true"
      role="dialog"
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
    >
      <header>
        <div>
          <p className="eyebrow">Neden burada?</p>
          <h2>{observation.display}</h2>
        </div>
        <button
          ref={closeButton}
          aria-label="Kaynak zincirini kapat"
          onClick={onClose}
        >
          ×
        </button>
      </header>
      <TrustBadge tier={observation.trustTier} />
      <ol className="provenance-chain">
        <li>
          <span>Gösterilen kayıt</span>
          <strong>
            {observation.value} {observation.unit}
          </strong>
        </li>
        <li>
          <span>Semantik sınıf</span>
          <strong>{observation.semanticClass}</strong>
        </li>
        <li>
          <span>Kanonik gözlem</span>
          <code>{observation.id}</code>
        </li>
        <li>
          <span>Kaynak bağlantıları</span>
          <strong>{observation.provenance.length} kaynak bağlantısı</strong>
        </li>
      </ol>
      {observation.provenance.map((edge) => (
        <article className="source-card" key={edge.id}>
          <div>
            <strong>{edge.documentId}</strong>
            <span>Sayfa {edge.region.page}</span>
          </div>
          <blockquote>{edge.region.text}</blockquote>
          <small>
            {edge.extractorVersion} · {edge.sourceHash.slice(0, 20)}…
          </small>
        </article>
      ))}
      <div className="drawer-note">
        Belge metni güvenilmeyen veri olarak işlenir. Kaynak, FACT kaydını
        otomatik olarak doğrulamaz.
      </div>
    </aside>
  );
}

export function App() {
  const [view, setView] = useState<View>("inbox");
  const [reviewItems, setReviewItems] = useState(seededReviewItems);
  const [inspected, setInspected] = useState<Observation | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const previousFocus = useRef<HTMLElement | null>(null);
  const pendingCount = useMemo(
    () => reviewItems.filter((item) => item.status === "pending").length,
    [reviewItems],
  );
  const decide = (id: string, status: ReviewItem["status"]) => {
    setReviewItems((items) =>
      items.map((item) => (item.id === id ? { ...item, status } : item)),
    );
    setAnnouncement(
      "Demo kararı yalnızca bu oturumun arayüzünde uygulandı; kalıcı kayıt oluşturulmadı.",
    );
  };
  const inspect = (observation: Observation) => {
    previousFocus.current = document.activeElement as HTMLElement | null;
    setInspected(observation);
  };
  const closeInspection = () => {
    setInspected(null);
    requestAnimationFrame(() => previousFocus.current?.focus());
  };
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-mark">H</div>
        <div className="brand">
          <strong>HealthCouncil</strong>
          <span>Desktop · Vertical Slice</span>
        </div>
        <div className="top-status">
          <span>
            <i className="online-dot" /> Yerel ve çevrimdışı
          </span>
          <span className="synthetic-chip">SENTETİK VERİ</span>
          <button aria-label="Bildirimler — henüz kullanılamıyor" disabled>
            ◌
          </button>
        </div>
      </header>
      <nav className="sidebar" aria-label="Ana navigasyon">
        <p>ÇALIŞMA ALANI</p>
        {navItems.map((item) => (
          <button
            key={item.id}
            className={view === item.id ? "active" : ""}
            onClick={() => setView(item.id)}
          >
            <span aria-hidden="true">{item.icon}</span>
            {item.label}
            {item.id === "review" && pendingCount > 0 ? (
              <b>{pendingCount}</b>
            ) : null}
          </button>
        ))}
        <div className="capability-card">
          <span>İlk slice kapsamı</span>
          <strong>Arşiv + gözden geçirme</strong>
          <p>Tanı, tedavi, modeller ve ağ sağlayıcıları kapalı.</p>
        </div>
      </nav>
      <main className="workspace">
        <p className="sr-only" role="status" aria-live="polite">
          {announcement}
        </p>
        <div className="safety-banner" role="status">
          <span aria-hidden="true">i</span>
          <p>{SAFETY_COPY}</p>
        </div>
        {view === "inbox" && <HealthInbox onNavigate={setView} />}
        {view === "review" && (
          <ReviewInbox
            items={reviewItems}
            onDecision={decide}
            onInspect={inspect}
          />
        )}
        {view === "state" && <PatientState onInspect={inspect} />}
        {view === "timeline" && <Timeline />}
        {view === "labs" && <Labs onInspect={inspect} />}
        {view === "report" && <ReportPreview onInspect={inspect} />}
      </main>
      {inspected ? (
        <ProvenanceDrawer observation={inspected} onClose={closeInspection} />
      ) : null}
    </div>
  );
}
