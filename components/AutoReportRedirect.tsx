"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function AutoReportRedirect({ href }: { href: string }) {
  const router = useRouter();

  useEffect(() => {
    const timer = window.setTimeout(() => router.replace(href), 2600);
    return () => window.clearTimeout(timer);
  }, [href, router]);

  return (
    <p className="text-sm font-semibold text-steel">
      Review is ready. Opening the risk output now.
    </p>
  );
}
