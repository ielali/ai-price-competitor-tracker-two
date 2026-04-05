import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CommandPalette } from "@/components/layout/command-palette";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

function pressTogglePalette(target: Element) {
  const ev = new KeyboardEvent("keydown", {
    key: "k",
    metaKey: true,
    bubbles: true,
    cancelable: true,
  });
  target.dispatchEvent(ev);
}

describe("CommandPalette", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("opens when ⌘K is pressed and lists navigation destinations", { timeout: 15000 }, async () => {
    const user = userEvent.setup();
    render(<CommandPalette />);

    pressTogglePalette(document.body);

    expect(await screen.findByPlaceholderText("Search pages and go…")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByPlaceholderText("Search pages and go…")).not.toBeInTheDocument(),
    );
  });

  it("opens with Ctrl+K", async () => {
    render(<CommandPalette />);

    const ev = new KeyboardEvent("keydown", {
      key: "k",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    document.body.dispatchEvent(ev);

    expect(await screen.findByPlaceholderText("Search pages and go…")).toBeInTheDocument();
  });

  it("filters items by query", async () => {
    const user = userEvent.setup();
    render(<CommandPalette />);

    pressTogglePalette(document.body);

    const input = await screen.findByPlaceholderText("Search pages and go…");
    await user.type(input, "sett");

    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.queryByText("Products")).not.toBeInTheDocument();
  });

  it("navigates and closes when an item is chosen", async () => {
    const user = userEvent.setup();
    render(<CommandPalette />);

    pressTogglePalette(document.body);

    await user.click(await screen.findByText("Alerts"));

    expect(mockPush).toHaveBeenCalledWith("/alerts");
    await waitFor(() =>
      expect(screen.queryByPlaceholderText("Search pages and go…")).not.toBeInTheDocument(),
    );
  });

  it("toggles closed when shortcut is pressed again", async () => {
    render(<CommandPalette />);

    pressTogglePalette(document.body);
    expect(await screen.findByPlaceholderText("Search pages and go…")).toBeInTheDocument();

    pressTogglePalette(document.body);
    await waitFor(() =>
      expect(screen.queryByPlaceholderText("Search pages and go…")).not.toBeInTheDocument(),
    );
  });
});
