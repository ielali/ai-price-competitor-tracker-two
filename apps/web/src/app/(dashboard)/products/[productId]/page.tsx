interface ProductDetailPageProps {
  params: { productId: string };
}

export default function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { productId } = params;

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Product</h1>
      <p className="mt-2 text-muted-foreground">
        <span className="font-mono text-foreground">{productId}</span> — full
        product detail ships with Epic 2. Use the sidebar to return to Alerts
        or other sections.
      </p>
    </div>
  );
}
