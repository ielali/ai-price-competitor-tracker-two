import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Sidebar } from "@/components/layout/sidebar";

let mockPathname = "/";

const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
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
let mockCollapsed = false;

vi.mock("@/stores/sidebar-store", () => ({
  useSidebarStore: () => ({
    collapsed: mockCollapsed,
    toggle: mockToggle,
  }),
}));

describe("Sidebar", () => {
  beforeEach(() => {
    mockPathname = "/";
    mockCollapsed = false;
    mockToggle.mockClear();
  });

  it("shows user email when expanded", () => {
    render(<Sidebar userEmail="ada@example.com" />);
    expect(screen.getByText("ada@example.com")).toBeInTheDocument();
  });

  it("hides user email when collapsed", () => {
    mockCollapsed = true;
    render(<Sidebar userEmail="ada@example.com" />);
    expect(screen.queryByText("ada@example.com")).not.toBeInTheDocument();
  });

  it("renders all main navigation items", () => {
    render(<Sidebar />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Competitors")).toBeInTheDocument();
    expect(screen.getByText("Alerts")).toBeInTheDocument();
    expect(screen.getByText("Reports")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("renders navigation with proper aria-label", () => {
    render(<Sidebar />);
    expect(
      screen.getByRole("navigation", { name: "Main navigation" })
    ).toBeInTheDocument();
  });

  it("highlights the active nav item with aria-current='page'", () => {
    mockPathname = "/products";
    render(<Sidebar />);
    const productsLink = screen.getByText("Products").closest("a");
    expect(productsLink).toHaveAttribute("aria-current", "page");
    const dashboardLink = screen.getByText("Dashboard").closest("a");
    expect(dashboardLink).not.toHaveAttribute("aria-current");
  });

  it("highlights Dashboard when on root path", () => {
    mockPathname = "/";
    render(<Sidebar />);
    const dashboardLink = screen.getByText("Dashboard").closest("a");
    expect(dashboardLink).toHaveAttribute("aria-current", "page");
  });

  it("renders toggle button with correct aria-label when expanded", () => {
    mockCollapsed = false;
    render(<Sidebar />);
    const toggle = screen.getByLabelText("Collapse sidebar");
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });

  it("renders toggle button with correct aria-label when collapsed", () => {
    mockCollapsed = true;
    render(<Sidebar />);
    const toggle = screen.getByLabelText("Expand sidebar");
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("calls toggle when button is clicked", () => {
    render(<Sidebar />);
    const toggle = screen.getByLabelText("Collapse sidebar");
    fireEvent.click(toggle);
    expect(mockToggle).toHaveBeenCalledOnce();
  });

  it("hides inline labels when collapsed (labels only in tooltips)", () => {
    mockCollapsed = true;
    render(<Sidebar />);
    const links = screen.getAllByRole("link");
    for (const link of links) {
      const span = link.querySelector("span");
      expect(span).toBeNull();
    }
  });

  it("has correct nav item links", () => {
    render(<Sidebar />);
    expect(screen.getByText("Dashboard").closest("a")).toHaveAttribute(
      "href",
      "/"
    );
    expect(screen.getByText("Products").closest("a")).toHaveAttribute(
      "href",
      "/products"
    );
    expect(screen.getByText("Competitors").closest("a")).toHaveAttribute(
      "href",
      "/competitors"
    );
    expect(screen.getByText("Alerts").closest("a")).toHaveAttribute(
      "href",
      "/alerts"
    );
    expect(screen.getByText("Reports").closest("a")).toHaveAttribute(
      "href",
      "/reports"
    );
    expect(screen.getByText("Settings").closest("a")).toHaveAttribute(
      "href",
      "/settings"
    );
  });
});
