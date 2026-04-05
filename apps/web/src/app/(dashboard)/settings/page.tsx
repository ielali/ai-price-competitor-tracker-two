<<<<<<< ours
import { LogoutButton } from "@/components/auth/logout-button";

=======
>>>>>>> theirs
export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      <p className="mt-2 text-muted-foreground">
        Application settings coming soon.
      </p>
<<<<<<< ours

      <section
        className="mt-10 max-w-md rounded-lg border border-border bg-card p-6"
        aria-labelledby="session-heading"
      >
        <h2 id="session-heading" className="text-lg font-semibold">
          Session
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign out on this device. You will need to sign in again to use the app.
        </p>
        <div className="mt-4">
          <LogoutButton className="w-full sm:w-auto" />
        </div>
      </section>
=======
>>>>>>> theirs
    </div>
  );
}
