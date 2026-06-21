import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { DemoAccessForm } from "@/components/DemoAccessForm";
import { safeReturnTo } from "@/lib/return-to";
import { getSession, isDemoAccessEnabled } from "@/lib/server/auth";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ returnTo?: string }> }) {
  const { returnTo } = await searchParams;
  const destination = safeReturnTo(returnTo);
  const session = await getSession();
  if (session) redirect(destination);

  return (
    <main className="min-h-screen bg-paper px-5 py-12">
      <AuthForm mode="login" returnTo={destination} />
      {isDemoAccessEnabled() ? <DemoAccessForm returnTo={destination} /> : null}
    </main>
  );
}
