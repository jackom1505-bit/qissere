import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import InstagramIcon from "./icons/InstagramIcon";
import { INSTAGRAM_URL } from "../data/seed";

const links = [
  { label: "The Letters", href: "#letters" },
  { label: "The Journal", href: "#journal" },
  { label: "Look Closer", href: "#secrets" },
  { label: "Join", href: "#join" },
];

export default function Navbar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 2.2);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-0 left-0 right-0 z-50 bg-ink-950/65 backdrop-blur-md border-b border-brass-400/10"
        >
          <div className="max-w-7xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
            <a href="#" data-cursor="top" className="font-display tracking-[0.2em] text-sm text-cream-50">
              QISSA<span className="gradient-text-copper">RÉ</span>
            </a>
            <div className="hidden md:flex items-center gap-8">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  data-cursor="go"
                  className="link-line font-mono text-[10px] tracking-[0.25em] uppercase text-cream-200/50 hover:text-cream-50"
                >
                  {l.label}
                </a>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden sm:block font-mono text-[10px] tracking-[0.3em] uppercase text-brass-400/80">
                Opening 2028
              </span>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="insta"
                aria-label="Qissaré on Instagram"
                className="w-8 h-8 rounded-full border border-brass-400/25 flex items-center justify-center text-cream-200/60 hover:text-brass-300 hover:border-brass-400/60 transition-colors duration-300"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
