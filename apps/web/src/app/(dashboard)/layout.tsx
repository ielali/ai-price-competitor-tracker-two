import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { AppBreadcrumbs } from "@/components/layout/breadcrumbs";
import { getSessionFromCookies } from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionFromCookies();
  const userEmail = session?.email ?? "";

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:z-[100] focus:top-4 focus:left-4 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:text-sm focus:font-medium focus:shadow-lg"
      >
        Skip to content
      </a>

      <div className="flex h-screen overflow-hidden">
        <Sidebar userEmail={userEmail} />

        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-y-auto focus:outline-none pb-16 md:pb-0"
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
