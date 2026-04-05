import { Sidebar } from '@/components/layout/sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { AppBreadcrumbs } from '@/components/layout/breadcrumbs';
import { UserMenu } from '@/components/layout/user-menu';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main-content"
        className="focus:bg-primary focus:text-primary-foreground sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg"
      >
        Skip to content
      </a>

      <div className="flex h-screen overflow-hidden">
        <Sidebar />

        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-y-auto pb-16 focus:outline-none md:pb-0"
        >
          <div className="max-w-content mx-auto p-6">
            <div className="mb-4 flex justify-end">
              <UserMenu />
            </div>
            <AppBreadcrumbs />
            <div className="mt-2">{children}</div>
          </div>
        </main>
      </div>

      <MobileNav />
    </>
  );
}
