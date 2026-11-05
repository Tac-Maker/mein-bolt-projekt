interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div className="flex rounded-xl bg-base-off border border-hairline p-1">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`no-tap-highlight flex-1 rounded-lg py-2 px-2 text-[12px] font-semibold tracking-tight transition-all duration-200 ${
              active
                ? 'bg-base-white text-carbon shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
                : 'text-technical hover:text-carbon'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
