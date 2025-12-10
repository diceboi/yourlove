"use client";

import Link from "next/link";
import Image from "next/image";
import H3 from "./UI/Texts/H3";
import { TbCategory } from "react-icons/tb";

const categories = [
  { name: "Nőknek", slug: "noknek", image: "/icons/no.svg" },
  { name: "Férfiaknak", slug: "ferfiaknak", image: "/icons/ferfi.svg" },
  { name: "Pároknak", slug: "paroknak", image: "/icons/feher-emblema.svg" }, // Fallback to emblem
  { name: "Játékok", slug: "szexjatekok", image: "/icons/jatek.svg" },
  { name: "Drogéria", slug: "drogeria", image: "/icons/drogeria.svg" },
  { name: "Vibrátorok", slug: "vibratorok", image: "/icons/vibrator.svg" },
];

export default function PopularCategories() {
  return (
    <div className="flex flex-col gap-8 w-full py-16 px-4 xl:px-12 bg-gray-50">
      <div className="flex flex-nowrap items-center gap-4">
        <TbCategory className="text-[var(--pink)] w-10 h-10" />
        <H3>Népszerű kategóriák</H3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/termekek/${cat.slug}`}
            className="flex flex-col items-center gap-4 group p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
          >
            <div className="relative w-16 h-16 transition-transform group-hover:scale-110">
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-contain"
              />
            </div>
            <span className="font-semibold text-[var(--secondary-text)] group-hover:text-[var(--pink)] transition-colors">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
