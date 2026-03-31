"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebarStore } from "@/stores/sidebar-store";
import { mainNavItems, bottomNavItem } from "./nav-items";

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function Sidebar() {
  const { collapsed, toggle } = useSidebarStore();
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r border-border bg-card transition-all duration-200 motion-reduce:transition-none overflow-hidden",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <nav aria-label="Main navigation" className="flex flex-col flex-1 py-4">
        <ul className="flex flex-col gap-1 px-2 flex-1">
          {mainNavItems.map((item) => {
            const active = isActivePath(pathname, item.href);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                          active
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                        )}
                      />
                    }
                  >
                    <Icon className="size-5 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right">
                      {item.label}
                    </TooltipContent>
                  )}
                </Tooltip>
              </li>
            );
          })}

          <li className="mt-auto">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Link
                    href={bottomNavItem.href}
                    aria-current={
                      isActivePath(pathname, bottomNavItem.href)
                        ? "page"
                        : undefined
                    }
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      isActivePath(pathname, bottomNavItem.href)
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                    )}
                  />
                }
              >
                <bottomNavItem.icon className="size-5 shrink-0" />
                {!collapsed && <span>{bottomNavItem.label}</span>}
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right">
                  {bottomNavItem.label}
                </TooltipContent>
              )}
            </Tooltip>
          </li>
        </ul>
      </nav>

      <div className="border-t border-border px-2 py-2">
        <button
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          className={cn(
            "flex items-center justify-center w-full rounded-md p-2 text-muted-foreground transition-colors",
            "hover:bg-accent/50 hover:text-accent-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          )}
        >
          {collapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronLeft className="size-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
