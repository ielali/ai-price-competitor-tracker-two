import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useAlertHistoryStore } from "@/stores/alert-history-store";
import { ALERT_HISTORY_SEED } from "@/lib/alert-history-seed";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/ui/tooltip", () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipTrigger: ({
    children,
    render,
  }: {
    children: React.ReactNode;
    render?: React.ReactElement;
  }) => {
    if (render) {
      const el = render as React.ReactElement<Record<string, unknown>>;
      const Comp = el.type as React.ElementType;
      return <Comp {...el.props}>{children}</Comp>;
    }
    return <>{children}</>;
  },
  TooltipContent: ({ children }: { children: React.ReactNode }) => (
    <div role="tooltip">{children}</div>
  ),
  TooltipProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

const mockToggle = vi.fn();

vi.mock("@/stores/sidebar-store", () => ({
  useSidebarStore: () => ({
    collapsed: false,
    toggle: mockToggle,
  }),
}));

describe("Unread alert badges on navigation (AC5)", () => {
  beforeEach(() => {
    mockToggle.mockClear();
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

  it("Sidebar shows unread count on Alerts when seed has unread new items", () => {
    render(<Sidebar />);
    expect(
      screen.getByLabelText("2 unread alerts", { selector: "span" })
    ).toBeInTheDocument();
  });

  it("MobileNav shows unread count on Alerts when seed has unread new items", () => {
    render(<MobileNav />);
    expect(
      screen.getByLabelText("2 unread alerts", { selector: "span" })
    ).toBeInTheDocument();
  });

  it("nav badges hide when there are no unread non-archived new alerts", () => {
    useAlertHistoryStore.setState({
      entries: ALERT_HISTORY_SEED.map((e) =>
        e.status === "new" ? { ...e, status: "acknowledged" as const } : e
      ),
    });
    render(<Sidebar />);
    render(<MobileNav />);
    expect(screen.queryByLabelText(/unread alerts/)).not.toBeInTheDocument();
  });
});
