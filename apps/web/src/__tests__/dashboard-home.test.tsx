import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { DashboardHome } from "@/components/dashboard/dashboard-home";

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

describe("DashboardHome", () => {
  it("renders overview metrics from demo data", () => {
    render(<DashboardHome />);
    expect(screen.getByRole("heading", { level: 1, name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByText("Tracked products")).toBeInTheDocument();
    expect(screen.getByText("24")).toBeInTheDocument();
    expect(screen.getByText("Active competitor sources")).toBeInTheDocument();
  });

  it("lists recent alerts in a table", () => {
    render(<DashboardHome />);
    expect(screen.getByRole("heading", { name: "Recent alerts" })).toBeInTheDocument();
    expect(
      screen.getByRole("cell", { name: "Price dropped below floor" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /View all/i })
    ).toHaveAttribute("href", "/alerts");
  });

  it("exposes quick links to main app areas", () => {
    render(<DashboardHome />);
    const productsCard = screen.getByRole("link", { name: /Products/i });
    expect(productsCard).toHaveAttribute("href", "/products");
    expect(screen.getByRole("link", { name: /Competitors/i })).toHaveAttribute(
      "href",
      "/competitors"
    );
  });
});
