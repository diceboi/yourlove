"use client";

import { useEffect, useState } from "react";
import { TbSearch } from "react-icons/tb"; // vagy bármelyik ikonlib, amit használsz
import { AnimatePresence, motion } from "framer-motion";
import Paragraph from "./UI/Texts/MenuText";
import Label from "./UI/Texts/Label";

const placeholders = [
  "Műpénisz...",
  "Análgyöngysor...",
  "Sikosító...",
  "Műpunci...",
];

export default function SearchBarDesktop() {
  const [placeholder, setPlaceholder] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [searchBarOpen, setSearchBarOpen] = useState(false);

  useEffect(() => {
    const currentText = placeholders[currentIndex];
    const timeout = setTimeout(
      () => {
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
      },
      deleting ? 50 : 100
    );

    return () => clearTimeout(timeout);
  }, [charIndex, deleting, currentIndex]);

  return (
    <>
      <div className="relative w-full mx-auto">
        <input
          type="text"
          placeholder={placeholder}
          onFocus={() => setSearchBarOpen(true)}
          onBlur={() => setSearchBarOpen(false)}
          className="xl:min-w-[500px] min-w-full py-3 pl-6 pr-10 text-gray-800 bg-gray-100 rounded-full outline-none"
        />
        <TbSearch
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--pink)]"
          size={20}
        />
      </div>

      {searchBarOpen && (
      <div className="fixed top-0 left-0 w-full h-full bg-[#00000080] z-50">
        <div className="relative flex flex-col gap-4 w-full max-w-full xl:max-w-fit left-0 xl:left-62 bg-white xl:mt-2 mt-0 xl:pt-2 pt-8 xl:px-2 px-4 pb-4 xl:rounded-lg rounded-none">
          <div className="relative lg:min-w-[500px] min-w-[300px]">
            <input
              type="text"
              placeholder={placeholder}
              className="w-full py-3 pl-6 pr-10 text-gray-800 bg-gray-100 rounded-full outline-1 outline-[var(--border)]"
            />
            <TbSearch
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--pink)]"
              size={20}
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-0">
              <Paragraph classname={"font-normal text-[var(--tertiary-text)]"}>Legutóbbi keresések:</Paragraph>
            </div>
            <div className="flex flex-auto gap-2">
              <Paragraph classname={"font-normal text-[var(--tertiary-text)] px-2 py-1 rounded-full bg-[var(--cream-pink)]"}>Vibrátor</Paragraph>
              <Paragraph classname={"font-normal text-[var(--tertiary-text)] px-2 py-1 rounded-full bg-[var(--cream-pink)]"}>Vibrátor</Paragraph>
              <Paragraph classname={"font-normal text-[var(--tertiary-text)] px-2 py-1 rounded-full bg-[var(--cream-pink)]"}>Vibrátor</Paragraph>
              <Paragraph classname={"font-normal text-[var(--tertiary-text)] px-2 py-1 rounded-full bg-[var(--cream-pink)]"}>Vibrátor</Paragraph>
            </div>
          </div>
        </div>
      </div>
      )}
    </>
  );
}
