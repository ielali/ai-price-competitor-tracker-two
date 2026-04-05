"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      <p className="mt-2 text-muted-foreground">
        Application settings coming soon.
      </p>
      <div className="mt-8 max-w-md rounded-lg border border-border bg-card p-6">
        <h2 className="text-sm font-medium text-foreground">Session</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign out on this device. You will need to sign in again to use the
          dashboard.
        </p>
        <Button
          type="button"
          variant="secondary"
          className="mt-4"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          Sign out
        </Button>
      </div>
    </div>
  );
}
