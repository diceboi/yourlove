"use client";

import { useState } from "react";
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

export default function Page() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(`?${params.toString()}`);
  };

  const selectedColor = searchParams.get("color") || "";
  const selectedSort = searchParams.get("arrange") || "";

  return (
    <div className="w-full xl:pt-28 pt-20 xl:pb-8 pb-4 px-4 xl:px-12">
      <div className="flex flex-col lg:gap-8 gap-4">
        <Breadcrumbs />
        <H2>Termékek</H2>
        <Paragraph classname={"xl:w-8/12 w-full"}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </Paragraph>
        {/* Szűrő */}
        <div className="flex flex-col sticky top-0 left-0 z-40 bg-white border-b border-[var(--border)] py-0 2xl:py-4">
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
          {/* Aktív szűrés megjelenítése */}
          <div className={`flex flex-row flex-wrap gap-2 ${selectedColor || selectedSort ? 'py-2':'py-0'}`}>
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
        </div>
        {/* Szűrt termékek megjelenítése */}
        <div className="grid lg:grid-cols-4 grid-cols-2 border-t border-l border-[var(--border)]">
            <ProductListItem />
            <ProductListItem />
            <ProductListItem />
            <ProductListItem />
            <ProductListItem />
            <ProductListItem />
            <ProductListItem />
            <ProductListItem />
            <ProductListItem />
            <ProductListItem />
            <ProductListItem />
            <ProductListItem />
        </div>
      </div>
    </div>
  );
}
