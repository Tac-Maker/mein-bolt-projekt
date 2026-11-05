interface MetricCardProps {
  label: string;
  value: string;
  unit?: string;
  badge?: boolean;
}

export function MetricCard({ label, value, unit, badge = false }: MetricCardProps) {
  if (badge) {
    return (
      <div className="rounded-xl border border-hairline bg-base-white p-4 flex flex-col justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-technical">
          {label}
        </span>
        <div className="mt-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-signal px-2.5 py-1">
            <span className="font-mono-tight text-[12px] font-semibold text-base-white">
              ±{value}
            </span>
            <span className="text-[10px] font-semibold text-base-white/90">{unit}</span>
          </span>
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-hairline bg-base-white p-4 flex flex-col justify-between">
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-technical">
        {label}
      </span>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="font-mono-tight text-[26px] font-semibold leading-none text-carbon">
          {value}
        </span>
        {unit && <span className="font-mono-tight text-[12px] text-technical">{unit}</span>}
      </div>
    </div>
  );
}
