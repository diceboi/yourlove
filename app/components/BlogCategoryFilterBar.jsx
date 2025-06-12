'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';

const categories = [
  { key: 'osszes', label: 'Összes' },
  { key: 'termek-tesztek', label: 'Termék tesztek' },
  { key: 'tortenetek', label: 'Történetek' },
  { key: 'tippek', label: 'Tippek' },
  { key: 'egyeb', label: 'Egyéb' },
];

export default function CategoryFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category') || 'osszes';

  const handleCategoryClick = (key) => {
    router.push(`/blog?category=${key}`);
  };

  return (
    <div className="flex gap-2 justify-center items-center flex-wrap z-10 bg-white p-1 rounded-3xl border border-[var(--border)]">
      {categories.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => handleCategoryClick(key)}
          className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer 
            ${currentCategory === key ? 'bg-[var(--pink)] text-white' : 'bg-white hover:bg-[var(--grey-bg)]'} 
            transition duration-200`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
