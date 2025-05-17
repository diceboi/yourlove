'use client';

import { useState } from 'react';
import Image from 'next/image';

const languages = [
  { code: 'hu', name: 'Magyar', flag: '/flags/hu.png' },
  { code: 'en', name: 'English', flag: '/flags/uk.png' },
];

export default function LanguageSelect() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(languages[0]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-[44px] h-[44px] rounded-full hover:bg-[var(--border)] flex items-center justify-center cursor-pointer"
      >
        <Image src={selected.flag} alt={selected.code} width={20} height={20} className="w-5 h-5 object-cover rounded-full" />
      </button>

      {isOpen && (
        <ul className="absolute right-0 mt-2 bg-white shadow-lg rounded-md py-1 z-50 w-32">
          {languages.map((lang) => (
            <li
              key={lang.code}
              className="flex items-center gap-2 px-4 py-2 hover:bg-[var(--border)] cursor-pointer"
              onClick={() => {
                setSelected(lang);
                setIsOpen(false);
                // TODO: Tényleges nyelvváltás pl. router push vagy i18n hook
              }}
            >
              <img src={lang.flag} alt={lang.code} className="w-4 h-4 rounded-full" />
              <span className="text-sm">{lang.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
