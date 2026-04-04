import { SignOutButton } from '@/components/auth/sign-out-button';

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      <p className="mt-2 text-muted-foreground">
        Application settings coming soon.
      </p>
      <section className="mt-8 rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-medium">Session</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          End your session on this device.
        </p>
        <div className="mt-4">
          <SignOutButton />
        </div>
      </section>
    </div>
  );
}
