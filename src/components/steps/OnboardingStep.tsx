import { useState } from 'react';
import { Check, CreditCard, Layers, Clock, ChevronDown, Zap, ScanLine, Footprints } from 'lucide-react';
import { Card, SectionLabel } from '@/components/ui/Card';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { PrimaryButton } from '@/components/ui/Button';
import type { AppState, HardwareProfile, PrinterType, ScanMode } from '@/types';
import { PRINTER_OPTIONS } from '@/types';

interface OnboardingStepProps {
  state: AppState;
  setHardware: (h: HardwareProfile) => void;
  setPrinter: (p: PrinterType) => void;
  setScanMode: (m: ScanMode) => void;
  onNext: () => void;
  onSoleScan: () => void;
}

export function OnboardingStep({ state, setHardware, setPrinter, setScanMode, onNext, onSoleScan }: OnboardingStepProps) {
  const [printerOpen, setPrinterOpen] = useState(false);

  const checklistItems = [
    { icon: CreditCard, label: 'Standard-Kredit-/Referenzkarte bereithalten' },
    { icon: Layers, label: 'Flache, kontrastierte harte Oberfläche' },
    { icon: Clock, label: 'Geschätzte Dauer: 10–12 Minuten' },
  ];

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide bg-base-off">
      <div className="px-5 py-5 space-y-5">
        <div>
          <SectionLabel>Vorbereitung</SectionLabel>
          <h2 className="text-[22px] font-semibold tracking-tight text-carbon leading-tight">
            Setup &amp; Hardware-Pfad
          </h2>
          <p className="text-[13px] text-technical mt-1 leading-relaxed">
            Bereite deine Umgebung vor und wähle deinen Fertigungsweg.
          </p>
        </div>

        <Card>
          <SectionLabel>Checkliste</SectionLabel>
          <div className="space-y-2.5">
            {checklistItems.map((item, i) => (
              <div
                key={i}
                className="w-full flex items-center gap-3"
              >
                <div className="w-5 h-5 rounded-md border border-hairline flex items-center justify-center shrink-0" />
                <item.icon className="w-4 h-4 text-technical shrink-0" />
                <span className="text-[13px] leading-snug text-technical">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <div>
          <SectionLabel>Scan-Modus</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setScanMode('pure')}
              className={`no-tap-highlight rounded-xl border p-3 text-left transition-all duration-200 ${
                state.scanMode === 'pure'
                  ? 'border-signal bg-signal/[0.04] ring-1 ring-signal'
                  : 'border-hairline bg-base-white'
              }`}
            >
              <ScanLine className={`w-5 h-5 mb-2 ${state.scanMode === 'pure' ? 'text-signal' : 'text-technical'}`} />
              <p className="text-[13px] font-semibold text-carbon">Reiner Scan</p>
              <p className="text-[11px] text-technical mt-1 leading-relaxed">
                Nur optische Erfassung ohne Abdruck-Platte.
              </p>
            </button>
            <button
              onClick={() => setScanMode('hybrid')}
              className={`no-tap-highlight rounded-xl border p-3 text-left transition-all duration-200 ${
                state.scanMode === 'hybrid'
                  ? 'border-signal bg-signal/[0.04] ring-1 ring-signal'
                  : 'border-hairline bg-base-white'
              }`}
            >
              <Footprints className={`w-5 h-5 mb-2 ${state.scanMode === 'hybrid' ? 'text-signal' : 'text-technical'}`} />
              <p className="text-[13px] font-semibold text-carbon">Hybrid Scan</p>
              <p className="text-[11px] text-technical mt-1 leading-relaxed">
                Scan mit Abdruck-Platte für höhere Präzision.
              </p>
            </button>
          </div>
        </div>

        <div>
          <SectionLabel>Hardware-Profil</SectionLabel>
          <SegmentedControl
            value={state.hardware}
            onChange={(v) => setHardware(v)}
            options={[
              { value: 'maker', label: 'Maker' },
              { value: 'access', label: 'Access' },
            ]}
          />
          <p className="text-[11px] text-technical mt-2 leading-relaxed">
            {state.hardware === 'maker'
              ? '3D-Drucker vorhanden — lokale Fertigung.'
              : 'Print-on-Demand Partner — Fertigung über Service.'}
          </p>
        </div>

        {state.hardware === 'maker' && (
          <div className="animate-fade-up">
            <SectionLabel>Druckertyp</SectionLabel>
            <button
              onClick={() => setPrinterOpen((v) => !v)}
              className="no-tap-highlight w-full flex items-center justify-between rounded-xl border border-hairline bg-base-white px-4 py-3"
            >
              <span className="text-[14px] font-medium text-carbon">{state.printer}</span>
              <ChevronDown className={`w-4 h-4 text-technical transition-transform duration-200 ${printerOpen ? 'rotate-180' : ''}`} />
            </button>
            {printerOpen && (
              <div className="mt-1 rounded-xl border border-hairline bg-base-white overflow-hidden animate-fade-up">
                {PRINTER_OPTIONS.map((p) => (
                  <button
                    key={p}
                    onClick={() => { setPrinter(p); setPrinterOpen(false); }}
                    className={`no-tap-highlight w-full text-left px-4 py-2.5 text-[13px] border-b border-hairline last:border-0 transition-colors ${
                      p === state.printer ? 'text-signal font-semibold' : 'text-carbon hover:bg-base-off'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          onClick={onSoleScan}
          className="no-tap-highlight w-full text-left"
        >
          <Card className="border-dashed transition-all duration-200 hover:border-signal hover:bg-signal/[0.03] active:scale-[0.99]">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-signal/10 flex items-center justify-center shrink-0">
                <Zap className="w-4.5 h-4.5 text-signal" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-carbon">SoleMatch: Klone deine Sohle</p>
                <p className="text-[11px] text-technical mt-1 leading-relaxed">
                  Keine Lust auf Barfuß? Scanne die Einlegesohle direkt und erhalte dein 3D-Modell.
                </p>
                <div className="flex items-center gap-1.5 mt-3 text-[12px] font-semibold text-carbon">
                  <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                  Schnellmodus starten
                </div>
              </div>
            </div>
          </Card>
        </button>
      </div>

      <div className="sticky bottom-0 px-5 py-4 bg-gradient-to-t from-base-off via-base-off to-transparent">
        <PrimaryButton onClick={onNext}>Messung starten</PrimaryButton>
      </div>
    </div>
  );
}
