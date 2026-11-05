import { useEffect, useRef, useCallback } from 'react';
import type { CustomizerState } from '@/types';

interface ThreeShoeViewerProps {
  state: CustomizerState;
  className?: string;
}

interface Vec3 { x: number; y: number; z: number; }

function project(v: Vec3, angleX: number, angleY: number, cx: number, cy: number, scale: number) {
  const cosY = Math.cos(angleY), sinY = Math.sin(angleY);
  const cosX = Math.cos(angleX), sinX = Math.sin(angleX);
  const x1 = v.x * cosY - v.z * sinY;
  const z1 = v.x * sinY + v.z * cosY;
  const y1 = v.y * cosX - z1 * sinX;
  const z2 = v.y * sinX + z1 * cosX;
  const persp = 500 / (500 + z2);
  return { x: cx + x1 * scale * persp, y: cy + y1 * scale * persp, z: z2 };
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function shade(hex: string, factor: number) {
  const { r, g, b } = hexToRgb(hex);
  const nr = Math.round(r * factor);
  const ng = Math.round(g * factor);
  const nb = Math.round(b * factor);
  return `rgb(${Math.min(255, nr)},${Math.min(255, ng)},${Math.min(255, nb)})`;
}

// Build flip-flop vertices
function buildFlipFlop(): { sole: Vec3[]; strap: Vec3[]; accent: Vec3[] } {
  const sole: Vec3[] = [];
  const strap: Vec3[] = [];
  const accent: Vec3[] = [];
  const segs = 32;
  // sole outline: rounded footbed
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const z = -55 + t * 120;
    const widthT = Math.sin(Math.PI * (0.15 + t * 0.7));
    const w = 28 * widthT + 8;
    sole.push({ x: w, y: -12, z });
    sole.push({ x: -w, y: -12, z });
  }
  // strap (V-shape over instep)
  strap.push({ x: 0, y: -12, z: 10 });
  strap.push({ x: 16, y: 4, z: -8 });
  strap.push({ x: -16, y: 4, z: -8 });
  strap.push({ x: 0, y: -12, z: 10 });
  strap.push({ x: 14, y: 4, z: -28 });
  strap.push({ x: -14, y: 4, z: -28 });
  // accent dot at heel
  accent.push({ x: 0, y: -12, z: -48 });
  return { sole, strap, accent };
}

// Build sneaker silhouette
function buildSneaker(): { sole: Vec3[]; midsole: Vec3[]; upper: Vec3[]; accent: Vec3[] } {
  const sole: Vec3[] = [];
  const midsole: Vec3[] = [];
  const upper: Vec3[] = [];
  const accent: Vec3[] = [];
  const segs = 40;
  // outsole (bottom)
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const z = -55 + t * 120;
    const w = (30 * Math.sin(Math.PI * (0.1 + t * 0.75)) + 10) * (1 - t * 0.15);
    sole.push({ x: w, y: -14, z });
    sole.push({ x: -w, y: -14, z });
  }
  // midsole/upper body
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const z = -55 + t * 120;
    const w = (30 * Math.sin(Math.PI * (0.1 + t * 0.75)) + 10) * (1 - t * 0.15);
    const heightFactor = t < 0.4 ? 14 + t * 20 : 22 - (t - 0.4) * 10;
    midsole.push({ x: w, y: -14 + heightFactor, z });
    midsole.push({ x: -w, y: -14 + heightFactor, z });
    upper.push({ x: w * 0.9, y: -14 + heightFactor + 8, z });
    upper.push({ x: -w * 0.9, y: -14 + heightFactor + 8, z });
  }
  // accent side stripe
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    const z = -10 + t * 50;
    accent.push({ x: 28 * Math.sin(Math.PI * (0.1 + (t + 0.2) * 0.75)) + 8, y: -6 + t * 4, z });
  }
  return { sole, midsole, upper, accent };
}

export function ThreeShoeViewer({ state, className = '' }: ThreeShoeViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ angleX: -0.25, angleY: -0.5, dragging: false, lastX: 0, lastY: 0 });
  const customRef = useRef(state);
  customRef.current = state;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const st = stateRef.current;
    const cs = customRef.current;
    if (!st.dragging) st.angleY += 0.003;

    const cx = w / 2;
    const cy = h / 2;
    const scale = Math.min(w, h) / 160;

    const fillPolygon = (pts: { x: number; y: number; z: number }[], color: string) => {
      ctx.beginPath();
      pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    };

    if (cs.model === 'PureSlide') {
      const { sole, strap, accent } = buildFlipFlop();
      const projSole = sole.map((p) => project(p, st.angleX, st.angleY, cx, cy, scale));
      const projStrap = strap.map((p) => project(p, st.angleX, st.angleY, cx, cy, scale));
      const projAccent = accent.map((p) => project(p, st.angleX, st.angleY, cx, cy, scale));

      // sole fill
      const leftSide = projSole.filter((_, i) => i % 2 === 0);
      const rightSide = projSole.filter((_, i) => i % 2 === 1).reverse();
      fillPolygon([...leftSide, ...rightSide], cs.outsoleColor);
      // sole outline
      ctx.strokeStyle = shade(cs.outsoleColor, 0.7);
      ctx.lineWidth = 1;
      ctx.beginPath();
      [...leftSide, ...rightSide].forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.closePath();
      ctx.stroke();

      // tread pattern on sole
      const treadColor = cs.tread === 'HexaGrip' ? shade(cs.outsoleColor, 0.6) : shade(cs.outsoleColor, 0.5);
      ctx.strokeStyle = treadColor;
      ctx.lineWidth = 0.6;
      for (let i = 2; i < sole.length - 2; i += 4) {
        const p = project(sole[i], st.angleX, st.angleY, cx, cy, scale);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.stroke();
      }

      // strap
      ctx.strokeStyle = cs.midsoleColor;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      projStrap.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.stroke();

      // accent dot at heel
      ctx.fillStyle = cs.laceColor;
      projAccent.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

    } else {
      const { sole, midsole, upper, accent } = buildSneaker();
      const projSole = sole.map((p) => project(p, st.angleX, st.angleY, cx, cy, scale));
      const projMid = midsole.map((p) => project(p, st.angleX, st.angleY, cx, cy, scale));
      const projUpper = upper.map((p) => project(p, st.angleX, st.angleY, cx, cy, scale));
      const projAccent = accent.map((p) => project(p, st.angleX, st.angleY, cx, cy, scale));

      const leftSole = projSole.filter((_, i) => i % 2 === 0);
      const rightSole = projSole.filter((_, i) => i % 2 === 1).reverse();
      fillPolygon([...leftSole, ...rightSole], cs.outsoleColor);

      const leftMid = projMid.filter((_, i) => i % 2 === 0);
      const rightMid = projMid.filter((_, i) => i % 2 === 1).reverse();
      fillPolygon([...leftMid, ...rightMid], cs.midsoleColor);

      const leftUpper = projUpper.filter((_, i) => i % 2 === 0);
      const rightUpper = projUpper.filter((_, i) => i % 2 === 1).reverse();
      fillPolygon([...leftUpper, ...rightUpper], shade(cs.midsoleColor, 0.85));

      // accent stripe
      ctx.strokeStyle = cs.laceColor;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      projAccent.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.stroke();

      // tread lines
      ctx.strokeStyle = shade(cs.outsoleColor, 0.6);
      ctx.lineWidth = 0.8;
      if (cs.tread === 'WaveTrail') {
        for (let i = 4; i < sole.length - 2; i += 6) {
          const p1 = project(sole[i], st.angleX, st.angleY, cx, cy, scale);
          const p2 = project(sole[i + 2], st.angleX, st.angleY, cx, cy, scale);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      } else {
        for (let i = 2; i < sole.length - 2; i += 4) {
          const p = project(sole[i], st.angleX, st.angleY, cx, cy, scale);
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

    }

    requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    let raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const st = stateRef.current;
    const onDown = (e: PointerEvent) => { st.dragging = true; st.lastX = e.clientX; st.lastY = e.clientY; canvas.setPointerCapture(e.pointerId); };
    const onMove = (e: PointerEvent) => {
      if (!st.dragging) return;
      st.angleY += (e.clientX - st.lastX) * 0.008;
      st.angleX += (e.clientY - st.lastY) * 0.008;
      st.angleX = Math.max(-1.2, Math.min(1.2, st.angleX));
      st.lastX = e.clientX; st.lastY = e.clientY;
    };
    const onUp = (e: PointerEvent) => { st.dragging = false; canvas.releasePointerCapture(e.pointerId); };
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    return () => {
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full touch-none cursor-grab active:cursor-grabbing" />
      <div className="absolute bottom-2 left-3">
        <span className="font-mono-tight text-[10px] text-technical">ZIEHEN ZUM DREHEN</span>
      </div>
    </div>
  );
}
