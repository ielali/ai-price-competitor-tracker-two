'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export function SignOutButton() {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      Sign out
    </Button>
  );
}
