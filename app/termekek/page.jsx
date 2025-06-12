"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import H2 from "@/app/components/UI/Texts/H2";
import Breadcrumbs from "@/app/components/UI/Breadcrumbs";
import FilterArrange from "@/app/components/UI/FilterArrange";
import Paragraph from "../components/UI/Texts/Paragraph";
import Label from "../components/UI/Texts/Label";
import H4 from "../components/UI/Texts/H4";
import FilterColor from "../components/UI/FilterColor";
import FilterChipButton from "../components/UI/Buttons/FilterChipButton";
import ProductListItem from "../components/UI/ProductListItem";

function FilterSection({ updateFilter }) {
  const searchParams = useSearchParams();

  const selectedColor = searchParams.get("color") || "";
  const selectedSort = searchParams.get("arrange") || "";

  return (
    <>
      <div className="flex flex-row gap-4 py-2">
        <FilterArrange
          label="Rendezés"
          options={[
            { label: "Ár szerint csökkenő", value: "price-low-to-high" },
            { label: "Ár szerint növekvő", value: "price-high-to-low" },
            { label: "Legújabb", value: "newest" },
            { label: "Értékelés", value: "rating" },
            { label: "Legnépszerűbb", value: "popular" },
            { label: "Legtöbbet keresett", value: "most-searched" },
          ]}
          onChange={(label) => updateFilter("arrange", label)}
        />
        <FilterColor
          label="Szín"
          options={[
            { label: "Piros", value: "red", color: "#dc2626" },
            { label: "Kék", value: "blue", color: "#2563eb" },
            { label: "Zöld", value: "green", color: "#16a34a" },
            { label: "Fekete", value: "black", color: "#000000" },
            { label: "Fehér", value: "white", color: "#ffffff" },
          ]}
          onChange={(label) => updateFilter("color", label)}
        />
      </div>

      <div className={`flex flex-row flex-wrap gap-2 ${selectedColor || selectedSort ? 'py-2' : 'py-0'}`}>
        {selectedSort && (
          <FilterChipButton 
            title={selectedSort}
            link={null}
            buttonicon={"TbX"}
            onclick={() => updateFilter("arrange", "")}
          />
        )}
        {selectedColor && (
          <FilterChipButton 
            title={selectedColor}
            link={null}
            buttonicon={"TbX"}
            onclick={() => updateFilter("color", "")}
          />
        )}
      </div>
    </>
  );
}

export default function Page() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const router = useRouter();

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(window.location.search);

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(`?${params.toString()}`);
  };

  return (
    <div className="w-full xl:pt-28 pt-20 xl:pb-8 pb-4 px-4 xl:px-12">
      <div className="flex flex-col lg:gap-8 gap-4">
        <Breadcrumbs />
        <H2>Termékek</H2>
        <Paragraph classname={"xl:w-8/12 w-full"}>
          Lorem ipsum dolor sit amet...
        </Paragraph>

        {/* Szűrő rész Suspense-ben */}
        <div className="flex flex-col sticky top-0 left-0 z-40 bg-white border-b border-[var(--border)] py-0 2xl:py-4">
          <Suspense fallback={<div>Betöltés...</div>}>
            <FilterSection updateFilter={updateFilter} />
          </Suspense>
        </div>

        {/* Termék lista */}
        <div className="grid lg:grid-cols-4 grid-cols-2 border-t border-l border-[var(--border)]">
          {Array.from({ length: 12 }).map((_, i) => (
            <ProductListItem key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
