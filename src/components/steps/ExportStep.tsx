import { CheckCircle2, Download, Package, Truck, ShieldCheck, RotateCcw, FileText } from 'lucide-react';
import { Card, SectionLabel } from '@/components/ui/Card';
import { PrimaryButton, SecondaryButton, TextLink } from '@/components/ui/Button';
import type { AppState } from '@/types';

interface ExportStepProps {
  state: AppState;
  onReset: () => void;
}

export function ExportStep({ state, onReset }: ExportStepProps) {
  const isMaker = state.hardware === 'maker';

  const download3MF = () => {
    const content = `[Schuhwerker 3D — Fertigungspaket]
Modell: ${state.customizer.model}
Drucker: ${state.printer}
Material: TPU Shore 85A/95A
Profil: ${state.customizer.tread}
Farben: Sohle=${state.customizer.outsoleColor} Oberschuh=${state.customizer.midsoleColor} Schnuer=${state.customizer.laceColor}
Fußdaten: L=${state.metrics.lengthMm}mm B=${state.metrics.forefootWidthMm}mm H=${state.metrics.instepHeightMm}mm
Orientierung: Diagonal 45°
Support: Keiner
Datum: ${new Date().toISOString()}
`;
    const blob = new Blob([content], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schuhwerker3d_${state.customizer.model}.3mf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide bg-base-off">
      <div className="px-5 py-5 space-y-5">
        <div className="flex flex-col items-center text-center pt-2">
          <div className="w-12 h-12 rounded-full bg-verified-bg flex items-center justify-center mb-3">
            <CheckCircle2 className="w-6 h-6 text-verified" strokeWidth={2.5} />
          </div>
          <h2 className="text-[22px] font-semibold tracking-tight text-carbon leading-tight">
            Dein Schuh ist produktionsbereit
          </h2>
          <p className="text-[13px] text-technical mt-1">Fertigungsdaten generiert — bereit zum Download.</p>
        </div>

        {isMaker ? (
          <Card>
            <SectionLabel>Panel A — Maker</SectionLabel>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-base-off border border-hairline flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-carbon" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-carbon">Slicer-Projekt (.3mf / .gcode)</p>
                <p className="text-[12px] text-technical mt-0.5">Optimiert für {state.printer}</p>
              </div>
            </div>
            <div className="rounded-lg bg-base-off p-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border border-verified flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3 text-verified" />
                </div>
                <span className="text-[12px] text-carbon">TPU vorab 4–6h getrocknet?</span>
              </div>
            </div>
            <PrimaryButton onClick={download3MF}>
              <span className="flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                3MF-Paket herunterladen
              </span>
            </PrimaryButton>
          </Card>
        ) : (
          <Card>
            <SectionLabel>Panel B — Print-on-Demand</SectionLabel>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-base-off border border-hairline flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5 text-carbon" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-carbon">Print-on-Demand Fertigung</p>
                <p className="text-[12px] text-technical mt-0.5">Fertigung über zertifizierten Partner</p>
              </div>
            </div>
            <div className="space-y-2.5 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-technical">Preis</span>
                <span className="font-mono-tight text-[15px] font-semibold text-carbon">159,00 €</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-technical">inkl. MwSt.</span>
                <span className="font-mono-tight text-[12px] text-technical">—</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-technical">Lieferung</span>
                <span className="text-[12px] font-medium text-carbon">5–7 Werktage</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-technical">Passform</span>
                <span className="flex items-center gap-1 text-[12px] font-medium text-verified">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  100% Garantie
                </span>
              </div>
            </div>
            <PrimaryButton>
              <span className="flex items-center justify-center gap-2">
                <Package className="w-4 h-4" />
                Bestellung verbindlich anfragen
              </span>
            </PrimaryButton>
          </Card>
        )}

        {!isMaker && (
          <Card>
            <SectionLabel>Maker-Dateien</SectionLabel>
            <p className="text-[12px] text-technical mb-3">Trotz POD-Service erhältst du die Dateien:</p>
            <SecondaryButton onClick={download3MF}>
              <span className="flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                3MF-Paket herunterladen
              </span>
            </SecondaryButton>
          </Card>
        )}
      </div>

      <div className="sticky bottom-0 px-5 py-4 bg-gradient-to-t from-base-off via-base-off to-transparent flex flex-col items-center">
        <TextLink onClick={onReset}>
          <span className="flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" />
            Zurück zum Dashboard / Neu konfigurieren
          </span>
        </TextLink>
      </div>
    </div>
  );
}
