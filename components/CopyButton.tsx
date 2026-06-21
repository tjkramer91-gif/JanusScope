"use client";

import { useState } from "react";

export function CopyButton({
  value,
  className = "button-secondary",
  label = "Copy",
}: {
  value: string;
  className?: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      className={className}
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      }}
    >
      {copied ? "Copied" : label}
    </button>
  );
}
