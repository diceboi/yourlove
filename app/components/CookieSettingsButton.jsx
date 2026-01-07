"use client";

import { TbCookie } from "react-icons/tb";

export default function CookieSettingsButton({ onClick, variant = "default" }) {
  if (variant === "text") {
    // Text link style for footer
    return (
      <button
        onClick={onClick}
        className="text-sm text-[var(--tertiary-text)] hover:text-[var(--pink)] transition-colors duration-200 flex items-center gap-2"
      >
        <TbCookie className="w-4 h-4" />
        Süti beállítások
      </button>
    );
  }

  // Default button style
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-lg border border-[var(--border)] bg-white hover:bg-gray-50 text-[var(--black)] font-semibold text-sm transition-all duration-200 flex items-center gap-2"
    >
      <TbCookie className="w-4 h-4 text-[var(--pink)]" />
      Süti beállítások
    </button>
  );
}
