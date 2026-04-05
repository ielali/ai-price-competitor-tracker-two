"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { bottomNavItem } from "./nav-items";

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function MobileHeader() {
  const pathname = usePathname();
  const active = isActivePath(pathname, bottomNavItem.href);

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-50 border-b border-border bg-card pt-[env(safe-area-inset-top)]">
      <div className="flex h-14 items-center justify-end px-4">
        <Link
          href={bottomNavItem.href}
          aria-current={active ? "page" : undefined}
          aria-label={bottomNavItem.label}
          className={cn(
            "inline-flex size-10 items-center justify-center rounded-md transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            active
              ? "bg-accent text-primary"
              : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
          )}
        >
          <Settings className="size-5 shrink-0" aria-hidden />
        </Link>
      </div>
    </header>
  );
}
