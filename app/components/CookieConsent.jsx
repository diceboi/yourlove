"use client";

import { useState, useEffect } from "react";
import CookieBanner from "./CookieBanner";
import CookieSettings from "./CookieSettings";
import FloatingCookieButton from "./FloatingCookieButton";
import { hasValidConsent } from "@/utils/cookie-utils";

export default function CookieConsent() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    // Check if user has valid consent
    const valid = hasValidConsent();
    setHasConsent(valid);
    setShowBanner(!valid);
  }, []);

  useEffect(() => {
    // Listen for consent changes
    const handleConsentUpdate = () => {
      setHasConsent(true);
      setShowBanner(false);
    };

    window.addEventListener('cookieConsentUpdated', handleConsentUpdate);
    return () => window.removeEventListener('cookieConsentUpdated', handleConsentUpdate);
  }, []);

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
    setShowBanner(false); // Hide banner when opening settings
  };

  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
    // If user doesn't have valid consent, show banner again
    if (!hasValidConsent()) {
      setShowBanner(true);
    }
  };

  return (
    <>
      <CookieBanner 
        onOpenSettings={handleOpenSettings} 
        showBanner={showBanner}
      />
      <CookieSettings
        isOpen={isSettingsOpen}
        onClose={handleCloseSettings}
      />
      {/* Floating button - always visible after initial consent */}
      {hasConsent && (
        <FloatingCookieButton onClick={() => setIsSettingsOpen(true)} />
      )}
    </>
  );
}
