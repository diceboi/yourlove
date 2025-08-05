'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CgClose } from 'react-icons/cg'

export default function Modal({ children, openstate, onClose, className = '' }) {
  if (typeof window === 'undefined') return null // SSR védőfal

  return (
    <AnimatePresence>
      {openstate && (
        <motion.section
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          onClick={onClose} // háttérre kattintás zárja
        >
          <motion.div
            className={`relative bg-white rounded-2xl shadow-xl w-[90%] max-w-4xl max-h-[90vh] overflow-y-auto p-6 ${className}`}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()} // belsőre kattintás ne zárja be
          >
            <button
              className="absolute top-4 right-4 z-50 text-gray-600 hover:text-red-500"
              onClick={onClose}
            >
              <CgClose className="w-6 h-6" />
            </button>

            {children}
          </motion.div>
        </motion.section>
      )}
    </AnimatePresence>
  )
}
