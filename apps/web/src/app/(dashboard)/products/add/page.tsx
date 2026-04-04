import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function AddProductPage() {
  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Add product</h1>
      <p className="text-muted-foreground">
        The multi-step add-product wizard will be implemented in the next story. For now, return to the
        product list to explore filtering and sorting.
      </p>
      <Button asChild variant="outline">
        <Link href="/products">Back to products</Link>
      </Button>
    </div>
  );
}
