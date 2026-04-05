import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AlertHistoryView } from "@/components/alerts/alert-history-view";
import { useAlertHistoryStore } from "@/stores/alert-history-store";
import { ALERT_HISTORY_SEED } from "@/lib/alert-history-seed";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

describe("AlertHistoryView", () => {
  beforeEach(() => {
    push.mockClear();
    useAlertHistoryStore.setState({
      entries: structuredClone(ALERT_HISTORY_SEED),
      selectedIds: [],
      productFilter: "all",
      statusFilter: "all",
      dateFrom: "",
      dateTo: "",
      showArchived: false,
    });
  });

  it("renders alert rows with status badges", { timeout: 15000 }, () => {
    render(<AlertHistoryView />);
    const table = screen.getByRole("table");
    expect(within(table).getAllByText("Widget Pro").length).toBeGreaterThan(0);
    expect(screen.getAllByText("New").length).toBeGreaterThan(0);
  });

  it("navigates to product when a row is clicked", () => {
    render(<AlertHistoryView />);
    const table = screen.getByRole("table");
    const cell = within(table).getAllByText("Widget Pro")[0]!;
    const row = cell.closest("tr");
    expect(row).not.toBeNull();
    fireEvent.click(row!);
    expect(push).toHaveBeenCalledWith("/products/prod-a");
  });

  it("mark as read bulk action acknowledges new items", () => {
    render(<AlertHistoryView />);
    const checkboxes = screen.getAllByRole("checkbox", {
      name: /Select alert/,
    });
    fireEvent.click(checkboxes[0]!);
    fireEvent.click(screen.getByRole("button", { name: "Mark as read" }));
    const entry = useAlertHistoryStore
      .getState()
      .entries.find((e) => e.id === "ah-001");
    expect(entry?.status).toBe("acknowledged");
  });
});
