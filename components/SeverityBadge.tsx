import { Severity } from "@/lib/types";
import { severityLabel } from "@/lib/format";

const styles: Record<Severity, string> = {
  low: "border-line/70 bg-paper text-moss",
  medium: "border-[#e8d7a6] bg-[#fff8e6] text-[#7a5700]",
  high: "border-[#f0c9ad] bg-[#fff1e8] text-[#8a3f11]",
  critical: "border-[#efc0bc] bg-[#fff0ee] text-[#9f241a]",
};

export function SeverityBadge({ severity, className = "" }: { severity: Severity; className?: string }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase ${styles[severity]} ${className}`}
    >
      {severityLabel(severity)}
    </span>
  );
}
