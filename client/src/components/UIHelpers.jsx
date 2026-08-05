import { Star, PackageOpen } from "lucide-react";

export function ProductCardSkeleton() {
  return (
    <div className="card flex flex-col overflow-hidden">
      <div className="skeleton aspect-square w-full" />
      <div className="flex flex-col gap-2 p-4">
        <div className="skeleton h-3 w-16 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-2/3 rounded" />
        <div className="skeleton mt-2 h-9 w-full rounded-full" />
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon = PackageOpen, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-surface-border bg-surface-soft/50 px-6 py-16 text-center">
      <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-white shadow-card">
        <Icon size={28} className="text-brand-400" />
      </div>
      <h3 className="text-base font-bold text-ink-900">{title}</h3>
      {subtitle && <p className="mt-1 max-w-sm text-sm text-ink-500">{subtitle}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function StarRating({ value = 0, size = 14, onChange }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          className={onChange ? "cursor-pointer" : "cursor-default"}
          aria-label={`${n} star`}
        >
          <Star size={size} className={n <= value ? "fill-amber-400 text-amber-400" : "fill-transparent text-ink-300"} />
        </button>
      ))}
    </div>
  );
}

export function StatusBadge({ status }) {
  const map = {
    Pending: "bg-amber-100 text-amber-700",
    Processing: "bg-blue-100 text-blue-700",
    Shipped: "bg-purple-100 text-purple-700",
    Delivered: "bg-emerald-100 text-emerald-700",
    Cancelled: "bg-red-100 text-red-700",
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${map[status] || "bg-ink-100 text-ink-700"}`}>
      {status}
    </span>
  );
}
