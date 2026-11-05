import { CheckCircle2, ArrowRight } from 'lucide-react';
import { ThreeFootViewer } from '@/components/ThreeFootViewer';
import { STLViewer } from '@/components/STLViewer';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { MetricCard } from '@/components/MetricCard';
import { Card, SectionLabel } from '@/components/ui/Card';
import { PrimaryButton } from '@/components/ui/Button';
import type { AppState } from '@/types';

interface MetricsStepProps {
  state: AppState;
  onNext: () => void;
}

export function MetricsStep({ state, onNext }: MetricsStepProps) {
  const m = state.metrics;
  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide bg-base-off">
      <div className="px-5 py-5 space-y-5">
        <div>
          <SectionLabel>3D-Scan</SectionLabel>
          <h2 className="text-[22px] font-semibold tracking-tight text-carbon leading-tight">
            {state.scanTarget === 'sole' ? 'Sohlenmodell' : 'Fußmetriken'}
          </h2>
        </div>

        <Card padding="sm" className="bg-base-white">
          <div className="h-52 -m-1 rounded-xl overflow-hidden bg-gradient-to-b from-base-off to-base-white">
            <ErrorBoundary fallback={<ThreeFootViewer className="w-full h-full" />}>
              <STLViewer
                url={state.scanTarget === 'sole' ? '/models/sohle.obj' : '/models/feet.OBJ'}
                color="#EA580C"
                scale={state.scanTarget === 'sole' ? 0.5 : 0.5}
                className="w-full h-full"
              />
            </ErrorBoundary>
          </div>
        </Card>

        <div>
          <SectionLabel>Präzisionsdaten</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <MetricCard label="Fußlänge" value={String(m.lengthMm)} unit="mm" />
            <MetricCard label="Vorfußbreite" value={String(m.forefootWidthMm)} unit="mm" />
            <MetricCard label="Risthöhe" value={String(m.instepHeightMm)} unit="mm" />
            <MetricCard label="Toleranzfenster" value={String(m.toleranceMm)} unit="mm" badge />
          </div>
        </div>

        <Card className="bg-verified-bg border-verified/30">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-verified shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-semibold text-carbon">Hybrid-Check bestätigt</p>
              <p className="text-[12px] text-carbon/70 mt-1 leading-relaxed">
                Optischer Scan deckt sich mit physikalischen Referenzwerten (Delta: +{m.deltaMm.toFixed(1)} mm)
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="sticky bottom-0 px-5 py-4 bg-gradient-to-t from-base-off via-base-off to-transparent">
        <PrimaryButton onClick={onNext}>
          <span className="flex items-center justify-center gap-2">
            {state.scanTarget === 'sole' ? 'Druckbarkeit prüfen' : 'Weiter zum Konfigurator'}
            <ArrowRight className="w-4 h-4" />
          </span>
        </PrimaryButton>
      </div>
    </div>
  );
}
