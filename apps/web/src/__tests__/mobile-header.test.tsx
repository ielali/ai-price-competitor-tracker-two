import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MobileHeader } from "@/components/layout/mobile-header";

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

describe("MobileHeader", () => {
  beforeEach(() => {
    mockPathname = "/";
  });

  it("renders Settings as an icon link to /settings", () => {
    render(<MobileHeader />);
    const link = screen.getByRole("link", { name: "Settings" });
    expect(link).toHaveAttribute("href", "/settings");
  });

  it("marks Settings as current page when on /settings", () => {
    mockPathname = "/settings";
    render(<MobileHeader />);
    const link = screen.getByRole("link", { name: "Settings" });
    expect(link).toHaveAttribute("aria-current", "page");
  });

  it("does not mark current page on other routes", () => {
    mockPathname = "/products";
    render(<MobileHeader />);
    const link = screen.getByRole("link", { name: "Settings" });
    expect(link).not.toHaveAttribute("aria-current");
  });
});
