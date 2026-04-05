import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

import { logoutAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { sessionOptions, type SessionData } from "@/lib/session";

export default async function SettingsPage() {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  const email = session.user?.email;

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      <p className="mt-2 text-muted-foreground">
        Application settings coming soon.
      </p>
      {email ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Signed in as{" "}
          <span className="font-medium text-foreground">{email}</span>
        </p>
      ) : null}
      <form action={logoutAction} className="mt-8">
        <Button
          type="submit"
          variant="outline"
          className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Sign out
        </Button>
      </form>
    </div>
  );
}
