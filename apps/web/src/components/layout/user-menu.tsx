'use client';

import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export function UserMenu() {
  const { data, status } = useSession();

  if (status === 'loading') {
    return (
      <span className="text-muted-foreground text-sm" aria-live="polite">
        …
      </span>
    );
  }

  const email = data?.user?.email;

  return (
    <div className="flex items-center gap-3">
      {email ? (
        <span className="text-muted-foreground hidden max-w-[200px] truncate text-sm sm:inline">
          {email}
        </span>
      ) : null}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => signOut({ callbackUrl: '/login' })}
      >
        Sign out
      </Button>
    </div>
  );
}
