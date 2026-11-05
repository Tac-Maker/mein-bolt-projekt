import { useEffect, useRef, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface CameraScanProps {
  onComplete: () => void;
}

const SCAN_TOP = 33;
const SCAN_BOTTOM = 66;
const SCAN_RANGE = SCAN_BOTTOM - SCAN_TOP;
const PHASE_DURATION = 4; // seconds per phase

type Phase = 'pre' | 'wire' | 'foot';

export function CameraScan({ onComplete }: CameraScanProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [phase, setPhase] = useState<Phase>('pre');
  const [phaseTime, setPhaseTime] = useState(0);
  const [snapshot, setSnapshot] = useState(false);

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
          window.setTimeout(onComplete, 700);
          return;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef);
  }, [hasCamera, phase, snapshot, onComplete]);

  const phaseProgress = (phaseTime / PHASE_DURATION) * 100;
  const clipBottom = 100 - SCAN_BOTTOM;

  let lineAbs: number;
  let wireClipTop: number;
  let wireClipBottom: number;
  let footClipTop: number;
  let footClipBottom: number;

  if (phase === 'pre') {
    // Line: top -> bottom, nothing revealed yet
    lineAbs = SCAN_TOP + (phaseProgress / 100) * SCAN_RANGE;
    wireClipTop = 100; wireClipBottom = 0;
    footClipTop = 100; footClipBottom = 0;
  } else if (phase === 'wire') {
    // Line: bottom -> top, wire revealed below the line
    lineAbs = SCAN_BOTTOM - (phaseProgress / 100) * SCAN_RANGE;
    wireClipTop = lineAbs; wireClipBottom = clipBottom;
    footClipTop = 100; footClipBottom = 0;
  } else {
    // Line: top -> bottom, foot revealed above the line, wire stays fully visible
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
        src="/images/Fuss-wire.png"
        alt="Fuß als Wireframe"
        className="absolute inset-0 z-10 w-full h-full object-contain"
        style={{
          clipPath: `inset(${wireClipTop}% 0 ${wireClipBottom}% 0)`,
          opacity: phase === 'pre' ? 0 : 1,
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Normal foot layer */}
      <img
        src="/images/Fuss.png"
        alt="Gescanntes Fußmodell"
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

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
        {snapshot ? (
          <div className="w-16 h-16 rounded-full bg-verified flex items-center justify-center animate-fade-up">
            <CheckCircle2 className="w-8 h-8 text-white" strokeWidth={2.5} />
          </div>
        ) : (
          <ProgressRing progress={overallProgress} />
        )}
      </div>
      {snapshot && <div className="absolute inset-0 bg-white z-40 animate-snapshot-flash pointer-events-none" />}
      <div className="absolute bottom-8 right-4 z-30">
        <p className="font-mono-tight text-[10px] text-white/70">
          {snapshot ? 'ERFASST' : `${Math.round(overallProgress)}%`}
        </p>
      </div>
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
