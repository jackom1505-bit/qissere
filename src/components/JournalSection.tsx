import { motion } from "framer-motion";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { JOURNAL } from "../data/seed";
import { Lock, CircleDashed, PenLine } from "lucide-react";

const statusIcon = { Revealed: PenLine, Unfolding: CircleDashed, Sealed: Lock };

export default function JournalSection() {
  const [ref, isVisible] = useScrollReveal<HTMLDivElement>();

  return (
    <section id="journal" ref={ref} className="relative py-28 sm:py-40 bg-ink-900/60 grain overflow-hidden">
      <div className="absolute -bottom-40 -right-20 w-[600px] h-[600px] orb-ember blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-14"
        >
          <span className="font-mono text-[10px] sm:text-xs tracking-[0.4em] uppercase text-brass-400 block mb-5">
            07 · Watch Us Build It
          </span>
          <h2 className="font-serif text-[clamp(1.8rem,4.5vw,3.4rem)] text-cream-50 leading-tight glow-text">
            The <span className="italic gradient-text-copper">Journal</span>
          </h2>
          <p className="text-cream-200/55 max-w-lg mt-4 text-sm sm:text-base leading-relaxed">
            Two years before the first cup, the making itself becomes the story.
            Entries unlock as they happen — no renders of promises, only the real mess.
          </p>
        </motion.div>

        <div className="glass-warm rounded-sm px-6 sm:px-9 py-2">
          {JOURNAL.map((entry, i) => {
            const Icon = statusIcon[entry.status];
            const sealed = entry.status === "Sealed";
            return (
              <motion.div
                key={entry.no}
                initial={{ opacity: 0, x: -24 }}
                animate={isVisible ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] }}
                className={`group flex items-start gap-5 sm:gap-8 py-6 sm:py-7 border-b border-brass-400/10 last:border-0 ${
                  sealed ? "opacity-45" : ""
                }`}
              >
                <span className="font-serif italic gradient-text-copper text-lg sm:text-xl w-12 shrink-0 pt-0.5">
                  {entry.no}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3
                      className={`font-body font-medium text-lg sm:text-xl tracking-wide transition-colors duration-300 ${
                        sealed ? "text-cream-100/40" : "text-cream-50 group-hover:text-brass-300"
                      }`}
                    >
                      {entry.title}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1.5 font-mono text-[9px] tracking-[0.25em] uppercase px-2.5 py-1 rounded-full border ${
                        entry.status === "Revealed"
                          ? "border-brass-400/40 text-brass-300 bg-brass-400/5"
                          : entry.status === "Unfolding"
                          ? "border-ember-400/40 text-ember-300 bg-ember-500/5"
                          : "border-cream-100/10 text-cream-200/30"
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      {entry.status}
                    </span>
                  </div>
                  <p
                    className={`text-sm mt-2 leading-relaxed ${
                      sealed ? "text-cream-100/25 blur-[0.6px] select-none" : "text-cream-200/55"
                    }`}
                  >
                    {entry.blurb}
                  </p>
                </div>
                <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-cream-200/30 shrink-0 hidden sm:block pt-1.5">
                  {entry.date}
                </span>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="font-serif italic text-cream-200/40 text-sm sm:text-base mt-12 text-center"
        >
          New entries appear when they happen — not on a schedule.
        </motion.p>
      </div>
    </section>
  );
}
