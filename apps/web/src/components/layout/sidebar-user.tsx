'use client';

import { signOut, useSession } from 'next-auth/react';
import { LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function SidebarUser({ collapsed }: { collapsed: boolean }) {
  const { data } = useSession();
  const email = data?.user?.email ?? '';

  return (
    <div className={cn('border-t border-border px-2 py-2', collapsed && 'px-1')}>
      {!collapsed && (
        <div
          className="flex items-center gap-2 truncate px-2 py-1 text-xs text-muted-foreground"
          title={email}
        >
          <User className="size-4 shrink-0" aria-hidden />
          <span className="truncate">{email || '—'}</span>
        </div>
      )}
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/login' })}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-muted-foreground transition-colors',
                'hover:bg-accent/50 hover:text-accent-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                collapsed && 'justify-center px-0',
              )}
            >
              <LogOut className="size-4 shrink-0" aria-hidden />
              {!collapsed && <span>Sign out</span>}
            </button>
          }
        />
        {collapsed ? (
          <TooltipContent side="right">Sign out</TooltipContent>
        ) : null}
      </Tooltip>
    </div>
  );
}
