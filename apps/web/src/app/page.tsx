import { DesignSystemDemo } from "@/components/design-system-demo"

export default function Home() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <main
        id="main-content"
        className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-12"
      >
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Competitor Price Tracker
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Application shell with Inter, Tailwind design tokens, and shadcn/ui
            primitives.
          </p>
        </header>
        <DesignSystemDemo />
      </main>
    </>
  )
}
