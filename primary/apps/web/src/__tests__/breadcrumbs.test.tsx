import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AppBreadcrumbs } from "@/components/layout/breadcrumbs";

let mockPathname = "/";

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
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

vi.mock("@/components/ui/breadcrumb", () => ({
  Breadcrumb: ({
    children,
    ...props
  }: React.ComponentProps<"nav">) => (
    <nav aria-label="Breadcrumb" {...props}>
      {children}
    </nav>
  ),
  BreadcrumbList: ({
    children,
    ...props
  }: React.ComponentProps<"ol">) => <ol {...props}>{children}</ol>,
  BreadcrumbItem: ({
    children,
    ...props
  }: React.ComponentProps<"li">) => <li {...props}>{children}</li>,
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
  BreadcrumbPage: ({
    children,
    ...props
  }: React.ComponentProps<"span">) => (
    <span aria-current="page" {...props}>
      {children}
    </span>
  ),
  BreadcrumbSeparator: () => <li aria-hidden="true">/</li>,
}));

describe("AppBreadcrumbs", () => {
  beforeEach(() => {
    mockPathname = "/";
  });

  it("returns null on dashboard root", () => {
    mockPathname = "/";
    const { container } = render(<AppBreadcrumbs />);
    expect(container.innerHTML).toBe("");
  });

  it("renders breadcrumb for products page", () => {
    mockPathname = "/products";
    render(<AppBreadcrumbs />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
  });

  it("shows Dashboard as a link", () => {
    mockPathname = "/products";
    render(<AppBreadcrumbs />);
    const dashboardLink = screen.getByText("Dashboard");
    expect(dashboardLink.closest("a")).toHaveAttribute("href", "/");
  });

  it("last segment is non-linked (current page)", () => {
    mockPathname = "/products";
    render(<AppBreadcrumbs />);
    const productsEl = screen.getByText("Products");
    expect(productsEl).toHaveAttribute("aria-current", "page");
  });

  it("renders multi-level breadcrumbs", () => {
    mockPathname = "/products/some-product";
    render(<AppBreadcrumbs />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Some Product")).toBeInTheDocument();
  });

  it("de-slugifies path segments correctly", () => {
    mockPathname = "/my-custom-page";
    render(<AppBreadcrumbs />);
    expect(screen.getByText("My Custom Page")).toBeInTheDocument();
  });

  it("has proper breadcrumb aria-label", () => {
    mockPathname = "/alerts";
    render(<AppBreadcrumbs />);
    expect(
      screen.getByRole("navigation", { name: "Breadcrumb" })
    ).toBeInTheDocument();
  });
});
