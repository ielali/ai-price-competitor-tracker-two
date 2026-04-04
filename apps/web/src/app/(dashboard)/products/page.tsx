import Link from "next/link";

import { ProductListTable } from "@/components/products/product-list-table";
import { Button } from "@/components/ui/button";
import { createDefaultMockProducts } from "@/lib/products/mock-products";

export default function ProductsPage() {
  const products = createDefaultMockProducts();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="mt-2 text-muted-foreground">
            Manage tracked products, filters, and bulk actions. Data is mocked until the API is wired.
          </p>
        </div>
        <Button asChild>
          <Link href="/products/add">Add product</Link>
        </Button>
      </div>
      <ProductListTable initialProducts={products} />
    </div>
  );
}
