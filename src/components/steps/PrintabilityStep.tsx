import { Check, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { PrimaryButton } from '@/components/ui/Button';
import type { AppState } from '@/types';
import { PRINTER_VOLUMES } from '@/types';

interface PrintabilityStepProps {
  state: AppState;
  onNext: () => void;
}

const CHECKS = [
  { title: 'Wandstärken-Validierung', detail: '1.8 mm (Min. 1.6 mm gefordert)' },
  { title: 'Überhang-Analyse', detail: 'Max. 51.5° (Support-frei druckbar)' },
  { title: 'Bauraum-Kollision', detail: '100% passend via 45° Diagonal Placement' },
];

export function PrintabilityStep({ state, onNext }: PrintabilityStepProps) {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide bg-base-off">
      <div className="px-5 py-5 space-y-4">
        <Card className="bg-base-white">
          <p className="text-[11px] uppercase tracking-[0.14em] text-technical font-semibold">
            Ausgewählter Bauraum
          </p>
          <p className="text-[16px] font-semibold text-carbon mt-3">{state.printer}</p>
          <p className="font-mono-tight text-[12px] text-technical mt-0.5">{PRINTER_VOLUMES[state.printer]}</p>
        </Card>

        <Card padding="sm" className="bg-base-white">
          <div className="divide-y divide-hairline">
            {CHECKS.map((check) => (
              <div key={check.title} className="flex items-start justify-between gap-3 px-1 py-3 first:pt-1 last:pb-1">
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold text-carbon leading-tight">{check.title}</p>
                  <p className="text-[12px] text-technical mt-1 leading-snug">{check.detail}</p>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-verified-bg px-2.5 py-1 text-[11px] font-semibold text-verified shrink-0">
                  <Check className="w-3 h-3" strokeWidth={3} />
                  OK
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-base-white">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-carbon shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-carbon">Monomaterial TPU</p>
              <p className="font-mono-tight text-[11px] uppercase tracking-[0.08em] text-technical mt-1">
                Shore 90A · 100% recycelbar
              </p>
              <div className="space-y-2 mt-4">
                <div className="flex items-start gap-2 text-[13px] text-technical">
                  <Check className="w-4 h-4 text-carbon shrink-0 mt-0.5" strokeWidth={2.5} />
                  <span>Keine giftigen Klebstoffe</span>
                </div>
                <div className="flex items-start gap-2 text-[13px] text-technical leading-snug">
                  <Check className="w-4 h-4 text-carbon shrink-0 mt-0.5" strokeWidth={2.5} />
                  <span>Vorkonfigurierte Lüfter- und Geschwindigkeitsparameter</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="sticky bottom-0 px-5 py-4 bg-gradient-to-t from-base-off via-base-off to-transparent">
        <PrimaryButton onClick={onNext}>Fertigungsdaten generieren</PrimaryButton>
      </div>
    </div>
  );
}
