"use client";

import { useState } from "react";
import { TbChevronDown, TbChevronUp } from "react-icons/tb";
import H3 from "../UI/Texts/H3";

export default function ProductFAQ({ items = [] }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  if (!items.length) return null;

  return (
    <div className="space-y-4">
      <H3>Gyakran ismételt kérdések</H3>

      <div className="flex flex-col">
        {items.map((faq, i) => (
          <div key={i} className="py-3  border-b border-[var(--border)]">
            <button
              onClick={() => toggle(i)}
              className="w-full flex justify-between items-center text-left"
            >
              <span className="text-base font-medium">{faq.q}</span>
              {openIndex === i ? (
                <TbChevronUp className="text-xl" />
              ) : (
                <TbChevronDown className="text-xl" />
              )}
            </button>

            {openIndex === i && (
              <div className="mt-2 text-[var(--secondary-text)] leading-relaxed">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
