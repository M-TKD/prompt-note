export function ProBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold font-mono uppercase tracking-widest rounded bg-[#4F46E5] text-white ${className}`}
    >
      Pro
    </span>
  );
}
