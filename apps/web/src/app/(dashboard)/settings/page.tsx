import { SignOutSection } from './sign-out-section';

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      <p className="mt-2 text-muted-foreground">
        Application settings coming soon.
      </p>
      <SignOutSection />
    </div>
  );
}
