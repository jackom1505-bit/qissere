import { useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import type { MotionValue } from "framer-motion";

/* ───────────────────────── constants ───────────────────────── */
const BEANS = 540;
const TRAY_BEANS = 340;
const DRUM_R = 2.1;
const DRUM_L = 4.2;
const SLATS = 30;
const FLOOR_Y = -4.2;
const TRAY_X = 5.6;

interface Shared {
  p: number; // damped scroll progress 0..1
  spin: number; // accumulated drum turns
  crack: number; // 0..1 first-crack window
}

type V3 = [number, number, number];

const STOPS: [number, THREE.Color][] = [
  [0.0, new THREE.Color("#7f9a52")], // green
  [0.2, new THREE.Color("#b7b064")], // yellowing
  [0.4, new THREE.Color("#cf914d")], // cinnamon
  [0.6, new THREE.Color("#98552a")], // first crack
  [0.8, new THREE.Color("#57301a")], // development
  [1.0, new THREE.Color("#2a170e")], // qissaré roast
];

function roastColor(t: number, out: THREE.Color) {
  for (let i = 0; i < STOPS.length - 1; i++) {
    const [ta, ca] = STOPS[i];
    const [tb, cb] = STOPS[i + 1];
    if (t <= tb) {
      const f = THREE.MathUtils.clamp((t - ta) / (tb - ta), 0, 1);
      return out.copy(ca).lerp(cb, f);
    }
  }
  return out.copy(STOPS[STOPS.length - 1][1]);
}

function smooth01(t: number, a: number, b: number) {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
}

function softTexture(): THREE.Texture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.55)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/* ───────────────────────── camera path ───────────────────────── */
const POS = [
  new THREE.Vector3(2, 1.6, 25),
  new THREE.Vector3(5.5, 1.2, 15),
  new THREE.Vector3(7.6, 0.8, 8.6),
  new THREE.Vector3(7.2, 0.4, 3.3),
  new THREE.Vector3(4.6, -0.7, -3.6),
  new THREE.Vector3(-1, 3.4, -7.6),
  new THREE.Vector3(-7, 1.4, -2.2),
  new THREE.Vector3(-7.4, 0.4, 4.6),
  new THREE.Vector3(-2, 4.4, 9.2),
  new THREE.Vector3(6.2, 1.4, 8),
  new THREE.Vector3(0.5, 3, 15.5),
];
const TAR = [
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0.5, 0, 0),
  new THREE.Vector3(0.6, 0, 0),
  new THREE.Vector3(0, -1, 0),
  new THREE.Vector3(0, 1.2, 0),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(-1, -1, 0),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(TRAY_X - 0.4, -1, 0),
  new THREE.Vector3(1.6, -0.3, 0),
];

/* ───────────────────────── helpers ───────────────────────── */
function Box({
  p,
  s,
  c,
  r,
  metal = 0.1,
  rough = 0.85,
  emissive,
  ei = 1,
}: {
  p: V3;
  s: V3;
  c: string;
  r?: V3;
  metal?: number;
  rough?: number;
  emissive?: string;
  ei?: number;
}) {
  return (
    <mesh position={p} rotation={r ?? [0, 0, 0]}>
      <boxGeometry args={s} />
      <meshStandardMaterial
        color={c}
        metalness={metal}
        roughness={rough}
        emissive={emissive ?? "#000000"}
        emissiveIntensity={emissive ? ei : 0}
      />
    </mesh>
  );
}

/* ───────────────────────── drum ───────────────────────── */
function Drum({ drumRef }: { drumRef: MutableRefObject<THREE.Group | null> }) {
  const slats = useMemo(
    () =>
      Array.from({ length: SLATS }, (_, i) => {
        const a = (i / SLATS) * Math.PI * 2;
        return { a, p: [0, Math.cos(a) * DRUM_R, Math.sin(a) * DRUM_R] as V3 };
      }),
    []
  );
  return (
    <group ref={drumRef}>
      {slats.map((s, i) => (
        <mesh key={i} position={s.p} rotation={[s.a, 0, 0]}>
          <boxGeometry args={[DRUM_L, 0.07, 0.3]} />
          <meshStandardMaterial color={i % 5 === 0 ? "#5a3a2a" : "#2c211b"} metalness={0.75} roughness={0.45} />
        </mesh>
      ))}
      {/* rings */}
      {[-DRUM_L / 2, 0, DRUM_L / 2].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[DRUM_R + 0.04, i === 1 ? 0.06 : 0.1, 10, 48]} />
          <meshStandardMaterial color="#b8733a" metalness={0.9} roughness={0.3} />
        </mesh>
      ))}
      {/* back plate */}
      <mesh position={[-DRUM_L / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[DRUM_R, DRUM_R, 0.08, 48]} />
        <meshStandardMaterial color="#221812" metalness={0.7} roughness={0.5} />
      </mesh>
      {/* internal vanes */}
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + 0.4;
        const r = DRUM_R - 0.3;
        return (
          <mesh key={i} position={[0, Math.cos(a) * r, Math.sin(a) * r]} rotation={[a, 0, 0]}>
            <boxGeometry args={[DRUM_L - 0.3, 0.42, 0.05]} />
            <meshStandardMaterial color="#3a2a20" metalness={0.6} roughness={0.6} />
          </mesh>
        );
      })}
    </group>
  );
}

/* ───────────────────────── beans in drum ───────────────────────── */
function Beans({ shared }: { shared: MutableRefObject<Shared> }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const data = useMemo(
    () =>
      Array.from({ length: BEANS }, () => ({
        offset: Math.random(),
        x: (Math.random() - 0.5) * (DRUM_L - 0.6),
        rr: 0.5 + Math.random() * 0.45,
        speed: 0.8 + Math.random() * 0.5,
        variance: 0.82 + Math.random() * 0.34,
        rot: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI] as V3,
        spin: (Math.random() - 0.5) * 5,
      })),
    []
  );
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const base = useMemo(() => new THREE.Color(), []);
  const col = useMemo(() => new THREE.Color(), []);

  useFrame(({ clock }) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = clock.getElapsedTime();
    const { p, spin, crack } = shared.current;
    roastColor(p, base);

    for (let i = 0; i < BEANS; i++) {
      const d = data[i];
      const phase = (((spin * 0.42 * d.speed + d.offset) % 1) + 1) % 1;
      const r = DRUM_R * d.rr - 0.12;
      let y: number;
      let z: number;
      if (phase < 0.62) {
        const th = THREE.MathUtils.lerp(-1.25, 1.05, phase / 0.62);
        y = -Math.cos(th) * r;
        z = Math.sin(th) * r;
      } else {
        const f = (phase - 0.62) / 0.38;
        const e = f * f;
        const y0 = -Math.cos(1.05) * r;
        const z0 = Math.sin(1.05) * r;
        const y1 = -Math.cos(-1.25) * r;
        const z1 = Math.sin(-1.25) * r;
        y = THREE.MathUtils.lerp(y0, y1, e) + Math.sin(f * Math.PI) * 0.4;
        z = THREE.MathUtils.lerp(z0, z1, e);
      }
      dummy.position.set(d.x, y, z);
      dummy.rotation.set(d.rot[0] + t * d.spin, d.rot[1] + t * d.spin * 0.7, d.rot[2]);
      const s = 1 + crack * Math.sin(t * 38 + i) * 0.2;
      dummy.scale.set(0.145 * s, 0.098 * s, 0.078 * s);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      col.copy(base).multiplyScalar(d.variance);
      mesh.setColorAt(i, col);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    if (matRef.current) {
      matRef.current.roughness = THREE.MathUtils.lerp(0.95, 0.28, smooth01(p, 0.55, 1));
      matRef.current.emissiveIntensity = smooth01(p, 0.5, 0.75) * 0.25;
    }
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, BEANS]} frustumCulled={false}>
      <sphereGeometry args={[1, 10, 7]} />
      <meshStandardMaterial ref={matRef} roughness={0.95} emissive="#ff7a30" emissiveIntensity={0} />
    </instancedMesh>
  );
}

/* ───────────────────────── cooling tray ───────────────────────── */
function Tray({ shared }: { shared: MutableRefObject<Shared> }) {
  const arm = useRef<THREE.Group>(null);
  const beans = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const col = useMemo(() => new THREE.Color(), []);
  const data = useMemo(
    () =>
      Array.from({ length: TRAY_BEANS }, () => {
        const a = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * 1.85;
        return {
          x: Math.cos(a) * r,
          z: Math.sin(a) * r,
          rot: [Math.random() * Math.PI, Math.random() * Math.PI, 0] as V3,
          v: 0.8 + Math.random() * 0.4,
          delay: Math.random(),
        };
      }),
    []
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const { p } = shared.current;
    if (arm.current) arm.current.rotation.y = t * 0.9;
    const mesh = beans.current;
    if (!mesh) return;
    const reveal = smooth01(p, 0.8, 0.93);
    for (let i = 0; i < TRAY_BEANS; i++) {
      const d = data[i];
      const s = smooth01(reveal, d.delay * 0.7, d.delay * 0.7 + 0.3);
      dummy.position.set(d.x, 0.24, d.z);
      dummy.rotation.set(d.rot[0], d.rot[1], d.rot[2]);
      dummy.scale.set(0.14 * s, 0.095 * s, 0.075 * s);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      col.set("#2c1911").multiplyScalar(d.v);
      mesh.setColorAt(i, col);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <group position={[TRAY_X, -1.35, 0]}>
      <mesh>
        <cylinderGeometry args={[2.15, 2.0, 0.28, 48]} />
        <meshStandardMaterial color="#1a120d" metalness={0.7} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.16, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.13, 0.07, 10, 60]} />
        <meshStandardMaterial color="#b8733a" metalness={0.9} roughness={0.3} />
      </mesh>
      {/* perforated look */}
      <mesh position={[0, 0.145, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.0, 48]} />
        <meshStandardMaterial color="#231913" metalness={0.5} roughness={0.7} />
      </mesh>
      <instancedMesh ref={beans} args={[undefined, undefined, TRAY_BEANS]} frustumCulled={false}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial roughness={0.35} />
      </instancedMesh>
      <group ref={arm}>
        <Box p={[0.98, 0.4, 0]} s={[1.96, 0.05, 0.12]} c="#b8733a" metal={0.9} rough={0.3} />
        <Box p={[0.98, 0.3, 0]} s={[1.9, 0.16, 0.04]} c="#3a2a20" metal={0.6} rough={0.6} />
      </group>
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.6, 10]} />
        <meshStandardMaterial color="#b8733a" metalness={0.9} roughness={0.3} />
      </mesh>
      {/* legs */}
      {[-1.5, 1.5].map((x) =>
        [-1.5, 1.5].map((z) => (
          <Box key={`${x}${z}`} p={[x, (FLOOR_Y + 1.35) / 2 - 0.14 + 0.0, z]} s={[0.12, Math.abs(FLOOR_Y + 1.35) - 0.14, 0.12]} c="#1a120d" metal={0.6} rough={0.6} />
        ))
      )}
    </group>
  );
}

/* ───────────────────────── smoke / embers / dust ───────────────────────── */
function Particles({
  shared,
  count,
  kind,
}: {
  shared: MutableRefObject<Shared>;
  count: number;
  kind: "smoke" | "ember" | "dust";
}) {
  const ref = useRef<THREE.Points>(null);
  const tex = useMemo(() => softTexture(), []);
  const data = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        life: Math.random(),
        speed: 0.08 + Math.random() * 0.12,
        seed: Math.random() * 100,
        x0: (Math.random() - 0.5) * (kind === "dust" ? 26 : 3.6),
        z0: (Math.random() - 0.5) * (kind === "dust" ? 26 : 3.6),
        fromChimney: Math.random() < 0.55,
      })),
    [count, kind]
  );
  const positions = useMemo(() => new Float32Array(count * 3), [count]);

  useFrame((_, delta) => {
    const pts = ref.current;
    if (!pts) return;
    const { p } = shared.current;
    const arr = pts.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const d = data[i];
      if (kind === "dust") {
        d.life += delta * d.speed * 0.25;
        const y = -3 + ((d.life * 6 + d.seed) % 12);
        arr[i * 3] = d.x0 + Math.sin(d.life * 2 + d.seed) * 0.5;
        arr[i * 3 + 1] = y;
        arr[i * 3 + 2] = d.z0 + Math.cos(d.life * 1.7 + d.seed) * 0.5;
        continue;
      }
      d.life += delta * d.speed * (kind === "ember" ? 1.9 : 1);
      if (d.life > 1) {
        d.life = 0;
        d.x0 = (Math.random() - 0.5) * 3.6;
        d.z0 = (Math.random() - 0.5) * 3.6;
        d.fromChimney = Math.random() < 0.55;
      }
      const l = d.life;
      if (kind === "smoke") {
        const baseY = d.fromChimney ? 7.2 : DRUM_R + 0.2;
        const baseX = d.fromChimney ? -1.2 + (d.x0 * 0.25) : d.x0;
        const baseZ = d.fromChimney ? d.z0 * 0.25 : d.z0;
        arr[i * 3] = baseX + Math.sin(l * 5 + d.seed) * (0.3 + l * 1.4);
        arr[i * 3 + 1] = baseY + l * 6.5;
        arr[i * 3 + 2] = baseZ + Math.cos(l * 4 + d.seed) * (0.3 + l * 1.2);
      } else {
        // ember: from burner/beneath drum & open end, spirals upward
        const ang = l * 6 + d.seed;
        arr[i * 3] = d.x0 * 0.7 + Math.cos(ang) * (0.5 + l * 1.6) + 1.2 * l;
        arr[i * 3 + 1] = -2.2 + l * 7;
        arr[i * 3 + 2] = d.z0 * 0.7 + Math.sin(ang) * (0.5 + l * 1.6);
      }
    }
    pts.geometry.attributes.position.needsUpdate = true;
    const mat = pts.material as THREE.PointsMaterial;
    if (kind === "smoke") mat.opacity = 0.34 * smooth01(p, 0.33, 0.78);
    else if (kind === "ember") mat.opacity = 0.95 * smooth01(p, 0.42, 0.72);
    else mat.opacity = 0.22;
  });

  const color = kind === "smoke" ? "#a08c78" : kind === "ember" ? "#ff9a3a" : "#e6c99a";
  const size = kind === "smoke" ? 1.1 : kind === "ember" ? 0.16 : 0.09;

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={tex}
        color={color}
        size={size}
        sizeAttenuation
        transparent
        opacity={0}
        depthWrite={false}
        blending={kind === "ember" ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </points>
  );
}

/* ───────────────────────── burner + lights ───────────────────────── */
function Burner({ shared }: { shared: MutableRefObject<Shared> }) {
  const light = useRef<THREE.PointLight>(null);
  const inner = useRef<THREE.PointLight>(null);
  const flames = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const { p } = shared.current;
    const heat = 0.15 + smooth01(p, 0.05, 0.7) * 0.85;
    const flicker = 0.85 + Math.sin(t * 17) * 0.08 + Math.sin(t * 29 + 1) * 0.07;
    if (light.current) light.current.intensity = (0.6 + heat * 30) * flicker;
    if (inner.current) inner.current.intensity = (0.2 + heat * 5) * flicker;
    if (flames.current) {
      flames.current.children.forEach((m, i) => {
        const s = heat * (0.75 + Math.sin(t * 21 + i * 1.7) * 0.25);
        m.scale.set(1, Math.max(0.05, s), 1);
      });
    }
  });
  return (
    <group>
      <pointLight ref={light} position={[0, -2.15, 0]} color="#ff6a1a" distance={13} decay={2} />
      <pointLight ref={inner} position={[0, 0, 0]} color="#ffa060" distance={5} decay={2} />
      {/* burner rail */}
      <Box p={[0, -2.5, 0]} s={[DRUM_L * 0.85, 0.14, 1.5]} c="#1c1410" metal={0.7} rough={0.5} />
      <group ref={flames}>
        {Array.from({ length: 11 }).map((_, i) => (
          <mesh key={i} position={[-1.6 + i * 0.32, -2.42 + 0.22, (i % 2) * 0.5 - 0.25]}>
            <coneGeometry args={[0.1, 0.5, 7]} />
            <meshBasicMaterial color={i % 3 === 0 ? "#ffd27a" : "#ff7a2a"} transparent opacity={0.9} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ───────────────────────── gauge ───────────────────────── */
function Gauge({ shared }: { shared: MutableRefObject<Shared> }) {
  const needle = useRef<THREE.Group>(null);
  useFrame(() => {
    if (needle.current) needle.current.rotation.z = THREE.MathUtils.lerp(2.2, -2.2, shared.current.p);
  });
  return (
    <group position={[DRUM_L / 2 + 0.55, 1.9, 1.35]} rotation={[0, 0.45, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.58, 0.58, 0.08, 40]} />
        <meshStandardMaterial color="#efe3c6" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, 0.05]}>
        <torusGeometry args={[0.58, 0.05, 10, 48]} />
        <meshStandardMaterial color="#b8733a" metalness={0.9} roughness={0.3} />
      </mesh>
      {Array.from({ length: 13 }).map((_, i) => {
        const a = THREE.MathUtils.lerp(2.2, -2.2, i / 12);
        return (
          <mesh key={i} position={[Math.sin(-a) * 0.46 * -1, Math.cos(a) * 0.46, 0.05]} rotation={[0, 0, a]}>
            <boxGeometry args={[0.02, i % 3 === 0 ? 0.1 : 0.05, 0.01]} />
            <meshBasicMaterial color={i > 8 ? "#c2441a" : "#2a1a10"} />
          </mesh>
        );
      })}
      <group ref={needle} position={[0, 0, 0.07]}>
        <mesh position={[0, 0.22, 0]}>
          <boxGeometry args={[0.03, 0.46, 0.015]} />
          <meshBasicMaterial color="#c2441a" />
        </mesh>
      </group>
      <mesh position={[0, 0, 0.08]}>
        <sphereGeometry args={[0.05, 10, 8]} />
        <meshStandardMaterial color="#b8733a" metalness={0.9} roughness={0.3} />
      </mesh>
      {/* stem */}
      <Box p={[0, -0.9, -0.2]} s={[0.08, 1.2, 0.08]} c="#b8733a" metal={0.9} rough={0.3} />
    </group>
  );
}

/* ───────────────────────── golden bean (secret) ───────────────────────── */
function GoldenBean({ onSecret }: { onSecret: () => void }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.position.y = 0.35 + Math.sin(t * 1.3) * 0.12;
      ref.current.rotation.y = t * 0.8;
      ref.current.rotation.z = Math.sin(t * 0.7) * 0.3;
    }
  });
  return (
    <group
      ref={ref}
      position={[TRAY_X, 0.35, 0]}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onSecret();
      }}
      onPointerOver={() => document.documentElement.style.setProperty("cursor", "pointer")}
      onPointerOut={() => document.documentElement.style.removeProperty("cursor")}
    >
      <mesh scale={[0.34, 0.23, 0.18]}>
        <sphereGeometry args={[1, 18, 14]} />
        <meshStandardMaterial color="#ffd27a" emissive="#ffb347" emissiveIntensity={1.6} metalness={0.6} roughness={0.25} />
      </mesh>
      {/* groove */}
      <mesh scale={[0.02, 0.2, 0.19]} position={[0, 0, 0.01]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#8a5a1a" />
      </mesh>
      {/* halo */}
      <mesh>
        <sphereGeometry args={[0.55, 16, 12]} />
        <meshBasicMaterial color="#ffb347" transparent opacity={0.06} />
      </mesh>
      <pointLight color="#ffc36a" intensity={2.4} distance={4} decay={2} />
    </group>
  );
}

/* ───────────────────────── static structure ───────────────────────── */
function Structure() {
  return (
    <group>
      {/* floor */}
      <mesh position={[0, FLOOR_Y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#0b0806" roughness={0.55} metalness={0.25} />
      </mesh>
      {/* faint floor ring under roaster */}
      <mesh position={[0, FLOOR_Y + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.2, 3.3, 64]} />
        <meshBasicMaterial color="#3a2414" transparent opacity={0.5} />
      </mesh>

      {/* legs + frame */}
      {[-1.6, 1.6].map((x) =>
        [-1.5, 1.5].map((z) => (
          <Box key={`${x}${z}`} p={[x, (FLOOR_Y - 1.8) / 2, z]} s={[0.22, Math.abs(FLOOR_Y + 1.8), 0.22]} c="#1a120d" metal={0.7} rough={0.5} />
        ))
      )}
      <Box p={[0, -2.75, 0]} s={[3.8, 0.18, 3.3]} c="#1a120d" metal={0.7} rough={0.5} />
      <Box p={[0, FLOOR_Y + 0.12, 0]} s={[4.2, 0.24, 3.6]} c="#15100c" metal={0.6} rough={0.6} />

      {/* front open ring (door frame) */}
      <mesh position={[DRUM_L / 2 + 0.12, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[DRUM_R + 0.15, 0.16, 12, 56]} />
        <meshStandardMaterial color="#c47a3c" metalness={0.9} roughness={0.28} />
      </mesh>
      {/* axle + motor at back */}
      <mesh position={[-DRUM_L / 2 - 0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.16, 0.16, 1.1, 14]} />
        <meshStandardMaterial color="#b8733a" metalness={0.9} roughness={0.3} />
      </mesh>
      <Box p={[-DRUM_L / 2 - 1.4, -0.3, 0]} s={[1.2, 1.2, 1.2]} c="#1e1510" metal={0.7} rough={0.5} />

      {/* chimney */}
      <mesh position={[-1.2, DRUM_R + 2.45, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 4.9, 20]} />
        <meshStandardMaterial color="#2a1e17" metalness={0.75} roughness={0.45} />
      </mesh>
      <mesh position={[-1.2, DRUM_R + 4.95, 0]}>
        <cylinderGeometry args={[0.5, 0.36, 0.3, 20]} />
        <meshStandardMaterial color="#b8733a" metalness={0.9} roughness={0.3} />
      </mesh>
      {[DRUM_R + 0.9, DRUM_R + 3.2].map((y) => (
        <mesh key={y} position={[-1.2, y, 0]}>
          <torusGeometry args={[0.36, 0.05, 8, 24]} />
          <meshStandardMaterial color="#b8733a" metalness={0.9} roughness={0.3} />
        </mesh>
      ))}

      {/* control panel */}
      <group position={[DRUM_L / 2 + 0.9, -1.0, 1.7]}>
        <Box p={[0, 0, 0]} s={[0.9, 1.7, 0.7]} c="#1e1510" metal={0.7} rough={0.5} />
        {[0.45, 0.2, -0.05].map((y, i) => (
          <mesh key={i} position={[-0.2 + i * 0.2, y, 0.37]}>
            <sphereGeometry args={[0.04, 8, 6]} />
            <meshStandardMaterial
              color={i === 0 ? "#7fbf6a" : i === 1 ? "#ffb347" : "#ff5a2a"}
              emissive={i === 0 ? "#7fbf6a" : i === 1 ? "#ffb347" : "#ff5a2a"}
              emissiveIntensity={2}
            />
          </mesh>
        ))}
        <mesh position={[0, -0.45, 0.37]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.14, 0.14, 0.06, 20]} />
          <meshStandardMaterial color="#b8733a" metalness={0.9} roughness={0.3} />
        </mesh>
      </group>

      {/* green bean sacks (left) */}
      {[
        [-5.4, 2.2, 0.9],
        [-6.3, 0.6, 0.8],
        [-4.6, -0.4, 0.7],
      ].map(([x, z, s], i) => (
        <group key={i} position={[x, FLOOR_Y + 0.75 * s, z]} scale={s}>
          <mesh scale={[1, 0.85, 0.9]}>
            <sphereGeometry args={[0.9, 14, 10]} />
            <meshStandardMaterial color="#6b5a3d" roughness={1} />
          </mesh>
          <mesh position={[0, 0.85, 0]} scale={[0.5, 0.35, 0.5]}>
            <sphereGeometry args={[0.6, 10, 8]} />
            <meshStandardMaterial color="#5c4c33" roughness={1} />
          </mesh>
        </group>
      ))}

      {/* sign */}
      <group position={[0.5, 6.4, -6.5]}>
        <mesh>
          <boxGeometry args={[7.6, 1.3, 0.12]} />
          <meshStandardMaterial color="#120c08" roughness={0.6} emissive="#1c1208" emissiveIntensity={0.5} />
        </mesh>
        <Box p={[0, 0.66, 0]} s={[7.7, 0.06, 0.16]} c="#b8733a" metal={0.9} rough={0.3} />
        <Box p={[0, -0.66, 0]} s={[7.7, 0.06, 0.16]} c="#b8733a" metal={0.9} rough={0.3} />
        <Text position={[0, 0.12, 0.08]} fontSize={0.5} color="#f0cf86" anchorX="center" anchorY="middle" letterSpacing={0.22}>
          QISSARÉ ROASTWORKS
        </Text>
        <Text position={[0, -0.36, 0.08]} fontSize={0.18} color="#dbc8a5" anchorX="center" anchorY="middle" letterSpacing={0.4}>
          EST. 2028 · SOMEWHERE IN INDIA
        </Text>
        <pointLight position={[0, -0.6, 1.4]} color="#f0cf86" intensity={3} distance={5} decay={2} />
      </group>

      {/* back wall (dark brick suggestion) */}
      <mesh position={[0, 3, -8]}>
        <planeGeometry args={[60, 16]} />
        <meshStandardMaterial color="#0e0906" roughness={1} />
      </mesh>
    </group>
  );
}

/* ───────────────────────── scene root ───────────────────────── */
export default function RoasterScene({
  progress,
  onSecret,
}: {
  progress: MotionValue<number>;
  onSecret: () => void;
}) {
  const shared = useRef<Shared>({ p: 0, spin: 0, crack: 0 });
  const drumRef = useRef<THREE.Group | null>(null);
  const keyLight = useRef<THREE.PointLight>(null);

  const posCurve = useMemo(() => new THREE.CatmullRomCurve3(POS, false, "catmullrom", 0.2), []);
  const tarCurve = useMemo(() => new THREE.CatmullRomCurve3(TAR, false, "catmullrom", 0.2), []);

  useFrame(({ camera, clock }, delta) => {
    const t = clock.getElapsedTime();
    const target = THREE.MathUtils.clamp(progress.get(), 0, 1);
    const s = shared.current;
    s.p = THREE.MathUtils.damp(s.p, target, 3.4, delta);
    const d = s.p;

    // drum speed
    const turnsPerSec = 0.22 + d * 0.5;
    s.spin += delta * turnsPerSec;
    if (drumRef.current) drumRef.current.rotation.x = -s.spin * Math.PI * 2;

    // first crack window
    s.crack = smooth01(d, 0.58, 0.61) * (1 - smooth01(d, 0.64, 0.69));

    // camera
    const pos = posCurve.getPointAt(d);
    const tar = tarCurve.getPointAt(d);
    const sway = 0.05 + (1 - Math.min(1, d * 4)) * 0.05;
    pos.x += Math.sin(t * 0.5) * sway + (Math.random() - 0.5) * s.crack * 0.09;
    pos.y += Math.sin(t * 0.7) * sway * 0.7 + (Math.random() - 0.5) * s.crack * 0.09;
    camera.position.copy(pos);
    camera.lookAt(tar);

    if (keyLight.current) keyLight.current.intensity = 4 + d * 14;
  });

  return (
    <group>
      <ambientLight color="#3a2a20" intensity={0.45} />
      <directionalLight color="#4a5a80" intensity={0.7} position={[-10, 8, -8]} />
      <pointLight ref={keyLight} position={[3.5, 4.5, 5]} color="#ffb070" distance={22} decay={2} />

      <Structure />
      <Drum drumRef={drumRef} />
      <Beans shared={shared} />
      <Burner shared={shared} />
      <Gauge shared={shared} />
      <Tray shared={shared} />
      <GoldenBean onSecret={onSecret} />

      <Particles shared={shared} count={300} kind="smoke" />
      <Particles shared={shared} count={170} kind="ember" />
      <Particles shared={shared} count={220} kind="dust" />
    </group>
  );
}
