import { Suspense, useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Center, Bounds, Html, useProgress } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import {
  Group,
  Mesh,
  MeshStandardMaterial,
  Material,
  Color,
  DoubleSide,
  Box3,
} from 'three';

interface ModelProps {
  url: string;
  color?: string;
  soleColor?: string;
  upperColor?: string;
  laceColor?: string;
  wireframe?: boolean;
  scale?: number;
  twoZone?: boolean;
}

function isOBJ(url: string) {
  return url.toLowerCase().endsWith('.obj');
}

function makeMaterial(hex: string, wireframe: boolean) {
  return new MeshStandardMaterial({
    color: new Color(hex),
    wireframe,
    side: DoubleSide,
    roughness: 0.6,
    metalness: 0.05,
  });
}

type Zone = 'sole' | 'upper' | 'lace';

function classifyByNames(matName: string, objName: string): Zone | null {
  const combined = `${matName} ${objName}`.toLowerCase();
  if (combined.includes('sohle')) return 'sole';
  if (combined.includes('riemen')) return 'lace';
  if (combined.includes('obermaterial') || combined.includes('ober')) return 'upper';
  return null;
}

function colorForZone(zone: Zone, twoZone: boolean, sole: string, upper: string, lace: string): string {
  if (zone === 'sole') return sole;
  if (zone === 'lace') return lace;
  return twoZone ? lace : upper;
}

async function fetchObjMaterialMap(url: string): Promise<Map<string, string[]>> {
  // Maps object name -> array of material names in order
  const map = new Map<string, string[]>();
  try {
    const resp = await fetch(url);
    const text = await resp.text();
    let currentObj = '';
    let currentMtl: string | null = null;
    for (const line of text.split('\n')) {
      const parts = line.trim().split(/\s+/);
      if (!parts[0]) continue;
      if (parts[0] === 'o') {
        currentObj = parts.slice(1).join(' ') || '';
        map.set(currentObj, []);
      } else if (parts[0] === 'usemtl') {
        const mtlName = parts.slice(1).join(' ') || '';
        if (!map.has(currentObj)) map.set(currentObj, []);
        map.get(currentObj)!.push(mtlName);
      }
    }
  } catch {
    // ignore
  }
  return map;
}

function applyColorsToObj(
  root: Group,
  objMaterialMap: Map<string, string[]>,
  soleColor: string,
  upperColor: string,
  laceColor: string,
  wireframe: boolean,
  twoZone: boolean,
) {
  const meshes: Mesh[] = [];
  root.traverse((child) => {
    if (child instanceof Mesh) meshes.push(child);
  });

  const allY: number[] = [];
  for (const mesh of meshes) {
    const box = new Box3().setFromObject(mesh);
    allY.push((box.min.y + box.max.y) / 2);
  }
  const overallMinY = Math.min(...allY);
  const overallMaxY = Math.max(...allY);
  const overallHeight = overallMaxY - overallMinY || 1;
  const soleTopY = overallMinY + overallHeight * 0.35;

  for (const mesh of meshes) {
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    const objName = mesh.name || '';
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const matNamesFromObj = objMaterialMap.get(objName) ?? [];

    const newMats = materials.map((_, idx) => {
      const matName = matNamesFromObj[idx] ?? '';
      let zone = classifyByNames(matName, objName);
      if (!zone) {
        const box = new Box3().setFromObject(mesh);
        const cy = (box.min.y + box.max.y) / 2;
        zone = cy < soleTopY ? 'sole' : 'upper';
      }
      const hex = colorForZone(zone, twoZone, soleColor, upperColor, laceColor);
      return makeMaterial(hex, wireframe);
    });

    mesh.material = newMats.length === 1 ? newMats[0] : newMats;
  }
}

function STLModel({ url, color = '#18181B', wireframe = false, scale = 1 }: ModelProps) {
  const geometry = useLoader(STLLoader, url);
  const meshRef = useRef<Mesh>(null);
  const material = useMemo(() => makeMaterial(color, wireframe), [color, wireframe]);

  return (
    <Bounds fit clip observe margin={1.2}>
      <Center>
        <mesh ref={meshRef} geometry={geometry} material={material} scale={scale} castShadow receiveShadow />
      </Center>
    </Bounds>
  );
}

function OBJModel({
  url,
  soleColor = '#18181B',
  upperColor = '#DC2626',
  laceColor = '#18181B',
  wireframe = false,
  scale = 1,
  twoZone = false,
}: ModelProps) {
  const [obj, setObj] = useState<Group | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // Load the OBJ material map (object -> material names) from the raw file
        const objMaterialMap = await fetchObjMaterialMap(url);

        // Load the OBJ without MTL — OBJLoader will create meshes with default materials,
        // but the geometry groups will still be set up correctly
        const loader = new OBJLoader();
        const loaded = await loader.loadAsync(url);
        applyColorsToObj(loaded, objMaterialMap, soleColor, upperColor, laceColor, wireframe, twoZone);
        if (!cancelled) setObj(loaded);
      } catch {
        if (!cancelled) setObj(null);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [url, soleColor, upperColor, laceColor, wireframe, twoZone]);

  if (!obj) return null;

  return (
    <Bounds fit clip observe margin={1.2}>
      <Center>
        <primitive object={obj} scale={scale} />
      </Center>
    </Bounds>
  );
}

function LoaderOverlay() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-2 border-hairline border-t-signal rounded-full" />
        <span className="font-mono-tight text-[11px] text-technical">{Math.round(progress)}%</span>
      </div>
    </Html>
  );
}

interface STLViewerProps {
  url: string;
  color?: string;
  soleColor?: string;
  upperColor?: string;
  laceColor?: string;
  wireframe?: boolean;
  autoRotate?: boolean;
  scale?: number;
  twoZone?: boolean;
  className?: string;
}

export function STLViewer({
  url,
  color = '#18181B',
  soleColor,
  upperColor,
  laceColor,
  wireframe = false,
  autoRotate = true,
  scale = 1,
  twoZone = false,
  className = '',
}: STLViewerProps) {
  return (
    <div className={`relative bg-gradient-to-b from-base-off to-base-white ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
        <directionalLight position={[-5, -3, -5]} intensity={0.3} />
        <Suspense fallback={<LoaderOverlay />}>
          {isOBJ(url) ? (
            <OBJModel
              url={url}
              soleColor={soleColor ?? color}
              upperColor={upperColor ?? color}
              laceColor={laceColor ?? color}
              wireframe={wireframe}
              scale={scale}
              twoZone={twoZone}
            />
          ) : (
            <STLModel url={url} color={color} wireframe={wireframe} scale={scale} />
          )}
        </Suspense>
        <OrbitControls
          autoRotate={autoRotate}
          autoRotateSpeed={0.8}
          enablePan={false}
          enableZoom={true}
          minDistance={2}
          maxDistance={10}
        />
      </Canvas>
      <div className="absolute bottom-2 left-3 pointer-events-none">
        <span className="font-mono-tight text-[10px] text-technical">ZIEHEN ZUM DREHEN</span>
      </div>
    </div>
  );
}
