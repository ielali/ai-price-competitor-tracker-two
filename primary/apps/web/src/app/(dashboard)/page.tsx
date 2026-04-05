import { auth } from '@/auth';

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Welcome to the AI Competitor Price Tracker
        {session?.user?.email ? `, ${session.user.email}` : ''}. Your dashboard overview will appear
        here.
      </p>
    </div>
  );
}
