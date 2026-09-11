import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Feather } from "lucide-react";
import { useScrollReveal } from "../hooks/useScrollReveal";
import InstagramIcon from "./icons/InstagramIcon";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL, LOCATION } from "../data/seed";
import { getChapterOneCount, hasJoinedChapterOne, joinChapterOne } from "../utils/storage";

export default function FinalScreen() {
  const [ref, isVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const [count, setCount] = useState(1268);

  useEffect(() => {
    setJoined(hasJoinedChapterOne());
    setCount(getChapterOneCount());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    joinChapterOne();
    setCount(getChapterOneCount());
    setJoined(true);
  };

  return (
    <footer id="join" ref={ref} className="relative min-h-screen flex flex-col justify-between bg-ink-950/70 grain overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute bottom-[-25%] left-1/2 -translate-x-1/2 w-[1000px] h-[640px] orb-ember blur-[120px]" />
        <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] orb-brass blur-3xl" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pt-28 pb-16">
        {/* ── Join Chapter One ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="w-12 h-12 rounded-full border border-brass-400/40 bg-brass-400/5 flex items-center justify-center mb-7 shadow-[0_0_30px_rgba(220,176,102,0.15)]"
        >
          <Feather className="w-5 h-5 text-brass-300" strokeWidth={1.4} />
        </motion.div>

        <motion.span
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-mono text-[10px] sm:text-xs tracking-[0.4em] uppercase text-brass-400 block mb-5"
        >
          09 · Join as a Customer
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.15 }}
          className="font-serif text-[clamp(1.9rem,5vw,3.6rem)] text-cream-50 leading-tight glow-text"
        >
          Be there before
          <br />
          <span className="italic gradient-text-copper">the first cup.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-cream-200/55 max-w-md mx-auto mt-5 text-sm sm:text-base leading-relaxed"
        >
          Not a newsletter. An invitation into the first chapter — the city reveal,
          the roast trials, and an opening-day seat before the doors exist.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-10 w-full max-w-xl"
        >
          <div className="glass-warm rounded-sm p-6 sm:p-8">
            {joined ? (
              <motion.div
                initial={{ scale: 0.94, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 16, stiffness: 200 }}
              >
                <p className="font-serif italic text-xl sm:text-2xl text-cream-50">You're in Chapter One.</p>
                <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-brass-400 mt-3">
                  Customer Nº {count.toLocaleString("en-US")}
                </p>
                <p className="text-cream-200/50 text-sm mt-4">
                  We'll write when the city is chosen. Until then — follow the roast on Instagram.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  aria-label="Email address"
                  className="flex-1 bg-ink-950/50 border border-brass-400/15 focus:border-brass-400/60 rounded-sm px-4 py-3.5 text-cream-50 placeholder:text-cream-200/30 font-serif italic text-lg focus:outline-none focus:shadow-[0_0_24px_rgba(220,176,102,0.12)] transition-all duration-300"
                />
                <button
                  type="submit"
                  data-cursor="join"
                  className="btn-brass px-7 py-3.5 rounded-sm font-mono text-[11px] tracking-[0.25em] uppercase inline-flex items-center justify-center gap-2"
                >
                  Join Chapter One
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
          <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-cream-200/30 mt-5">
            {count.toLocaleString("en-US")} people are already waiting for the story
          </p>
        </motion.div>

        {/* ── Instagram ── */}
        <motion.a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="insta"
          initial={{ opacity: 0, y: 16 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.55 }}
          className="group mt-12 inline-flex items-center gap-4 btn-ghost rounded-full pl-2 pr-6 py-2"
        >
          <span className="w-10 h-10 rounded-full bg-gradient-to-br from-brass-300 via-ember-400 to-ember-600 flex items-center justify-center text-ink-950 shadow-[0_0_24px_rgba(242,97,42,0.35)] group-hover:scale-105 transition-transform duration-300">
            <InstagramIcon className="w-5 h-5" />
          </span>
          <span className="text-left">
            <span className="block font-mono text-[10px] tracking-[0.3em] uppercase text-cream-200/50">
              Follow the roast
            </span>
            <span className="block font-display text-base tracking-wider text-cream-50">{INSTAGRAM_HANDLE}</span>
          </span>
        </motion.a>
      </div>

      {/* ── The quiet ending ── */}
      <div className="relative z-10 text-center px-6 pb-6">
        <motion.h3
          initial={{ opacity: 0, letterSpacing: "0.4em" }}
          animate={isVisible ? { opacity: 1, letterSpacing: "0.12em" } : {}}
          transition={{ duration: 1.6, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-[clamp(2.4rem,9vw,7rem)] leading-none text-cream-50 glow-text"
        >
          QISSARÉ
        </motion.h3>
        <motion.p
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 1.1 }}
          className="font-serif italic text-[clamp(0.95rem,2.2vw,1.4rem)] text-cream-200/75 mt-4"
        >
          The Story That Never Stays Still.
        </motion.p>
        <div className="flex items-center justify-center gap-8 mt-6">
          <a href="#journal" data-cursor="read" className="flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] uppercase text-cream-200/45 hover:text-brass-300 transition-colors duration-300">
            <BookOpen className="w-3.5 h-3.5" /> Journal
          </a>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" data-cursor="insta" className="flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] uppercase text-cream-200/45 hover:text-brass-300 transition-colors duration-300">
            <InstagramIcon className="w-3.5 h-3.5" /> Instagram
          </a>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full px-5 sm:px-8 pb-8">
        <div className="hairline mb-6" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-cream-200/30">
            © {new Date().getFullYear()} Qissaré · {LOCATION}
          </span>
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-brass-400/60">Opening 2028</span>
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-cream-200/30">Roasted in public</span>
        </div>
      </div>
    </footer>
  );
}
