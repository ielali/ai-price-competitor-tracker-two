"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAlertHistoryStore } from "@/stores/alert-history-store";
import { countUnreadAlerts } from "@/lib/alert-history-filters";
import { mainNavItems } from "./nav-items";

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function MobileNav() {
  const pathname = usePathname();
  const unreadAlerts = useAlertHistoryStore((s) =>
    countUnreadAlerts(s.entries)
  );

  return (
    <nav
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="flex items-center justify-around">
        {mainNavItems.map((item) => {
          const active = isActivePath(pathname, item.href);
          const Icon = item.icon;

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 py-2 text-[10px] font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="relative inline-flex">
                  <Icon className="size-5" />
                  {item.href === "/alerts" && unreadAlerts > 0 ? (
                    <span
                      className="absolute -right-2 -top-1 flex min-w-4 justify-center rounded-full bg-primary px-1 text-[9px] font-semibold leading-4 text-primary-foreground"
                      aria-label={`${unreadAlerts} unread alerts`}
                    >
                      {unreadAlerts > 99 ? "99+" : unreadAlerts}
                    </span>
                  ) : null}
                </span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
