import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CommandPalette } from "@/components/layout/command-palette";
import { CommandPaletteTrigger } from "@/components/layout/command-palette-trigger";
import { useCommandPaletteStore } from "@/stores/command-palette-store";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe("CommandPalette", () => {
  beforeEach(() => {
    mockPush.mockClear();
    useCommandPaletteStore.setState({ open: false });
  });

  it("opens when the trigger is clicked and lists navigation targets", async () => {
    const user = userEvent.setup();
    render(
      <>
        <CommandPaletteTrigger />
        <CommandPalette />
      </>
    );

    await user.click(
      screen.getByRole("button", { name: /open search and navigation/i })
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search pages…")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("navigates and closes when an item is chosen", async () => {
    const user = userEvent.setup();
    render(
      <>
        <CommandPaletteTrigger />
        <CommandPalette />
      </>
    );

    await user.click(
      screen.getByRole("button", { name: /open search and navigation/i })
    );
    await user.click(screen.getByText("Reports"));

    expect(mockPush).toHaveBeenCalledWith("/reports");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("opens and toggles closed with Ctrl+K", async () => {
    const user = userEvent.setup();
    render(<CommandPalette />);

    await user.keyboard("{Control>}k{/Control}");

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Control>}k{/Control}");

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("filters items when searching", async () => {
    const user = userEvent.setup();
    useCommandPaletteStore.setState({ open: true });
    render(<CommandPalette />);

    const input = screen.getByPlaceholderText("Search pages…");
    await user.type(input, "sett");

    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.queryByText("Products")).not.toBeInTheDocument();
  });
});
