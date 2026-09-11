"use client";

import { useCallback, useState } from "react";
import { AnimatePresence } from "framer-motion";
import Cursor from "./components/Cursor";
import Preloader from "./components/Preloader";
import Navbar from "./components/Navbar";
import EmberBackground from "./components/EmberBackground";
import CinematicSection from "./components/CinematicSection";
import LettersSection from "./components/LettersSection";
import JournalSection from "./components/JournalSection";
import SecretsSection from "./components/SecretsSection";
import OpeningSection from "./components/OpeningSection";
import FinalScreen from "./components/FinalScreen";
import SecretModal from "./components/SecretModal";
import { SECRETS, type SecretContent } from "./data/seed";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [secret, setSecret] = useState<SecretContent | null>(null);

  const openBeanSecret = useCallback(() => setSecret(SECRETS.bean), []);
  return (
    <div className="min-h-screen bg-ink-950">
      <Cursor />
      <EmberBackground />

      <AnimatePresence>
        {loading && <Preloader onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      <Navbar />

      <main className="relative z-10">
        <CinematicSection onSecret={openBeanSecret} />
        <LettersSection />
        <JournalSection />
        <SecretsSection onSecret={setSecret} />
        <OpeningSection />
      </main>

      <div className="relative z-10">
        <FinalScreen />
      </div>

      <SecretModal secret={secret} onClose={() => setSecret(null)} />
    </div>
  );
}
