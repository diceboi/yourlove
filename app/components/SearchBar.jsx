'use client';

import { useEffect, useState } from 'react';
import { TbSearch } from 'react-icons/tb'; // vagy bármelyik ikonlib, amit használsz

const placeholders = [
  'Műpénisz...',
  'Análgyöngysor...',
  'Sikosító...',
  'Műpunci...',
];

export default function SearchBar() {
  const [placeholder, setPlaceholder] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const currentText = placeholders[currentIndex];
    const timeout = setTimeout(() => {
      if (!deleting) {
        setPlaceholder(currentText.substring(0, charIndex + 1));
        setCharIndex((prev) => prev + 1);
        if (charIndex === currentText.length) {
          setDeleting(true);
        }
      } else {
        setPlaceholder(currentText.substring(0, charIndex - 1));
        setCharIndex((prev) => prev - 1);
        if (charIndex === 0) {
          setDeleting(false);
          setCurrentIndex((prev) => (prev + 1) % placeholders.length);
        }
      }
    }, deleting ? 50 : 100);

    return () => clearTimeout(timeout);
  }, [charIndex, deleting, currentIndex]);

  return (
    <div className="relative w-full mx-auto">
      <input
        type="text"
        placeholder={placeholder}
        className="lg:min-w-[500px] min-w-[300px] py-3 pl-6 pr-10 text-gray-800 bg-gray-100 rounded-full outline-none"
      />
      <TbSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--pink)]" size={20} />
    </div>
  );
}
