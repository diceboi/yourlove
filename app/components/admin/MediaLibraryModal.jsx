// components/MediaLibraryModal.jsx
"use client";

import { useEffect } from "react";
import Image from "next/image";
import { TbX } from "react-icons/tb";

export default function MediaLibraryModal({ isOpen, onClose, onSelect }) {
  // Példaképpen néhány statikus kép (később ez jöhet adatbázisból vagy Supabase-ből)
  const images = [
    "/termekkepek/1.jpg",
    "/termekkepek/2.jpg",
    "/termekkepek/3.jpg",
  ];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-1 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full h-[80vh] overflow-hidden flex flex-col relative">
        <button onClick={onClose} className="absolute top-4 right-4">
          <TbX className="w-6 h-6 text-gray-600" />
        </button>

        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Médiatár</h2>
          <button className="text-sm text-[var(--pink)] underline">Kép feltöltése</button>
        </div>

        {/* Search */}
        <div className="p-4">
          <input
            type="text"
            placeholder="Keresés"
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>

        {/* Image grid */}
        <div className="flex-1 overflow-auto p-4 grid grid-cols-3 gap-4">
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
      </div>
    </div>
  );
}
