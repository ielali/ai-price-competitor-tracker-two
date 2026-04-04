'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useSidebarStore } from '@/stores/sidebar-store';
import { mainNavItems, bottomNavItem } from './nav-items';

function isActivePath(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

export function Sidebar() {
  const { data: session } = useSession();
  const { collapsed, toggle } = useSidebarStore();
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'border-border bg-card hidden flex-col overflow-hidden border-r transition-all duration-200 motion-reduce:transition-none md:flex',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      <nav aria-label="Main navigation" className="flex flex-1 flex-col py-4">
        <ul className="flex flex-1 flex-col gap-1 px-2">
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
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                          'focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                          active
                            ? 'bg-accent text-accent-foreground border-primary border-l-2'
                            : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground border-l-2 border-transparent',
                        )}
                      />
                    }
                  >
                    <Icon className="size-5 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </TooltipTrigger>
                  {collapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
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
                    aria-current={isActivePath(pathname, bottomNavItem.href) ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      'focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                      isActivePath(pathname, bottomNavItem.href)
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground',
                    )}
                  />
                }
              >
                <bottomNavItem.icon className="size-5 shrink-0" />
                {!collapsed && <span>{bottomNavItem.label}</span>}
              </TooltipTrigger>
              {collapsed && <TooltipContent side="right">{bottomNavItem.label}</TooltipContent>}
            </Tooltip>
          </li>
        </ul>
      </nav>

      <div className="border-border space-y-1 border-t px-2 py-2">
        {session?.user?.email && !collapsed && (
          <p
            className="text-muted-foreground truncate px-3 py-1 text-xs"
            title={session.user.email ?? undefined}
          >
            {session.user.email}
          </p>
        )}
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/login' })}
                className={cn(
                  'text-muted-foreground flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  'hover:bg-accent/50 hover:text-accent-foreground',
                  'focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                )}
              />
            }
          >
            <LogOut className="size-5 shrink-0" />
            {!collapsed && <span>Sign out</span>}
          </TooltipTrigger>
          {collapsed && (
            <TooltipContent side="right">
              Sign out
              {session?.user?.email ? ` — ${session.user.email}` : ''}
            </TooltipContent>
          )}
        </Tooltip>
      </div>

      <div className="border-border border-t px-2 py-2">
        <button
          onClick={toggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          className={cn(
            'text-muted-foreground flex w-full items-center justify-center rounded-md p-2 transition-colors',
            'hover:bg-accent/50 hover:text-accent-foreground',
            'focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          )}
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>
      </div>
    </aside>
  );
}
