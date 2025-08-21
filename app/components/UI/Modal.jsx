"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CgClose } from "react-icons/cg";

export default function Modal({
  children,
  openstate,
  onClose,
  className = "",
  closeButton,
}) {
  if (typeof window === "undefined") return null; // SSR védőfal

  return (
    <AnimatePresence>
      {openstate && (
        <motion.section
          className="fixed inset-0 z-[998] flex justify-end bg-black/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          onClick={onClose} // háttérre kattintás zárja
        >
          <motion.div
            className={`relative bg-[#f5f5f5] shadow-xl w-[90%] max-h-[100vh] overflow-y-auto ${className}`}
            initial={{ x: 2000, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 2000, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()} // belsőre kattintás ne zárja be
          >
            {closeButton && (
              <button
                className="absolute top-4 right-4 z-50 text-gray-600 hover:text-red-500 cursor-pointer"
                onClick={onClose}
              >
                <CgClose className="w-6 h-6" />
              </button>
            )}

            {children}
          </motion.div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
