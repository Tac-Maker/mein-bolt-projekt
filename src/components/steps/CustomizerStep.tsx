import { ArrowRight, Info } from 'lucide-react';
import { ThreeShoeViewer } from '@/components/ThreeShoeViewer';
import { STLViewer } from '@/components/STLViewer';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Card, SectionLabel } from '@/components/ui/Card';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { PrimaryButton } from '@/components/ui/Button';
import type { AppState, ShoeModel, TreadProfile, CustomizerState } from '@/types';
import { COLOR_SWATCHES, SOLE_SWATCHES, LACE_SWATCHES } from '@/types';

interface CustomizerStepProps {
  state: AppState;
  setCustomizer: (patch: Partial<CustomizerState>) => void;
  onNext: () => void;
}

type ColorField = 'outsoleColor' | 'midsoleColor' | 'laceColor';

const URBAN_ZONES: { label: string; field: ColorField; swatches: { name: string; hex: string }[] }[] = [
  { label: 'Sohle', field: 'outsoleColor', swatches: SOLE_SWATCHES },
  { label: 'Oberschuh', field: 'midsoleColor', swatches: COLOR_SWATCHES },
  { label: 'Schnürsenkel', field: 'laceColor', swatches: LACE_SWATCHES },
];

const PURESLIDE_ZONES: { label: string; field: ColorField; swatches: { name: string; hex: string }[] }[] = [
  { label: 'Sohle', field: 'outsoleColor', swatches: SOLE_SWATCHES },
  { label: 'Riemen', field: 'laceColor', swatches: LACE_SWATCHES },
];

export function CustomizerStep({ state, setCustomizer, onNext }: CustomizerStepProps) {
  const c = state.customizer;
  const isPureSlide = c.model === 'PureSlide';
  const zones = isPureSlide ? PURESLIDE_ZONES : URBAN_ZONES;

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide bg-base-off">
      <div className="px-5 py-5 space-y-5">
        <div>
          <SectionLabel>Modell</SectionLabel>
          <h2 className="text-[22px] font-semibold tracking-tight text-carbon leading-tight">
            3D Live-Konfigurator
          </h2>
        </div>

        <SegmentedControl
          value={c.model}
          onChange={(v: ShoeModel) => setCustomizer({ model: v })}
          options={[
            { value: 'UrbanFlow', label: 'UrbanFlow (Sneaker)' },
            { value: 'PureSlide', label: 'PureSlide (Flip-Flop)' },
          ]}
        />

        <Card padding="sm" className="bg-gradient-to-b from-base-white to-base-off">
          <div className="h-56 -m-1 rounded-xl overflow-hidden">
            <ErrorBoundary fallback={<ThreeShoeViewer state={c} className="w-full h-full" />}>
              <STLViewer
                key={c.model}
                url={isPureSlide ? '/models/flipflop.obj' : '/models/ADIDAS.obj'}
                soleColor={c.outsoleColor}
                upperColor={c.midsoleColor}
                laceColor={c.laceColor}
                twoZone={isPureSlide}
                autoRotate
                className="w-full h-full"
              />
            </ErrorBoundary>
          </div>
        </Card>

        <div>
          <SectionLabel>
            Farbzonierung ({isPureSlide ? '2' : '3'} Zonen)
          </SectionLabel>
          <div className="space-y-3">
            {zones.map((zone) => (
              <div key={zone.field}>
                <p className="text-[12px] font-medium text-carbon mb-2">{zone.label}</p>
                <div className="flex gap-2">
                  {zone.swatches.map((sw) => {
                    const active = c[zone.field] === sw.hex;
                    return (
                      <button
                        key={sw.hex}
                        onClick={() => setCustomizer({ [zone.field]: sw.hex } as Partial<CustomizerState>)}
                        className={`no-tap-highlight relative w-10 h-10 rounded-xl transition-all duration-200 ${
                          active ? 'ring-2 ring-signal ring-offset-2 ring-offset-base-off scale-105' : 'ring-1 ring-hairline'
                        }`}
                        style={{ backgroundColor: sw.hex }}
                        aria-label={sw.name}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {!isPureSlide && (
            <div className="flex items-start gap-2 mt-3">
              <Info className="w-3.5 h-3.5 text-technical shrink-0 mt-0.5" />
              <p className="text-[11px] text-technical leading-relaxed">
                Hinweis: Schnürsenkel werden nicht mitgedruckt. Die Farbauswahl dient nur der Vorschau.
              </p>
            </div>
          )}
        </div>

        <div>
          <SectionLabel>Profil-Struktur</SectionLabel>
          <div className="flex gap-2">
            {(['HexaGrip', 'WaveTrail'] as TreadProfile[]).map((t) => {
              const active = c.tread === t;
              const labels: Record<TreadProfile, string> = {
                HexaGrip: 'HexaGrip (Wabe)',
                WaveTrail: 'WaveTrail (Lamelle)',
              };
              return (
                <button
                  key={t}
                  onClick={() => setCustomizer({ tread: t })}
                  className={`no-tap-highlight flex-1 rounded-xl border py-3 text-[12px] font-semibold tracking-tight transition-all duration-200 ${
                    active ? 'border-signal bg-signal/5 text-carbon' : 'border-hairline bg-base-white text-technical'
                  }`}
                >
                  {labels[t]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 px-5 py-4 bg-gradient-to-t from-base-off via-base-off to-transparent">
        <PrimaryButton onClick={onNext}>
          <span className="flex items-center justify-center gap-2">
            Druckbarkeit prüfen
            <ArrowRight className="w-4 h-4" />
          </span>
        </PrimaryButton>
      </div>
    </div>
  );
}
