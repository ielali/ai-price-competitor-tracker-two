import type { ReactElement, ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import DashboardLayout from "@/app/(dashboard)/layout";

vi.mock("next/navigation", () => ({
  usePathname: () => "/products",
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

vi.mock("@/stores/sidebar-store", () => ({
  useSidebarStore: () => ({
    collapsed: false,
    toggle: vi.fn(),
  }),
}));

vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { email: "user@example.com", id: "user@example.com" } },
    status: "authenticated",
  }),
  signOut: vi.fn(),
}));

vi.mock("@/auth", () => ({
  auth: vi.fn().mockResolvedValue({
    user: { email: "user@example.com", id: "user@example.com" },
  }),
}));

vi.mock("@/components/ui/breadcrumb", () => ({
  Breadcrumb: ({ children, ...props }: React.ComponentProps<"nav">) => (
    <nav aria-label="Breadcrumb" {...props}>
      {children}
    </nav>
  ),
  BreadcrumbList: ({ children, ...props }: React.ComponentProps<"ol">) => (
    <ol {...props}>{children}</ol>
  ),
  BreadcrumbItem: ({ children, ...props }: React.ComponentProps<"li">) => (
    <li {...props}>{children}</li>
  ),
  BreadcrumbLink: ({
    children,
    render,
  }: {
    children?: React.ReactNode;
    render?: React.ReactElement;
  }) => {
    if (render) {
      const el = render as React.ReactElement<Record<string, unknown>>;
      const Comp = el.type as React.ElementType;
      return <Comp {...el.props}>{children}</Comp>;
    }
    return <a>{children}</a>;
  },
  BreadcrumbPage: ({ children, ...props }: React.ComponentProps<"span">) => (
    <span aria-current="page" {...props}>
      {children}
    </span>
  ),
  BreadcrumbSeparator: () => <li aria-hidden="true">/</li>,
}));

describe("DashboardLayout", () => {
  async function renderDashboard(children: ReactNode) {
    const ui = await DashboardLayout({ children });
    render(ui as ReactElement);
  }

  it("renders skip-to-content link as first focusable element", async () => {
    await renderDashboard(<div>Page content</div>);
    const skipLink = screen.getByText("Skip to content");
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute("href", "#main-content");
    expect(skipLink.tagName).toBe("A");
  });

  it("renders main content area with correct id and tabindex", async () => {
    await renderDashboard(<div>Page content</div>);
    const main = screen.getByRole("main");
    expect(main).toHaveAttribute("id", "main-content");
    expect(main).toHaveAttribute("tabindex", "-1");
  });

  it("renders children inside the content area", async () => {
    await renderDashboard(
      <div data-testid="child">Hello world</div>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("renders sidebar component", async () => {
    await renderDashboard(<div>Page content</div>);
    expect(
      screen.getByRole("navigation", { name: "Main navigation" }),
    ).toBeInTheDocument();
  });

  it("renders mobile navigation", async () => {
    await renderDashboard(<div>Page content</div>);
    expect(
      screen.getByRole("navigation", { name: "Mobile navigation" }),
    ).toBeInTheDocument();
  });

  it("renders breadcrumbs for non-root pages", async () => {
    await renderDashboard(<div>Page content</div>);
    expect(
      screen.getByRole("navigation", { name: "Breadcrumb" }),
    ).toBeInTheDocument();
  });

  it("content area has max-width container with p-6 padding", async () => {
    await renderDashboard(<div data-testid="child">Page content</div>);
    const main = screen.getByRole("main");
    const container = main.firstElementChild;
    expect(container).toHaveClass("mx-auto", "max-w-content", "p-6");
  });
});
