import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Card, SectionLabel } from '@/components/ui/Card';
import { PrimaryButton } from '@/components/ui/Button';

interface SlicerStepProps {
  onNext: () => void;
}

const SCAN_TOP = 33;
const SCAN_BOTTOM = 66;
const SCAN_RANGE = SCAN_BOTTOM - SCAN_TOP;
const PHASE_DURATION = 4;

type Phase = 'pre' | 'overlay';

export function SlicerStep({ onNext }: SlicerStepProps) {
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const [phase, setPhase] = useState<Phase>('pre');
  const [phaseTime, setPhaseTime] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    startTimeRef.current = performance.now();

    function tick() {
      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      const t = Math.min(PHASE_DURATION, elapsed);
      setPhaseTime(t);

      if (elapsed >= PHASE_DURATION) {
        if (phase === 'pre') {
          setPhase('overlay');
          startTimeRef.current = performance.now();
        } else if (phase === 'overlay' && !done) {
          setDone(true);
          return;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, done]);

  const phaseProgress = (phaseTime / PHASE_DURATION) * 100;

  let lineAbs: number;
  let overlayClipTop: number;
  let overlayClipBottom: number;

  if (phase === 'pre') {
    lineAbs = SCAN_TOP + (phaseProgress / 100) * SCAN_RANGE;
    overlayClipTop = 100; overlayClipBottom = 0;
  } else {
    lineAbs = SCAN_BOTTOM - (phaseProgress / 100) * SCAN_RANGE;
    overlayClipTop = lineAbs; overlayClipBottom = 100 - SCAN_BOTTOM;
  }

  const overallProgress =
    phase === 'pre'
      ? phaseProgress / 2
      : 50 + phaseProgress / 2;

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide bg-base-off">
      <div className="px-5 py-5 space-y-5">
        <div>
          <SectionLabel>Fertigungsdaten generieren</SectionLabel>
          <h2 className="text-[22px] font-semibold tracking-tight text-carbon leading-tight">
            Slicer
          </h2>
        </div>

        {/* Scan + Slicer overlay */}
        <div className="relative h-52 rounded-xl overflow-hidden bg-black">
          <img
            src="/images/Scan.png"
            alt="Scan-Grundbild"
            className="absolute inset-0 w-full h-full object-contain"
          />
          {/* Slicer overlay — revealed by scan line */}
          <img
            src="/images/Slicer.png"
            alt="Slicer-Overlay"
            className="absolute inset-0 w-full h-full object-contain"
            style={{
              clipPath: `inset(${overlayClipTop}% 0 ${overlayClipBottom}% 0)`,
              opacity: phase === 'pre' ? 0 : 1,
              transition: 'opacity 0.3s ease',
            }}
          />
          {/* Scan line */}
          {!done && (
            <div
              className="absolute left-0 right-0 z-20 pointer-events-none"
              style={{ top: `${lineAbs}%` }}
            >
              <div className="h-[2px] bg-signal" />
            </div>
          )}
        </div>

        {/* Scandaten */}
        <Card className="bg-base-white">
          <SectionLabel>Scandaten</SectionLabel>
          <div className="divide-y divide-hairline">
            <SlicerRow label="Objekt" value="Scan" />
            <SlicerRow label="Drucker" value="Prusa MK4" />
            <SlicerRow label="Filament" value="TPU" />
            <SlicerRow label="Schichthöhe / Speed" value="0,25 mm" />
          </div>
        </Card>

        {/* Slice-Info */}
        <Card className="bg-base-white">
          <SectionLabel>Slice-Info</SectionLabel>
          <div className="divide-y divide-hairline">
            <SlicerRow label="Filamentbedarf" value="47,00 g (18,10 m)" />
            <SlicerRow label="Erwartete Druckzeit" value="1 h 27 min" />
          </div>
        </Card>
      </div>

      <div className="sticky bottom-0 px-5 py-4 bg-gradient-to-t from-base-off via-base-off to-transparent">
        <PrimaryButton onClick={onNext}>
          <span className="flex items-center justify-center gap-2">
            Dein Schuh ist produktionsbereit
            <ArrowRight className="w-4 h-4" />
          </span>
        </PrimaryButton>
      </div>
    </div>
  );
}

function SlicerRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 first:pt-1 last:pb-1">
      <span className="text-[13px] text-technical">{label}</span>
      <span className="font-mono-tight text-[13px] font-medium text-carbon">{value}</span>
    </div>
  );
}
