'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      <p className="text-muted-foreground mt-2">Application settings coming soon.</p>
      <div className="border-border bg-card mt-8 max-w-md rounded-lg border p-6">
        <h2 className="text-foreground text-sm font-medium">Session</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Sign out on this device. You will need to sign in again to use the dashboard.
        </p>
        <Button
          type="button"
          variant="secondary"
          className="mt-4"
          onClick={() => signOut({ callbackUrl: '/login' })}
        >
          Sign out
        </Button>
      </div>
    </div>
  );
}
