import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Product {params.id}</h1>
      <p className="text-muted-foreground">Product detail view will be added in a later story.</p>
      <Button asChild variant="outline">
        <Link href="/products">Back to list</Link>
      </Button>
    </div>
  );
}
