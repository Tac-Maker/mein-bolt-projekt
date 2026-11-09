import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export type ScanType = 'fuss' | 'sohle';

interface CameraScanProps {
  onComplete: () => void;
  scanType?: ScanType;
}

const SCAN_TOP = 33;
const SCAN_BOTTOM = 66;
const SCAN_RANGE = SCAN_BOTTOM - SCAN_TOP;
const PHASE_DURATION = 4; // seconds per phase

type Phase = 'pre' | 'wire' | 'foot';

const IMAGES: Record<ScanType, { wire: string; foot: string; raster: string }> = {
  fuss: {
    wire: '/images/Fuss-wire.png',
    foot: '/images/Fuss.png',
    raster: '/images/Fuss-raster.png',
  },
  sohle: {
    wire: '/images/sohle-wire.png',
    foot: '/images/sohle.png',
    raster: '/images/sohle.png',
  },
};

export function CameraScan({ onComplete, scanType = 'fuss' }: CameraScanProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [phase, setPhase] = useState<Phase>('pre');
  const [phaseTime, setPhaseTime] = useState(0);
  const [snapshot, setSnapshot] = useState(false);

  const imgs = IMAGES[scanType];
  const isSole = scanType === 'sohle';

  useEffect(() => {
    let cancelled = false;

    async function initCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setHasCamera(true);
        startTimeRef.current = performance.now();
      } catch {
        setHasCamera(false);
        startTimeRef.current = performance.now();
      }
    }

    initCamera();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    if (hasCamera === null) return;

    function tick() {
      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      const t = Math.min(PHASE_DURATION, elapsed);
      setPhaseTime(t);

      if (elapsed >= PHASE_DURATION) {
        if (phase === 'pre') {
          setPhase('wire');
          startTimeRef.current = performance.now();
        } else if (phase === 'wire') {
          setPhase('foot');
          startTimeRef.current = performance.now();
        } else if (phase === 'foot' && !snapshot) {
          setSnapshot(true);
          return;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [hasCamera, phase, snapshot]);

  const phaseProgress = (phaseTime / PHASE_DURATION) * 100;
  const clipBottom = 100 - SCAN_BOTTOM;

  let lineAbs: number;
  let wireClipTop: number;
  let wireClipBottom: number;
  let footClipTop: number;
  let footClipBottom: number;

  if (phase === 'pre') {
    lineAbs = SCAN_TOP + (phaseProgress / 100) * SCAN_RANGE;
    wireClipTop = 100; wireClipBottom = 0;
    footClipTop = 100; footClipBottom = 0;
  } else if (phase === 'wire') {
    lineAbs = SCAN_BOTTOM - (phaseProgress / 100) * SCAN_RANGE;
    wireClipTop = lineAbs; wireClipBottom = clipBottom;
    footClipTop = 100; footClipBottom = 0;
  } else {
    lineAbs = SCAN_TOP + (phaseProgress / 100) * SCAN_RANGE;
    wireClipTop = SCAN_TOP; wireClipBottom = clipBottom;
    footClipTop = SCAN_TOP; footClipBottom = 100 - lineAbs;
  }
  const overallProgress =
    phase === 'pre'
      ? phaseProgress / 3
      : phase === 'wire'
        ? 33 + phaseProgress / 3
        : 66 + phaseProgress / 3;

  return (
    <div className="flex-1 flex flex-col bg-black relative overflow-hidden">
      {hasCamera === true && (
        <video
          ref={videoRef}
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
      )}

      {/* Wireframe layer */}
      <img
        src={imgs.wire}
        alt={isSole ? 'Sohle als Wireframe' : 'Fuß als Wireframe'}
        className="absolute inset-0 z-10 w-full h-full object-contain"
        style={{
          clipPath: `inset(${wireClipTop}% 0 ${wireClipBottom}% 0)`,
          opacity: phase === 'pre' ? 0 : 1,
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Normal foot layer */}
      <img
        src={imgs.foot}
        alt={isSole ? 'Gescanntes Sohlenmodell' : 'Gescanntes Fußmodell'}
        className="absolute inset-0 z-10 w-full h-full object-contain"
        style={{
          clipPath: `inset(${footClipTop}% 0 ${footClipBottom}% 0)`,
          opacity: phase === 'foot' ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Scan line */}
      <div
        className="absolute left-0 right-0 z-20 pointer-events-none"
        style={{ top: `${lineAbs}%` }}
      >
        <div className="h-[2px] bg-signal" />
      </div>

      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-30">
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-lg px-2.5 py-1.5">
          <span className="font-mono-tight text-[10px] text-white/90">ABSTAND: 32,4 CM</span>
        </div>
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-lg px-2.5 py-1.5">
          <span className="font-mono-tight text-[10px] text-white/90">EBENE: WAAGERECHT</span>
        </div>
      </div>
      <div className="absolute top-14 left-4 z-30">
        <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-lg px-2.5 py-1.5">
          <span className="font-mono-tight text-[10px] text-verified">LICHT: OPTIMAL</span>
        </div>
      </div>

      {snapshot && <div className="absolute inset-0 bg-white z-40 animate-snapshot-flash pointer-events-none" />}

      {snapshot && (
        <div className="absolute inset-0 z-50 flex flex-col bg-black animate-fade-up overflow-hidden">
          {/* Image with raster overlay — upper third */}
          <div className="relative h-1/3 w-full overflow-hidden">
            <img
              src={imgs.raster}
              alt={isSole ? 'Gescanntes Sohlenmodell mit Messpunkten' : 'Gescanntes Fußmodell mit Messpunkten'}
              className="absolute inset-0 w-full h-full object-contain opacity-90"
            />
          </div>

          {/* Success content — lower two thirds */}
          <div className="flex-1 flex flex-col items-center justify-between px-6 pt-6 pb-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-verified flex items-center justify-center mb-5 animate-fade-up">
                <CheckCircle2 className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-verified mb-3">
                Scan abgeschlossen
              </p>
              <h2 className="text-[24px] font-bold tracking-tight text-white text-center leading-tight mb-3">
                Perfekt erfasst
              </h2>
              <p className="text-[13px] text-white/70 text-center leading-relaxed max-w-[280px]">
                {isSole
                  ? 'Deine Sohle wurde vollständig und präzise gescannt. Alle Metriken wurden aus dem 3D-Modell extrahiert und sind bereit zur Auswertung.'
                  : 'Dein Fuß wurde vollständig und präzise gescannt. Alle Metriken wurden aus dem 3D-Modell extrahiert und sind bereit zur Auswertung.'}
              </p>
              <div className="mt-5 flex items-center gap-4">
                <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-2">
                  <span className="font-mono-tight text-[11px] text-white/90">MESSPUNKTE: 1.247</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-2">
                  <span className="font-mono-tight text-[11px] text-verified">GENAUIGKEIT: 99,2%</span>
                </div>
              </div>
            </div>
            <button
              onClick={onComplete}
              className="no-tap-highlight w-full rounded-xl bg-signal text-white py-4 text-[15px] font-semibold tracking-tight transition-all duration-200 active:scale-[0.985] flex items-center justify-center gap-2"
            >
              {isSole ? 'Zu den Sohlenmetriken' : 'Zu den Fußmetriken'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {!snapshot && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
          <ProgressRing progress={overallProgress} />
        </div>
      )}
      {!snapshot && (
        <div className="absolute bottom-8 right-4 z-30">
          <p className="font-mono-tight text-[10px] text-white/70">
            {`${Math.round(overallProgress)}%`}
          </p>
        </div>
      )}
    </div>
  );
}

function ProgressRing({ progress }: { progress: number }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-16 h-16">
      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={radius} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="#EA580C"
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-mono-tight text-[11px] font-semibold text-white">{Math.round(progress)}</span>
      </div>
    </div>
  );
}
