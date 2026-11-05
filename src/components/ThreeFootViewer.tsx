import { useEffect, useRef, useCallback } from 'react';

interface ThreeFootViewerProps {
  className?: string;
}

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

function project(v: Vec3, angleX: number, angleY: number, cx: number, cy: number, scale: number): { x: number; y: number; z: number } {
  const cosY = Math.cos(angleY);
  const sinY = Math.sin(angleY);
  const cosX = Math.cos(angleX);
  const sinX = Math.sin(angleX);
  const x1 = v.x * cosY - v.z * sinY;
  const z1 = v.x * sinY + v.z * cosY;
  const y1 = v.y * cosX - z1 * sinX;
  const z2 = v.y * sinX + z1 * cosX;
  const persp = 600 / (600 + z2);
  return { x: cx + x1 * scale * persp, y: cy + y1 * scale * persp, z: z2 };
}

function generateFootCloud(): Vec3[] {
  const pts: Vec3[] = [];
  const segs = 48;
  const rings = 18;
  for (let r = 0; r <= rings; r++) {
    const t = r / rings;
    // foot profile: toe box wide, narrows toward heel, height rises at instep
    const lengthPos = t * 120 - 60;
    const widthBase = 38 * Math.sin(Math.PI * (0.25 + t * 0.7)) + 14;
    const heightBase = 26 * Math.sin(Math.PI * (t * 0.8)) * (1 - t * 0.3);
    for (let s = 0; s <= segs; s++) {
      const a = (s / segs) * Math.PI * 2;
      const w = widthBase * Math.cos(a);
      const h = heightBase * Math.sin(a) * (a < Math.PI ? 0.7 : 1.1);
      pts.push({ x: w, y: h - 8, z: lengthPos });
    }
  }
  return pts;
}

export function ThreeFootViewer({ className = '' }: ThreeFootViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ angleX: -0.35, angleY: 0.6, dragging: false, lastX: 0, lastY: 0, autoRotate: true });
  const rafRef = useRef<number>(0);

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
    if (st.autoRotate && !st.dragging) {
      st.angleY += 0.004;
    }
    const cx = w / 2;
    const cy = h / 2;
    const scale = Math.min(w, h) / 150;
    const pts = generateFootCloud();
    const projected = pts.map((p) => project(p, st.angleX, st.angleY, cx, cy, scale));

    // draw mesh grid lines (ring connections)
    const segs = 49;
    const rings = 19;
    ctx.lineWidth = 0.5;
    for (let r = 0; r < rings; r++) {
      for (let s = 0; s < segs; s++) {
        const i0 = r * segs + s;
        const i1 = r * segs + (s + 1) % segs;
        const p0 = projected[i0];
        const p1 = projected[i1];
        const avgZ = (p0.z + p1.z) / 2;
        const alpha = Math.max(0.08, 1 - avgZ / 120);
        ctx.strokeStyle = `rgba(24,24,27,${alpha * 0.35})`;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
      }
    }
    // longitudinal lines
    for (let s = 0; s < segs; s += 3) {
      for (let r = 0; r < rings - 1; r++) {
        const i0 = r * segs + s;
        const i1 = (r + 1) * segs + s;
        const p0 = projected[i0];
        const p1 = projected[i1];
        const avgZ = (p0.z + p1.z) / 2;
        const alpha = Math.max(0.08, 1 - avgZ / 120);
        ctx.strokeStyle = `rgba(24,24,27,${alpha * 0.25})`;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
      }
    }
    // vertices
    for (let i = 0; i < projected.length; i += 2) {
      const p = projected[i];
      const alpha = Math.max(0.1, 1 - p.z / 120);
      ctx.fillStyle = `rgba(234,88,12,${alpha * 0.7})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.1, 0, Math.PI * 2);
      ctx.fill();
    }
    rafRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const st = stateRef.current;

    const onDown = (e: PointerEvent) => {
      st.dragging = true;
      st.autoRotate = false;
      st.lastX = e.clientX;
      st.lastY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!st.dragging) return;
      const dx = e.clientX - st.lastX;
      const dy = e.clientY - st.lastY;
      st.angleY += dx * 0.008;
      st.angleX += dy * 0.008;
      st.angleX = Math.max(-1.3, Math.min(1.3, st.angleX));
      st.lastX = e.clientX;
      st.lastY = e.clientY;
    };
    const onUp = (e: PointerEvent) => {
      st.dragging = false;
      st.autoRotate = true;
      canvas.releasePointerCapture(e.pointerId);
    };
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
      <div className="absolute bottom-2 left-3 flex items-center gap-1.5">
        <span className="font-mono-tight text-[10px] text-technical">DRAG TO ORBIT</span>
      </div>
    </div>
  );
}
