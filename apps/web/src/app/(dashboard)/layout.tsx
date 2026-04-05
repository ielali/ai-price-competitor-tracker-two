import { Sidebar } from "@/components/layout/sidebar";
import { MobileHeader } from "@/components/layout/mobile-header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { AppBreadcrumbs } from "@/components/layout/breadcrumbs";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:z-[100] focus:top-4 focus:left-4 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:text-sm focus:font-medium focus:shadow-lg"
      >
        Skip to content
      </a>

      <MobileHeader />

      <div className="flex h-screen overflow-hidden">
        <Sidebar />

        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-y-auto focus:outline-none pt-[calc(3.5rem+env(safe-area-inset-top,0px))] pb-[calc(4rem+env(safe-area-inset-bottom,0px))] md:pt-0 md:pb-0"
        >
          <div className="mx-auto max-w-content p-6">
            <AppBreadcrumbs />
            <div className="mt-2">{children}</div>
          </div>
        </main>
      </div>

      <MobileNav />
    </>
  );
}
