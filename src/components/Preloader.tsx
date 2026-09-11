import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LOCATION } from "../data/seed";

const STAGES = ["Sourcing", "Green", "Yellowing", "Cinnamon", "First crack", "Developing", "Qissaré roast"];

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 2400;
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(Math.round(eased * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
      else window.setTimeout(onComplete, 520);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onComplete]);

  const stage = STAGES[Math.min(STAGES.length - 1, Math.floor((progress / 100) * STAGES.length))];
  // bean colour shifts with progress: green → dark roast
  const hue = 82 - progress * 0.62;
  const light = 42 - progress * 0.26;
  const sat = 32 + progress * 0.2;

  return (
    <motion.div
      initial={{ y: 0 }}
      exit={{ y: "-100%" }}
      transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
      className="fixed inset-0 z-[10000] bg-ink-950 flex flex-col items-center justify-center px-6 overflow-hidden"
    >
      <div className="absolute w-[520px] h-[520px] rounded-full orb-ember blur-3xl animate-pulse-soft" aria-hidden="true" />

      <div className="relative flex-1 flex flex-col items-center justify-center">
        {/* roasting bean */}
        <motion.svg
          viewBox="0 0 100 100"
          className="w-14 h-14 sm:w-16 sm:h-16 mb-8 animate-spin-slow"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9 }}
          aria-hidden="true"
        >
          <ellipse cx="50" cy="50" rx="30" ry="42" fill={`hsl(${hue} ${sat}% ${light}%)`} transform="rotate(-24 50 50)" />
          <path d="M40 14 C 62 36, 38 64, 60 86" stroke="rgba(10,6,4,0.75)" strokeWidth="4.5" fill="none" strokeLinecap="round" transform="rotate(-24 50 50)" />
          <ellipse cx="38" cy="30" rx="6" ry="10" fill="rgba(255,235,200,0.14)" transform="rotate(-24 50 50)" />
        </motion.svg>

        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="font-serif italic text-brass-300/70 text-sm sm:text-base tracking-wide mb-5"
        >
          est. 2028 · {LOCATION.toLowerCase()}
        </motion.span>
        <motion.div
          initial={{ opacity: 0, letterSpacing: "0.6em" }}
          animate={{ opacity: 1, letterSpacing: "0.22em" }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-3xl sm:text-5xl text-cream-50 tracking-[0.22em] glow-text"
        >
          QISSARÉ
        </motion.div>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.4, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-24 h-px bg-gradient-to-r from-transparent via-brass-400 to-transparent mt-6 origin-center"
        />
      </div>

      <div className="relative w-full max-w-6xl pb-10">
        <div className="flex items-end justify-between mb-4">
          <div>
            <span className="font-mono text-[10px] sm:text-xs tracking-[0.35em] uppercase text-cream-200/40 block">
              The Story That Never Stays Still
            </span>
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-brass-400/80 block mt-2">
              {stage}
            </span>
          </div>
          <span className="font-display text-5xl sm:text-7xl tabular-nums leading-none gradient-text-copper">
            {progress}
            <span className="text-2xl sm:text-4xl align-top">%</span>
          </span>
        </div>
        <div className="w-full h-px bg-ink-700 relative">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-forest-400 via-brass-400 to-ember-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
}
