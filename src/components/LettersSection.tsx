import { motion } from "framer-motion";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { LETTERS } from "../data/seed";

export default function LettersSection() {
  const [ref, isVisible] = useScrollReveal<HTMLDivElement>();

  return (
    <section id="letters" ref={ref} className="relative py-28 sm:py-40 bg-ink-950/55 grain overflow-hidden">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] orb-brass blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="font-mono text-[10px] sm:text-xs tracking-[0.4em] uppercase text-brass-400 block mb-5">
            04 · The Seven-Letter System
          </span>
          <h2 className="font-serif text-[clamp(1.8rem,4.5vw,3.4rem)] text-cream-50 leading-tight glow-text">
            Seven letters.
            <span className="italic gradient-text-copper"> Seven eras.</span>
          </h2>
          <p className="text-cream-200/55 max-w-xl mx-auto mt-5 text-sm sm:text-base leading-relaxed">
            Each year, one letter wakes up and takes over what Qissaré means.
            The rest are still roasting — we won't spoil them for you.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-end justify-center gap-1.5 sm:gap-4 md:gap-6 flex-wrap"
        >
          {LETTERS.map((era, i) => (
            <div key={i} className="flex flex-col items-center">
              <span
                className={`font-display leading-none select-none ${
                  era.revealed
                    ? "gradient-text-copper text-[clamp(3rem,9vw,7rem)] animate-breathe"
                    : "text-cream-100/[0.07] text-[clamp(1.9rem,6vw,4.5rem)] blur-[1.5px]"
                }`}
              >
                {era.letter}
              </span>
              <span
                className={`font-mono text-[9px] sm:text-[10px] tracking-[0.3em] uppercase mt-3 sm:mt-4 ${
                  era.revealed ? "text-brass-400" : "text-cream-200/20"
                }`}
              >
                {era.revealed ? "now" : "?"}
              </span>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mt-14"
        >
          <div className="inline-flex items-center gap-5 glass-warm rounded-sm px-7 py-5">
            <div className="hairline-v h-12" />
            <div className="text-left">
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-cream-200/40">
                Chapter 01 · Now
              </span>
              <p className="font-serif text-xl sm:text-2xl text-cream-50 mt-1">
                Q <span className="font-qissa italic gradient-text-copper">— Qissa · story</span>
              </p>
              <p className="text-cream-200/50 text-sm mt-1.5 max-w-md">
                Every beginning needs one. This is the year the café learns to speak.
              </p>
            </div>
            <div className="hairline-v h-12" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
