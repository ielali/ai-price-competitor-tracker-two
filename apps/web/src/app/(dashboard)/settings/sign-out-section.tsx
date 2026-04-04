'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export function SignOutSection() {
  return (
    <div className="mt-8 rounded-lg border border-border p-4">
      <h2 className="text-sm font-medium">Session</h2>
      <p className="mt-1 text-sm text-muted-foreground">Sign out on this device.</p>
      <Button
        type="button"
        className="mt-4"
        variant="outline"
        onClick={() => signOut({ callbackUrl: '/login' })}
      >
        Sign out
      </Button>
    </div>
  );
}
