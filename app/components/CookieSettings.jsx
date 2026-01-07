"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TbX,
  TbCheck,
  TbShieldCheck,
  TbChartBar,
  TbPuzzle,
  TbSpeakerphone,
  TbCookie,
} from "react-icons/tb";
import {
  COOKIE_CATEGORIES,
  getConsentPreferences,
  saveConsent,
  acceptAllCookies,
  getConsentExpiryDate,
} from "@/utils/cookie-utils";

const CATEGORY_INFO = {
  [COOKIE_CATEGORIES.NECESSARY]: {
    title: "Feltétlenül szükséges sütik",
    icon: TbShieldCheck,
    description:
      "Ezek a sütik elengedhetetlenek a weboldal működéséhez. Lehetővé teszik az alapvető funkciókat, mint a biztonságos bejelentkezés, kosár kezelés és navigáció. Ezek a sütik nem tárolnak személyes adatokat és nem kapcsolhatók ki.",
    examples: "Munkamenet kezelés, bejelentkezési tokenek, nyelvi beállítások, kosár adatok",
    alwaysEnabled: true,
  },
  [COOKIE_CATEGORIES.ANALYTICS]: {
    title: "Teljesítmény és analitika sütik",
    icon: TbChartBar,
    description:
      "Ezek a sütik segítenek megérteni, hogyan használják a látogatók a weboldalunkat. Információkat gyűjtenek a meglátogatott oldalakról, a töltési időről és esetleges hibákról. Az adatokat csak statisztikai célokra használjuk fel a felhasználói élmény javítása érdekében.",
    examples: "Google Analytics, látogatottsági statisztikák, oldalteljesítmény mérés",
    alwaysEnabled: false,
  },
  [COOKIE_CATEGORIES.FUNCTIONAL]: {
    title: "Funkcionális sütik",
    icon: TbPuzzle,
    description:
      "Ezek a sütik lehetővé teszik a továbbfejlesztett funkciókat és személyre szabást. Megjegyzik a választásait (pl. felhasználónév, régió) és javított, személyre szabott funkciókat biztosítanak.",
    examples: "Chat widget, videó lejátszó, közösségi média beágyazások, preferenciák tárolása",
    alwaysEnabled: false,
  },
  [COOKIE_CATEGORIES.MARKETING]: {
    title: "Marketing és hirdetési sütik",
    icon: TbSpeakerphone,
    description:
      "Ezek a sütik nyomon követik az Ön böngészési szokásait, hogy releváns hirdetéseket jeleníthessünk meg. Korlátozhatják egy hirdetés megjelenésének számát és mérik a kampányok hatékonyságát. Általában harmadik fél által kerülnek elhelyezésre, az Ön engedélyével.",
    examples: "Facebook Pixel, Google Ads, konverziókövetés, remarketing",
    alwaysEnabled: false,
  },
};

export default function CookieSettings({ isOpen, onClose }) {
  const [preferences, setPreferences] = useState({});
  const [expiryDate, setExpiryDate] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const currentPreferences = getConsentPreferences();
      setPreferences(currentPreferences);
      
      const expiry = getConsentExpiryDate();
      setExpiryDate(expiry);
    }
  }, [isOpen]);

  const handleToggle = (category) => {
    if (CATEGORY_INFO[category].alwaysEnabled) return; // Don't allow toggling necessary cookies

    setPreferences((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleSave = () => {
    // Explicit save action
    saveConsent(preferences);
    onClose?.();
  };

  const handleCancel = () => {
    // Just close without saving - user returns to banner
    onClose?.();
  };

  const handleAcceptAll = () => {
    acceptAllCookies();
    onClose?.();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancel}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110]"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="p-6 md:p-8 border-b border-[var(--border)] flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[var(--pink)]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <TbCookie className="w-6 h-6 text-[var(--pink)]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[var(--black)]">
                      Süti beállítások
                    </h2>
                    <p className="text-sm text-[var(--tertiary-text)] mt-1">
                      Személyre szabhatja a süti preferenciáit
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCancel}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Bezárás mentés nélkül"
                >
                  <TbX className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                {Object.entries(CATEGORY_INFO).map(([category, info]) => {
                  const Icon = info.icon;
                  const isEnabled = preferences[category] === true;

                  return (
                    <div
                      key={category}
                      className="border border-[var(--border)] rounded-xl p-6 hover:border-[var(--pink)]/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <Icon className="w-5 h-5 text-[var(--pink)]" />
                            <h3 className="text-lg font-semibold text-[var(--black)]">
                              {info.title}
                            </h3>
                            {info.alwaysEnabled && (
                              <span className="text-xs bg-[var(--pink)]/10 text-[var(--pink)] px-2 py-1 rounded-full font-semibold">
                                Kötelező
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-[var(--tertiary-text)] mb-3 leading-relaxed">
                            {info.description}
                          </p>
                          <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                            <span className="font-semibold">Példák: </span>
                            {info.examples}
                          </div>
                        </div>

                        {/* Toggle */}
                        <button
                          onClick={() => handleToggle(category)}
                          disabled={info.alwaysEnabled}
                          className={`flex-shrink-0 w-12 h-6 rounded-full transition-all duration-300 ${
                            isEnabled
                              ? "bg-[var(--pink)]"
                              : "bg-gray-300"
                          } ${
                            info.alwaysEnabled
                              ? "cursor-not-allowed opacity-50"
                              : "cursor-pointer"
                          }`}
                        >
                          <motion.div
                            layout
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className={`w-5 h-5 bg-white rounded-full shadow-md ${
                              isEnabled ? "ml-[26px]" : "ml-0.5"
                            } mt-0.5`}
                          />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Expiry info */}
                {expiryDate && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm text-blue-900">
                      <span className="font-semibold">Megjegyzés: </span>
                      Az Ön hozzájárulása {new Date(expiryDate).toLocaleDateString("hu-HU")} -ig/ig
                      érvényes. Ezt követően újra kell választania.
                    </p>
                  </div>
                )}

                {/* Privacy links */}
                <div className="border-t border-[var(--border)] pt-6">
                  <p className="text-sm text-[var(--tertiary-text)]">
                    További információkért olvassa el az{" "}
                    <a
                      href="/adatvedelem"
                      className="text-[var(--pink)] hover:underline font-semibold"
                    >
                      Adatvédelmi tájékoztatót
                    </a>{" "}
                    és a{" "}
                    <a
                      href="/sutik"
                      className="text-[var(--pink)] hover:underline font-semibold"
                    >
                      Süti szabályzatot
                    </a>
                    .
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 md:p-8 border-t border-[var(--border)] bg-gray-50 flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  onClick={handleAcceptAll}
                  className="px-6 py-3 rounded-lg border border-[var(--pink)] bg-white hover:bg-[var(--pink)]/5 text-[var(--pink)] font-semibold text-sm transition-all duration-200"
                >
                  Összes elfogadása
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-3 rounded-lg bg-[var(--pink)] hover:bg-[var(--pink)]/90 text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[var(--pink)]/20"
                >
                  <TbCheck className="w-5 h-5" />
                  Beállítások mentése
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
