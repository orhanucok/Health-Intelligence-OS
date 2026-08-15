import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App, SAFETY_COPY } from "../src/App";

function openView(name: string) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  fireEvent.click(
    screen.getByRole("button", { name: new RegExp(`^${escaped}(?:\\s|$)`) }),
  );
}

describe("HealthCouncil Desktop unified product shell", () => {
  it("keeps the non-diagnostic emergency boundary visible on every view", () => {
    render(<App />);
    expect(screen.getByRole("status")).toHaveTextContent(SAFETY_COPY);
    openView("Labs");
    expect(screen.getByRole("status")).toHaveTextContent("tıbbi tanı koymaz");
  });

  it("exposes the complete health, intelligence and output navigation", () => {
    render(<App />);
    [
      "Health Inbox",
      "Health Passport",
      "Belgeler",
      "İnceleme Kutusu",
      "Timeline",
      "Labs",
      "Medications",
      "Cases & Chat",
      "Research",
      "AI Council",
      "Probabilities",
      "Reports",
      "Outcomes",
      "Treatment & What‑if",
      "AI Connections",
    ].forEach((name) => {
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      expect(
        screen.getByRole("button", {
          name: new RegExp(`^${escaped}(?:\\s|$)`),
        }),
      ).toBeInTheDocument();
    });
  });

  it("requires human review before conflicting facts enter patient state", () => {
    render(<App />);
    openView("İnceleme Kutusu");
    expect(
      screen.getByRole("heading", { name: "İnceleme Kutusu" }),
    ).toBeInTheDocument();
    expect(screen.getByText("CRP sonucu eşleşmiyor")).toBeInTheDocument();
    expect(
      screen.getByText(/İnsan onayı olmadan kan grubu/),
    ).toBeInTheDocument();
    const card = screen.getByText("CRP sonucu eşleşmiyor").closest("article");
    fireEvent.click(
      within(card!).getByRole("button", { name: /Öneriyi onayla/ }),
    );
    expect(screen.queryByText("CRP sonucu eşleşmiyor")).not.toBeInTheDocument();
  });

  it("keeps API and subscription/account connection types separate", () => {
    render(<App />);
    openView("AI Connections");
    expect(screen.getByText("OpenAI API")).toBeInTheDocument();
    expect(screen.getByText("ChatGPT hesabı")).toBeInTheDocument();
    expect(screen.getByText("Anthropic API")).toBeInTheDocument();
    expect(screen.getByText("Claude hesabı")).toBeInTheDocument();
    expect(screen.getByText("Gemini hesabı")).toBeInTheDocument();
    expect(screen.getByText("xAI API")).toBeInTheDocument();
    expect(screen.getByText("Kimi API")).toBeInTheDocument();
  });

  it("shows provider privacy preview before any cloud disclosure", () => {
    render(<App />);
    openView("AI Connections");
    fireEvent.click(screen.getByRole("button", { name: /Privacy Preview/ }));
    const drawer = screen.getByRole("dialog", {
      name: "Provider Privacy Preview",
    });
    expect(drawer).toHaveTextContent("Ad soyad");
    expect(drawer).toHaveTextContent("Ham PDF ve ilgisiz belgeler");
    expect(drawer).toHaveTextContent("store:false");
  });

  it("renders the planned escalated council and calibrated probabilities", () => {
    render(<App />);
    openView("AI Council");
    expect(screen.getByText("Gemini 3.7 Flash")).toBeInTheDocument();
    expect(screen.getByText("GPT‑5.6 Sol")).toBeInTheDocument();
    expect(screen.getByText("Claude Opus")).toBeInTheDocument();
    openView("Probabilities");
    expect(
      screen.getByText(/klinik olarak kalibre edilmiş olasılıklar değildir/),
    ).toBeInTheDocument();
    expect(screen.getByText(/MUST-NOT-MISS/)).toBeInTheDocument();
  });

  it("provides a four-step safety and privacy onboarding", () => {
    render(<App />);
    openView("Settings & Onboarding");
    expect(
      screen.getByText("Sağlık zekâsı, güvenlik önce."),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Devam et/ }));
    expect(screen.getByText("Verinizin kontrolü sizde.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Devam et/ }));
    expect(
      screen.getByText("AI sağlayıcılarını bağlayın."),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Devam et/ }));
    expect(
      screen.getByText("Health Passport’ınızı başlatın."),
    ).toBeInTheDocument();
  });

  it("keeps advanced treatment and what-if modules behind evidence gates", () => {
    render(<App />);
    openView("Treatment & What‑if");
    expect(
      screen.getAllByRole("button", { name: "Doğrulama tamamlanınca açılacak" })
        .length,
    ).toBeGreaterThan(0);
    expect(screen.getByText(/Güvenlik kapıları etkin/)).toBeInTheDocument();
  });

  it("persists the integrated shadcn light and dark theme choice", () => {
    window.localStorage.removeItem("healthcouncil-theme");
    render(<App />);
    expect(document.documentElement).toHaveClass("dark");
    fireEvent.click(screen.getByRole("button", { name: "Açık temaya geç" }));
    expect(document.documentElement).not.toHaveClass("dark");
    expect(window.localStorage.getItem("healthcouncil-theme")).toBe("light");
  });

  it("imports a real supported file into the persistent local document archive", async () => {
    render(<App />);
    openView("Belgeler");
    const file = new File(["synthetic lab result"], "ornek-laboratuvar.pdf", {
      type: "application/pdf",
      lastModified: 1_723_000_000_000,
    });
    fireEvent.change(screen.getByLabelText("Sağlık belgesi seç"), {
      target: { files: [file] },
    });
    expect(
      await screen.findByText("ornek-laboratuvar.pdf"),
    ).toBeInTheDocument();
    expect(screen.getByText("Yerel arşivde")).toBeInTheDocument();
    await waitFor(() =>
      expect(
        window.localStorage.getItem("healthcouncil-imported-documents"),
      ).toContain("ornek-laboratuvar.pdf"),
    );
  });

  it("sends and keeps a typed case message instead of silently clearing it", () => {
    render(<App />);
    openView("Cases & Chat");
    const composer = screen.getByLabelText("Vaka mesajı");
    fireEvent.change(composer, { target: { value: "Ağrı bugün azaldı." } });
    fireEvent.click(
      screen.getByRole("button", { name: "Vaka mesajını gönder" }),
    );
    expect(screen.getByText("Ağrı bugün azaldı.")).toBeInTheDocument();
    expect(composer).toHaveValue("");
  });

  it("saves an outcome form locally with explicit consent state", () => {
    render(<App />);
    openView("Outcomes");
    fireEvent.change(screen.getByLabelText("Doktorun değerlendirmesi"), {
      target: { value: "Migren; uyku düzeni takibi önerildi." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Outcome’u kaydet" }));
    expect(
      screen.getByRole("button", { name: /Outcome kaydedildi/ }),
    ).toBeInTheDocument();
    expect(
      window.localStorage.getItem("healthcouncil-latest-outcome"),
    ).toContain("Migren");
  });

  it("routes global search terms to the relevant working module", () => {
    render(<App />);
    const searchBox = screen.getByLabelText("Uygulamada ara");
    fireEvent.change(searchBox, { target: { value: "belge" } });
    fireEvent.keyDown(searchBox, { key: "Enter" });
    expect(
      screen.getByRole("heading", { name: "Sağlık belgeleri" }),
    ).toBeInTheDocument();
  });
});
