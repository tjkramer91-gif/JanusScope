"use client";

import { useEffect } from "react";

export default function NewProjectError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[subscope]", {
      event: "project_new.route_error",
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="mx-auto max-w-[760px] rounded-[24px] border border-[#efc0bc] bg-[#fff7f5] p-8 text-brick">
      <p className="text-sm font-semibold uppercase">Create project error</p>
      <h1 className="mt-3 text-2xl font-semibold text-ink">Something went wrong loading project creation.</h1>
      <p className="mt-3 text-sm leading-6">
        Please try again or contact support.
      </p>
      <button className="button-secondary mt-6" type="button" onClick={reset}>
        Try Again
      </button>
    </div>
  );
}
