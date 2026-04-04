import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

import { ProductListTable } from "@/components/products/product-list-table";
import { createMockProducts } from "@/lib/products/mock-products";

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

describe("ProductListTable", () => {
  it("shows empty state and add-product link when there are no products", () => {
    render(<ProductListTable initialProducts={[]} />);
    expect(screen.getByText(/track your first product/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /add product/i })).toHaveAttribute("href", "/products/add");
  });

  it("filters rows by product name search", async () => {
    const user = userEvent.setup();
    const products = createMockProducts(8, 7);
    render(<ProductListTable initialProducts={products} />);
    await user.type(screen.getByPlaceholderText(/search name or sku/i), "Alpha");
    expect(screen.getByText("Alpha Test Widget")).toBeInTheDocument();
    expect(screen.queryByText("Sample Product 8")).not.toBeInTheDocument();
  });

  it("exposes sort buttons with aria-sort on product name column", async () => {
    const user = userEvent.setup();
    const products = createMockProducts(4, 3);
    render(<ProductListTable initialProducts={products} />);
    const nameHeader = screen.getByRole("columnheader", { name: /product name/i });
    const sortBtn = within(nameHeader).getByRole("button");
    expect(nameHeader).toHaveAttribute("aria-sort", "none");
    await user.click(sortBtn);
    expect(nameHeader.getAttribute("aria-sort")).toMatch(/ascending|descending/);
  });

  it("switches to virtualized mode when more than 100 products match", () => {
    const products = createMockProducts(105, 11);
    render(<ProductListTable initialProducts={products} />);
    expect(
      screen.getByText(/showing all 105 matching products in a scrollable list/i)
    ).toBeInTheDocument();
  });
});
