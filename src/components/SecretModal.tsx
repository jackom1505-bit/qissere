import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Eye } from "lucide-react";
import type { SecretContent } from "../data/seed";
import { unlockSecret } from "../utils/storage";

interface SecretModalProps {
  secret: SecretContent | null;
  onClose: () => void;
}

export default function SecretModal({ secret, onClose }: SecretModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (secret) unlockSecret(secret.id);
  }, [secret]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (secret) setCopied(false);
  }, [secret]);

  const handleCopy = async () => {
    if (!secret) return;
    try {
      await navigator.clipboard.writeText(secret.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <AnimatePresence>
      {secret && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center p-5"
          role="dialog"
          aria-modal="true"
        >
          <div className="absolute inset-0 bg-ink-950/92 backdrop-blur-md" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.94, filter: "blur(8px)" }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
            className="relative z-10 w-full max-w-md glass-warm border-brass-500/30 rounded-sm p-8 sm:p-10 text-center grain overflow-hidden shadow-[0_0_80px_rgba(242,97,42,0.15)]"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-cream-200/40 hover:text-cream-50 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <motion.div
              initial={{ scale: 0.6, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 12, delay: 0.15 }}
              className="w-12 h-12 rounded-full border border-brass-400/40 bg-brass-400/5 flex items-center justify-center mx-auto mb-6"
            >
              <Eye className="w-5 h-5 text-brass-300" strokeWidth={1.4} />
            </motion.div>

            <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-cream-200/40 mb-3">
              You weren't supposed to find this.
            </p>
            <p className="font-serif italic gradient-text-copper text-base mb-2">{secret.kicker}</p>
            <h3 className="font-display text-2xl sm:text-3xl tracking-wide text-cream-50 mb-4">
              {secret.title}
            </h3>
            <p className="text-cream-200/65 text-sm leading-relaxed mb-8">{secret.line}</p>

            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="font-mono text-sm tracking-[0.25em] text-brass-300 border border-brass-500/30 rounded-sm px-5 py-2.5 bg-ink-950/60">
                {secret.code}
              </div>
              <button
                onClick={handleCopy}
                data-cursor="copy"
                className="w-11 h-11 rounded-sm border border-cream-100/15 flex items-center justify-center hover:border-brass-400/50 transition-colors"
                aria-label="Copy code"
              >
                {copied ? <Check className="w-4 h-4 text-forest-400" /> : <Copy className="w-4 h-4 text-cream-200/60" />}
              </button>
            </div>
            <p className="font-mono text-[9px] tracking-[0.25em] uppercase text-cream-200/30">
              Keep it. It will mean something on opening day.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
