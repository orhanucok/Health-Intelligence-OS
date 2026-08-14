import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App, SAFETY_COPY } from "../src/App";

describe("production-shaped synthetic vertical slice", () => {
  it("renders non-diagnostic safety copy on every view", () => {
    render(<App />);
    const safetyBanner = screen
      .getAllByRole("status")
      .find((element) => element.textContent?.includes(SAFETY_COPY));
    expect(safetyBanner).toHaveTextContent(SAFETY_COPY);
    expect(safetyBanner).toHaveTextContent("tanı veya tedavi önerisi üretmez");
  });

  it("keeps the visible review budget at twenty or fewer", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /İnceleme Kutusu/ }));
    const budget = screen.getByText(/\/ 20 bütçe/);
    expect(budget).toHaveTextContent("2 / 20");
    expect(screen.getAllByRole("article")).toHaveLength(2);
  });

  it("opens duplicate provenance edges from verified patient state", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /Doğrulanmış Durum/ }));
    const ferritinRows = screen.getAllByText("Ferritin");
    const row = ferritinRows[1]?.closest("article");
    expect(row).not.toBeNull();
    fireEvent.click(
      within(row!).getByRole("button", { name: "Neden burada?" }),
    );
    expect(
      screen.getByRole("dialog", { name: "Kaynak zinciri" }),
    ).toHaveTextContent("2 kaynak bağlantısı");
  });

  it("shows only verified facts in patient state", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /Doğrulanmış Durum/ }));
    expect(screen.getByText("2 doğrulanmış kayıt")).toBeInTheDocument();
    expect(screen.queryByText("CRP")).not.toBeInTheDocument();
    expect(screen.queryByText("Hemoglobin")).not.toBeInTheDocument();
  });

  it("report preview preserves unresolved conflict and human review wording", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /Rapor Önizleme/ }));
    expect(screen.getByText(/CRP çelişkisi çözülmedi/)).toBeInTheDocument();
    expect(
      screen.getByText(/Tanı veya tedavi önerisi değildir/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /Güvenlik bildirimi/,
      }),
    ).toBeDisabled();
  });

  it("labels review decisions as non-persistent UI simulations", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /İnceleme Kutusu/ }));
    const confirmButtons = screen.getAllByRole("button", {
      name: "Demo: Onayla",
    });
    expect(confirmButtons[0]).toBeDisabled();
    expect(confirmButtons[1]).toBeEnabled();
    screen
      .getAllByRole("button", { name: "Düzelt (yakında)" })
      .forEach((button) => expect(button).toBeDisabled());
    fireEvent.click(confirmButtons[1]!);
    expect(
      screen
        .getAllByRole("status")
        .find((element) =>
          element.textContent?.includes("kalıcı kayıt oluşturulmadı"),
        ),
    ).toBeDefined();
  });
});
