import { useRef, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import RoasterScene from "./scene/RoasterScene";
import { LOCATION } from "../data/seed";

/* ── A text beat that fades in/out across a progress window ── */
function Beat({
  progress,
  from,
  to,
  children,
  align = "center",
}: {
  progress: MotionValue<number>;
  from: number;
  to: number;
  children: ReactNode;
  align?: "left" | "center" | "right";
}) {
  const fade = Math.min(0.035, (to - from) / 4);
  const opacity = useTransform(progress, [from, from + fade, to - fade, to], [0, 1, 1, 0]);
  const y = useTransform(progress, [from, from + fade, to], [36, 0, -24]);

  const alignClass =
    align === "left"
      ? "items-start text-left pl-6 sm:pl-16 lg:pl-24"
      : align === "right"
      ? "items-end text-right pr-6 sm:pr-16 lg:pr-24"
      : "items-center text-center px-6";

  return (
    <motion.div
      style={{ opacity, y }}
      className={`absolute inset-0 flex flex-col justify-center pointer-events-none ${alignClass}`}
    >
      <div className="max-w-2xl">{children}</div>
    </motion.div>
  );
}

function Line({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`font-serif text-[clamp(1.6rem,4.5vw,3.4rem)] leading-[1.15] text-cream-50 glow-text ${className}`}>
      {children}
    </p>
  );
}

function Kick({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono text-[10px] sm:text-xs tracking-[0.4em] uppercase text-brass-400 block mb-4">
      {children}
    </span>
  );
}

export default function CinematicSection({ onSecret }: { onSecret: () => void }) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const railScale = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const vignette = useTransform(scrollYProgress, [0, 1], [0.9, 0.7]);
  const hudOpacity = useTransform(scrollYProgress, [0.04, 0.1, 0.9, 0.97], [0, 1, 1, 0]);

  const temp = useTransform(scrollYProgress, (v) => `${Math.round(24 + v * 197)}`);
  const rpm = useTransform(scrollYProgress, (v) => `${Math.round(14 + v * 28)}`);
  const stage = useTransform(scrollYProgress, (v): string =>
    v < 0.2 ? "GREEN" : v < 0.4 ? "YELLOWING" : v < 0.58 ? "CINNAMON" : v < 0.69 ? "FIRST CRACK" : v < 0.86 ? "DEVELOPMENT" : "QISSARÉ ROAST"
  );
  const heatBar = useTransform(scrollYProgress, [0, 1], ["4%", "100%"]);

  return (
    <section ref={sectionRef} className="relative" style={{ height: "1400vh" }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden cine-bars bg-ink-950">
        {/* 3D canvas */}
        <div className="absolute inset-0">
          <Canvas
            camera={{ fov: 42, near: 0.1, far: 200, position: [2, 1.6, 25] }}
            gl={{ antialias: true, powerPreference: "high-performance" }}
            dpr={[1, 1.75]}
            onCreated={({ gl }) => gl.setClearColor("#070403")}
          >
            <fog attach="fog" args={["#070403", 18, 48]} />
            <RoasterScene progress={scrollYProgress} onSecret={onSecret} />
          </Canvas>
        </div>

        {/* vignette + warm bottom glow */}
        <motion.div style={{ opacity: vignette }} className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_48%,rgba(7,4,3,0.92)_100%)]" />
        </motion.div>
        <div className="absolute inset-0 grain pointer-events-none" aria-hidden="true" />

        {/* ── Beats ── */}
        <Beat progress={scrollYProgress} from={0} to={0.085} align="center">
          <Kick>EST. 2028 · {LOCATION}</Kick>
          <h1 className="font-display text-[clamp(3rem,11vw,8rem)] tracking-[0.08em] text-cream-50 leading-none glow-text">
            QISSARÉ
          </h1>
          <p className="font-serif italic text-[clamp(1.1rem,2.6vw,1.8rem)] text-cream-200/85 mt-5">
            The Story That Never Stays Still.
          </p>
          <div className="mt-12 flex items-center justify-center gap-3 text-cream-200/50">
            <span className="font-mono text-[10px] tracking-[0.35em] uppercase">Scroll to begin the roast</span>
            <span className="animate-scroll-hint inline-block font-mono">↓</span>
          </div>
        </Beat>

        <Beat progress={scrollYProgress} from={0.1} to={0.185} align="left">
          <Kick>Green · 24°C</Kick>
          <Line>Every story starts green.</Line>
          <Line className="italic gradient-text-copper mt-2">Raw. Unsure. Full of sugar.</Line>
        </Beat>

        <Beat progress={scrollYProgress} from={0.205} to={0.285} align="right">
          <Kick>Yellowing</Kick>
          <Line>Then someone</Line>
          <Line className="italic gradient-text-ember mt-2">turns up the heat.</Line>
        </Beat>

        <Beat progress={scrollYProgress} from={0.3} to={0.38} align="left">
          <Kick>Chapter 01</Kick>
          <Line>
            Q <span className="font-qissa italic gradient-text-copper">— Qissa.</span>
          </Line>
          <p className="font-body text-cream-200/60 text-sm sm:text-base mt-4">
            Every beginning needs a story. Ours starts in a drum, not a doorway.
          </p>
        </Beat>

        <Beat progress={scrollYProgress} from={0.415} to={0.48} align="center">
          <Line>One name.</Line>
          <Line className="italic mt-2">Different meanings.</Line>
        </Beat>

        <Beat progress={scrollYProgress} from={0.5} to={0.565} align="right">
          <Kick>Cinnamon</Kick>
          <Line>Every letter holds</Line>
          <Line className="italic gradient-text-copper mt-2">a different story.</Line>
        </Beat>

        <Beat progress={scrollYProgress} from={0.585} to={0.665} align="center">
          <Kick>196°C</Kick>
          <p className="font-display text-[clamp(2.4rem,8vw,6rem)] tracking-[0.06em] leading-none gradient-text-ember glow-text">
            FIRST CRACK
          </p>
          <p className="font-serif italic text-cream-200/75 text-lg sm:text-2xl mt-5">
            The moment something can't go back to what it was.
          </p>
        </Beat>

        <Beat progress={scrollYProgress} from={0.69} to={0.765} align="left">
          <Kick>Development</Kick>
          <Line>Some things shouldn't be rushed.</Line>
          <Line className="italic gradient-text-copper mt-2">We're not rushing this.</Line>
        </Beat>

        <Beat progress={scrollYProgress} from={0.79} to={0.875} align="right">
          <Line>Not open yet.</Line>
          <Line className="italic gradient-text-ember mt-2">Still roasting.</Line>
        </Beat>

        <Beat progress={scrollYProgress} from={0.905} to={0.998} align="center">
          <h2 className="font-display text-[clamp(2.6rem,9vw,6.5rem)] tracking-[0.08em] text-cream-50 leading-none glow-text">
            QISSARÉ
          </h2>
          <p className="font-serif italic text-[clamp(1rem,2.2vw,1.5rem)] text-cream-200/85 mt-5">
            The Story That Never Stays Still.
          </p>
          <div className="hairline w-40 mx-auto my-7" />
          <span className="font-mono text-[11px] tracking-[0.4em] uppercase text-brass-400">
            Opening 2028 · {LOCATION}
          </span>
        </Beat>

        {/* ── Roast HUD (bottom-left) ── */}
        <motion.div
          style={{ opacity: hudOpacity }}
          className="absolute left-5 sm:left-8 bottom-[clamp(40px,9vh,84px)] z-20 pointer-events-none"
          aria-hidden="true"
        >
          <div className="glass-warm rounded-sm px-4 py-3 sm:px-5 sm:py-4 min-w-[190px]">
            <div className="flex items-baseline gap-2">
              <motion.span className="font-display text-3xl sm:text-4xl text-cream-50 tabular-nums leading-none">
                {temp}
              </motion.span>
              <span className="font-mono text-[10px] text-brass-400 tracking-widest">°C</span>
              <span className="ml-auto font-mono text-[9px] text-cream-200/40 tracking-widest">
                <motion.span>{rpm}</motion.span> RPM
              </span>
            </div>
            <div className="mt-2.5 h-px bg-cream-100/10 relative overflow-hidden">
              <motion.div
                style={{ width: heatBar }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-forest-400 via-brass-400 to-ember-500"
              />
            </div>
            <motion.span className="block mt-2 font-mono text-[9px] tracking-[0.3em] uppercase text-brass-300">
              {stage}
            </motion.span>
          </div>
        </motion.div>

        {/* progress rail */}
        <div className="absolute right-5 sm:right-8 top-1/2 -translate-y-1/2 z-20 hidden md:flex flex-col items-center gap-3">
          <span className="font-mono text-[9px] tracking-[0.3em] text-cream-200/35" style={{ writingMode: "vertical-rl" }}>
            CHAPTER ONE · THE ROAST
          </span>
          <div className="w-px h-40 bg-cream-100/10 relative overflow-hidden">
            <motion.div
              style={{ scaleY: railScale, transformOrigin: "top" }}
              className="absolute inset-0 bg-gradient-to-b from-brass-300 to-ember-500"
            />
          </div>
          <span className="w-1.5 h-1.5 rounded-full bg-ember-400 animate-pulse" />
        </div>
      </div>
    </section>
  );
}
