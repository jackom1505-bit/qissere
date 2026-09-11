import { motion } from "framer-motion";
import { Phone, Mail, BookOpen, Camera, Bean } from "lucide-react";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { SECRET_ITEMS, SECRETS, type SecretContent } from "../data/seed";
import { isSecretUnlocked } from "../utils/storage";

const icons: Record<string, typeof Phone> = {
  telephone: Phone,
  envelope: Mail,
  book: BookOpen,
  photograph: Camera,
  bean: Bean,
};

export default function SecretsSection({ onSecret }: { onSecret: (s: SecretContent) => void }) {
  const [ref, isVisible] = useScrollReveal<HTMLDivElement>();

  return (
    <section id="secrets" ref={ref} className="relative py-28 sm:py-40 bg-ink-950/55 grain overflow-hidden">
      <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-8 text-center">
        <motion.div initial={{ opacity: 0 }} animate={isVisible ? { opacity: 1 } : {}} transition={{ duration: 0.8 }}>
          <span className="font-mono text-[10px] sm:text-xs tracking-[0.4em] uppercase text-brass-400 block mb-5">
            08 · A Secret Element
          </span>
          <h2 className="font-serif text-[clamp(1.8rem,4.5vw,3.4rem)] text-cream-50 leading-tight glow-text">
            Look <span className="italic gradient-text-ember">closer.</span>
          </h2>
          <p className="text-cream-200/55 max-w-md mx-auto mt-4 text-sm sm:text-base leading-relaxed">
            Some objects in Qissaré speak. Five of them are already hidden —
            and one bean in the roaster never turned dark.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="flex items-center justify-center gap-3 sm:gap-6 mt-14 flex-wrap"
        >
          {SECRET_ITEMS.map((item) => {
            const Icon = icons[item.id];
            const unlocked = isSecretUnlocked(item.id);
            return (
              <button
                key={item.id}
                onClick={() => onSecret(SECRETS[item.id])}
                data-cursor="psst"
                className="group relative flex flex-col items-center gap-3 p-4 sm:p-5"
                aria-label={`Secret: ${item.label}`}
              >
                <span
                  className={`w-16 h-16 rounded-full border flex items-center justify-center transition-all duration-500 ${
                    unlocked
                      ? "border-brass-400/70 bg-brass-400/10 shadow-[0_0_30px_rgba(220,176,102,0.2)]"
                      : "border-cream-100/12 glass-warm group-hover:border-ember-400/60 group-hover:shadow-[0_0_30px_rgba(242,97,42,0.18)]"
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 transition-colors duration-500 ${
                      unlocked ? "text-brass-300" : "text-cream-200/45 group-hover:text-ember-300"
                    }`}
                    strokeWidth={1.4}
                  />
                </span>
                <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-cream-200/30 group-hover:text-cream-100/70 transition-colors duration-300">
                  {item.label}
                </span>
                <span className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[9px] tracking-wider text-brass-300/90 bg-ink-900 border border-brass-500/30 rounded-sm px-2.5 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  {item.hint}
                </span>
              </button>
            );
          })}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.55 }}
          className="font-mono text-[10px] tracking-[0.25em] uppercase text-cream-200/25 mt-14"
        >
          The golden bean lives in the cooling tray. Scroll back up if you missed it.
        </motion.p>
      </div>
    </section>
  );
}
