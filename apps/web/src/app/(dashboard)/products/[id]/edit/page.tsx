import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function EditProductPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Edit product {params.id}</h1>
      <p className="text-muted-foreground">Editing will be available once the product detail story ships.</p>
      <Button asChild variant="outline">
        <Link href="/products">Back to list</Link>
      </Button>
    </div>
  );
}
