"use client";

import { motion, AnimatePresence } from "framer-motion";
import { TbCookie, TbSettings, TbCheck, TbX } from "react-icons/tb";
import {
  acceptAllCookies,
  rejectNonEssentialCookies,
} from "@/utils/cookie-utils";

export default function CookieBanner({ onOpenSettings, showBanner }) {
  const handleAcceptAll = () => {
    acceptAllCookies();
  };

  const handleRejectNonEssential = () => {
    rejectNonEssentialCookies();
  };

  const handleCustomize = () => {
    onOpenSettings?.();
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6"
        >
          <div className="max-w-7xl mx-auto">
            <div className="bg-white/95 backdrop-blur-lg border border-[var(--border)] rounded-2xl shadow-2xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-[var(--pink)]/10 rounded-full flex items-center justify-center">
                    <TbCookie className="w-6 h-6 md:w-7 md:h-7 text-[var(--pink)]" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg md:text-xl font-bold text-[var(--black)] mb-2">
                    Sütik kezelése
                  </h3>
                  <p className="text-sm md:text-base text-[var(--tertiary-text)] leading-relaxed">
                    Weboldalunk sütiket (cookie-kat) használ a legjobb felhasználói élmény
                    biztosítása érdekében. Néhány süti elengedhetetlen a weboldal működéséhez,
                    míg mások segítenek javítani a teljesítményt és személyre szabni a tartalmat.{" "}
                    <a
                      href="/adatvedelem"
                      className="text-[var(--pink)] hover:underline font-semibold"
                    >
                      Adatvédelmi tájékoztató
                    </a>
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto md:flex-shrink-0">
                  <button
                    onClick={handleRejectNonEssential}
                    className="px-4 py-2.5 rounded-lg border border-[var(--border)] bg-white hover:bg-gray-50 text-[var(--black)] font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <TbX className="w-4 h-4" />
                    Csak szükséges
                  </button>

                  <button
                    onClick={handleCustomize}
                    className="px-4 py-2.5 rounded-lg border border-[var(--pink)] bg-white hover:bg-[var(--pink)]/5 text-[var(--pink)] font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <TbSettings className="w-4 h-4" />
                    Beállítások
                  </button>

                  <button
                    onClick={handleAcceptAll}
                    className="px-4 py-2.5 rounded-lg bg-[var(--pink)] hover:bg-[var(--pink)]/90 text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap shadow-lg shadow-[var(--pink)]/20"
                  >
                    <TbCheck className="w-4 h-4" />
                    Összes elfogadása
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
