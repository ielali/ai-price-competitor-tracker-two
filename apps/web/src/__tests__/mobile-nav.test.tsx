import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MobileNav } from "@/components/layout/mobile-nav";

let mockPathname = "/";

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
<<<<<<< ours
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
=======
>>>>>>> theirs
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

<<<<<<< ours
vi.mock("@/stores/alert-history-store", () => ({
  useAlertHistoryStore: (selector: (s: { entries: [] }) => unknown) =>
    selector({ entries: [] }),
}));

=======
>>>>>>> theirs
describe("MobileNav", () => {
  beforeEach(() => {
    mockPathname = "/";
  });

  it("renders 5 navigation items (no Settings)", () => {
    render(<MobileNav />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Competitors")).toBeInTheDocument();
    expect(screen.getByText("Alerts")).toBeInTheDocument();
    expect(screen.getByText("Reports")).toBeInTheDocument();
    expect(screen.queryByText("Settings")).not.toBeInTheDocument();
  });

  it("has mobile navigation aria-label", () => {
    render(<MobileNav />);
    expect(
      screen.getByRole("navigation", { name: "Mobile navigation" })
    ).toBeInTheDocument();
  });

  it("highlights active item with aria-current", () => {
    mockPathname = "/alerts";
    render(<MobileNav />);
    const alertsLink = screen.getByText("Alerts").closest("a");
    expect(alertsLink).toHaveAttribute("aria-current", "page");
    const dashboardLink = screen.getByText("Dashboard").closest("a");
    expect(dashboardLink).not.toHaveAttribute("aria-current");
  });
});
