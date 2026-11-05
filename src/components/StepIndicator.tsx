import { STEP_LABELS } from '@/types';
import type { StepIndex } from '@/types';

interface StepIndicatorProps {
  step: StepIndex;
}

export function StepIndicator({ step }: StepIndicatorProps) {
  const total = STEP_LABELS.length;
  return (
    <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b border-hairline bg-base-white">
      <div className="flex items-baseline gap-2">
        <span className="font-mono-tight text-[12px] font-semibold text-carbon">
          SCHRITT {String(step + 1).padStart(2, '0')}
        </span>
        <span className="font-mono-tight text-[12px] text-technical">/ {String(total).padStart(2, '0')}</span>
      </div>
      <h1 className="text-[13px] font-semibold tracking-tight text-carbon">Schuhwerker 3D</h1>
      <div className="flex items-center gap-1.5">
        {STEP_LABELS.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === step ? 'w-5 bg-signal' : i < step ? 'w-3 bg-carbon' : 'w-3 bg-hairline'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
