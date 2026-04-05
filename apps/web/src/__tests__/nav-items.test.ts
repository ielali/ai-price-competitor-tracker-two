import { describe, it, expect } from "vitest";
import { mainNavItems, bottomNavItem } from "@/components/layout/nav-items";

describe("nav-items", () => {
  it("has 5 main nav items", () => {
    expect(mainNavItems).toHaveLength(5);
  });

  it("main items have correct labels", () => {
    const labels = mainNavItems.map((item) => item.label);
    expect(labels).toEqual([
      "Dashboard",
      "Products",
      "Competitors",
      "Alerts",
      "Reports",
    ]);
  });

  it("main items have correct hrefs", () => {
    const hrefs = mainNavItems.map((item) => item.href);
    expect(hrefs).toEqual(["/", "/products", "/competitors", "/alerts", "/reports"]);
  });

  it("bottom nav item is Settings", () => {
    expect(bottomNavItem.label).toBe("Settings");
    expect(bottomNavItem.href).toBe("/settings");
  });

  it("all items have icons", () => {
    for (const item of mainNavItems) {
      expect(item.icon).toBeDefined();
    }
    expect(bottomNavItem.icon).toBeDefined();
  });
});
