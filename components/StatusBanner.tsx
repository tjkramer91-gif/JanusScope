type StatusTone = "success" | "error" | "info";

const toneClasses: Record<StatusTone, string> = {
  success: "border-[#bdd8c1] bg-[#f3faf4] text-[#2f6240]",
  error: "border-[#efc0bc] bg-[#fff7f5] text-brick",
  info: "border-line bg-white text-moss",
};

export function StatusBanner({ children, tone = "info" }: { children: string; tone?: StatusTone }) {
  return (
    <div className={`rounded-[20px] border p-4 text-sm font-semibold ${toneClasses[tone]}`} role={tone === "error" ? "alert" : "status"}>
      {children}
    </div>
  );
}
