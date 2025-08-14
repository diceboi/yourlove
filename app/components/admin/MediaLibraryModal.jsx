'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { TbX } from 'react-icons/tb';
import { motion, AnimatePresence } from 'framer-motion';

export default function MediaLibraryModal({ isOpen, onClose, onSelect }) {
  const images = [
    '/termekkepek/1.jpg',
    '/termekkepek/2.jpg',
    '/termekkepek/3.jpg',
  ];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  if (typeof window === 'undefined') return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.section
          className="fixed inset-0 z-[999] flex justify-end bg-black/10 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          onClick={onClose}
        >
          <motion.div
            className="relative bg-white w-[90%] sm:w-[450px] max-h-[100vh] overflow-y-auto shadow-xl"
            initial={{ x: 500, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 500, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Záró gomb */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-50 text-gray-600 hover:text-red-500"
            >
              <TbX className="w-6 h-6" />
            </button>

            {/* Fejléc */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Médiatár</h2>
              <button className="text-sm text-[var(--pink)] underline">
                Kép feltöltése
              </button>
            </div>

            {/* Keresés */}
            <div className="p-4">
              <input
                type="text"
                placeholder="Keresés"
                className="w-full px-4 py-2 border rounded-md text-sm"
              />
            </div>

            {/* Kép grid */}
            <div className="flex-1 overflow-auto p-4 grid grid-cols-3 gap-3">
              {images.map((img) => (
                <div
                  key={img}
                  onClick={() => {
                    onSelect(img);
                    onClose();
                  }}
                  className="relative w-full aspect-square cursor-pointer group"
                >
                  <Image
                    src={img}
                    alt="media"
                    fill
                    className="object-cover rounded-md group-hover:opacity-80"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
