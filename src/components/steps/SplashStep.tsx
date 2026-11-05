import { useState } from 'react';
import { Smartphone, ScanLine, ArrowRight, Check } from 'lucide-react';
import type { ScanMethod } from '@/types';

interface SplashStepProps {
  onStart: (method: ScanMethod) => void;
}

export function SplashStep({ onStart }: SplashStepProps) {
  const [selected, setSelected] = useState<ScanMethod | null>(null);

  const methods: { id: ScanMethod; label: string; sublabel: string; icon: typeof Smartphone; desc: string }[] = [
    {
      id: 'iphone',
      label: 'iPhone',
      sublabel: 'LiDAR',
      icon: Smartphone,
      desc: 'Präzise Tiefenscan mit LiDAR-Sensor — Sekundenschnell.',
    },
    {
      id: 'android',
      label: 'Android',
      sublabel: 'Photogrammetry',
      icon: ScanLine,
      desc: 'Detaillierte Modellrekonstruktion aus Fotoaufnahmen.',
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-black relative overflow-hidden">
      {/* Full-bleed hero image */}
      <div className="absolute inset-0">
        <img
          src="/models/Schuh_Wire.png"
          alt="Schuhwerker 3D Wireframe"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/80" />
      </div>

      {/* Slogan — top area */}
      <div className="relative z-10 flex-1 flex flex-col justify-end px-6 pb-6">
        <div className="mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60 mb-2">
            Schuhwerker 3D
          </p>
          <h1 className="text-[30px] font-bold tracking-tight text-white leading-[1.1]">
            Zeig,
            <br />
            wer du bist.
          </h1>
        </div>

        {/* Method selection */}
        <div className="space-y-3">
          <p className="text-[12px] font-medium text-white/70 mb-2">Scan-Methode wählen</p>
          {methods.map((m) => {
            const active = selected === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setSelected(m.id)}
                className={`no-tap-highlight w-full text-left rounded-2xl border p-4 transition-all duration-200 ${
                  active
                    ? 'border-signal bg-signal/15 backdrop-blur-md'
                    : 'border-white/15 bg-white/5 backdrop-blur-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      active ? 'bg-signal text-white' : 'bg-white/10 text-white/80'
                    }`}
                  >
                    <m.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[15px] font-semibold text-white">{m.label}</span>
                      <span className="text-[11px] font-mono-tight text-white/50">{m.sublabel}</span>
                    </div>
                    <p className="text-[12px] text-white/60 leading-snug mt-0.5">{m.desc}</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                      active ? 'border-signal bg-signal' : 'border-white/25'
                    }`}
                  >
                    {active && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Start button */}
        <button
          onClick={() => selected && onStart(selected)}
          disabled={!selected}
          className={`no-tap-highlight w-full rounded-xl py-4 text-[15px] font-semibold tracking-tight transition-all duration-200 mt-6 flex items-center justify-center gap-2 ${
            selected
              ? 'bg-signal text-white active:scale-[0.985]'
              : 'bg-white/10 text-white/30 cursor-not-allowed'
          }`}
        >
          Weiter
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
