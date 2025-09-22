"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FilterArrange from "@/app/components/UI/FilterArrange";
import FilterColor from "@/app/components/UI/FilterColor";
import FilterChipButton from "@/app/components/UI/Buttons/FilterChipButton";

export default function FilterSection({slug}) {
  const [selectedCategory, setSelectedCategory] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedColor = searchParams.get("color") || "";
  const selectedSort = searchParams.get("arrange") || "";

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

      <div
        className={`flex flex-row flex-wrap gap-2 ${
          selectedColor || selectedSort ? "py-2" : "py-0"
        }`}
      >
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
