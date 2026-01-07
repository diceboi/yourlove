"use client";

import { motion } from "framer-motion";
import { TbCookie } from "react-icons/tb";

export default function FloatingCookieButton({ onClick }) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 200, damping: 15 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 left-6 z-[90] w-12 h-12 bg-[var(--pink)] hover:bg-[var(--pink)]/90 text-white rounded-full shadow-xl flex items-center justify-center transition-colors duration-200 group"
      aria-label="Süti beállítások megnyitása"
      title="Süti beállítások"
    >
      <TbCookie className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" />
    </motion.button>
  );
}
