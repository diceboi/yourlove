"use client";

import { useEffect, useRef, useState } from "react";
import BlackBorderButton from "@/app/components/UI/Buttons/BlackBorderButton";
import Label from "./Texts/Label";
import PinkButton from "./Buttons/PinkButton";

export default function FilterArrange({ label, options, onChange }) {
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
        buttonicon={isOpen ? 'TbChevronUp' : 'TbChevronDown'}
        onclick={() => setIsOpen(!isOpen)}
      />

      {isOpen && (
        <ul className="absolute z-20 w-full min-w-[200px] mt-1 p-2 bg-white border border-[var(--border)] rounded-xl overflow-hidden">
          {options.map((option) => (
            <li
              key={option.value}
              onClick={() => handleSelect(option)}
              className="px-2 py-2 hover:bg-[var(--grey-bg)] rounded-lg cursor-pointer"
            >
              <Label>{option.label}</Label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
