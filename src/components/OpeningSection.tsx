import { motion } from "framer-motion";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { LOCATION } from "../data/seed";

export default function OpeningSection() {
  const [ref, isVisible] = useScrollReveal<HTMLDivElement>();

  return (
    <section ref={ref} className="relative py-32 sm:py-48 bg-ink-900/60 grain overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] rounded-full border border-brass-400/8" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full border border-brass-400/8" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full orb-ember blur-3xl animate-pulse-soft" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 text-center">
        <motion.span
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="font-mono text-[10px] sm:text-xs tracking-[0.4em] uppercase text-brass-400 block mb-8"
        >
          06 · Opening Countdown
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 26 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-[clamp(3.4rem,12vw,9rem)] leading-none tracking-tight gradient-text-copper glow-text"
        >
          2028
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="font-serif italic text-[clamp(1.1rem,2.6vw,1.7rem)] text-cream-200/85 mt-7"
        >
          We're taking our time.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="text-cream-200/50 text-sm sm:text-base mt-5 leading-relaxed"
        >
          Good stories shouldn't be rushed — and neither should a roast.
          <br className="hidden sm:block" />
          When we're three months out, this replaces itself with a real countdown.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="hairline w-44 mx-auto mt-10"
        />

        <motion.span
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="font-mono text-[10px] tracking-[0.3em] uppercase text-cream-200/30 mt-8 block"
        >
          {LOCATION} · the city stays a secret until Chapter 002
        </motion.span>
      </div>
    </section>
  );
}
