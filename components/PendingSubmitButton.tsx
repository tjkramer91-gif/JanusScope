"use client";

import { ReactNode } from "react";
import { useFormStatus } from "react-dom";

export function PendingSubmitButton({
  children,
  className,
  pendingLabel,
}: {
  children: ReactNode;
  className: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button className={className} type="submit" disabled={pending} aria-disabled={pending}>
      {pending ? pendingLabel : children}
    </button>
  );
}
