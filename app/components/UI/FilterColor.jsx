"use client";

import { useEffect, useRef, useState } from "react";
import Label from "./Texts/Label";
import PinkButton from "./Buttons/PinkButton";

export default function FilterColor({ label, options, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const dropdownRef = useRef(null);

  const handleSelect = (option) => {
    setSelected(option);
    setIsOpen(false);
    onChange(option.value);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative inline-block">
      <PinkButton
        title={label}
        link={null}
        buttonicon={isOpen ? "TbChevronUp" : "TbChevronDown"}
        onclick={() => setIsOpen(!isOpen)}
      />

      {isOpen && (
        <div className="absolute grid grid-cols-2 p-2 z-20 min-w-[250px] mt-1 bg-white border border-[var(--border)] rounded-xl overflow-hidden shadow-lg">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => handleSelect(option)}
              className="px-2 py-2 flex items-center gap-2 hover:bg-[var(--grey-bg)] rounded-lg cursor-pointer"
            >
              <span
                className="min-w-8 min-h-8 rounded-full border border-gray-300"
                style={{ backgroundColor: option.color }}
              ></span>
              <Label>{option.label}</Label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
