"use client";

import Link from "next/link";
import Image from "next/image";
import H3 from "./UI/Texts/H3";
import { TbCategory } from "react-icons/tb";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { TbArrowRight } from "react-icons/tb";

export default function MainCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const supabase = createClient();
      // Fetch top-level categories (szulo is null or 0)
      const { data } = await supabase
        .from("product-categories")
        .select("id, nev, slug, kep, icon")
        .eq("kozzeteve", true)
        .or("szulo.is.null,szulo.eq.0")
        .not("kep", "is", null) // Only fetch if they have a cover image
        .limit(5); // Fetch enough for a nice grid
      
      if (data) {
        setCategories(data);
      }
      setLoading(false);
    };

    fetchCategories();
  }, []);

  if (loading) return <div className="min-h-[400px]" />; // Spacer while loading
  if (categories.length === 0) return null;

  return (
    <div className="w-full py-16 px-4 xl:px-12">
      <div className="flex flex-nowrap items-center gap-4 mb-8">
        <TbCategory className="text-[var(--pink)] w-10 h-10" />
        <H3>Fő kategóriák</H3>
      </div>

      {/* Bento Grid Layout - Adaptive based on count */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[250px]">
        
        {categories.map((cat, index) => {
           // First item: Large square (2x2) on desktop
           const isFirst = index === 0;
           // Second item: Wide (2x1) if we have enough items? Or just keep it interesting.
           // Let's do:
           // 0: col-span-2 row-span-2 (Large Primary)
           // 1: col-span-2 row-span-1 (Wide Secondary)
           // 2: col-span-1 row-span-1 (Small)
           // 3: col-span-1 row-span-1 (Small)
           
           let gridClass = "md:col-span-1 md:row-span-1";
           
           if (index === 0) {
              gridClass = "md:col-span-2 md:row-span-2";
           } else if (index === 1) {
              gridClass = "md:col-span-2 md:row-span-1";
           }

           return (
            <Link
                key={cat.id}
                href={`/termekek/${cat.slug}`}
                className={`group relative w-full h-full overflow-hidden rounded-3xl shadow-sm hover:shadow-xl transition-all ${gridClass}`}
            >
                {/* Background Image */}
                <Image
                src={cat.kep || "/default.png"}
                alt={cat.nev}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-[var(--black)]/40 duration-300" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 p-6 w-full">
                    <div className="flex items-center gap-3 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        {cat.icon && (
                            <div className="relative w-8 h-8">
                                <Image
                                    src={cat.icon}
                                    alt=""
                                    fill
                                    className="object-contain brightness-0 invert" 
                                />
                            </div>
                        )}
                        <span className={`font-bold text-white tracking-wide ${isFirst ? 'text-3xl' : 'text-xl'}`}>
                            {cat.nev}
                        </span>
                         {/* Chevron / Arrow indicator that appears on hover */}
                         <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-xl translate-x-[-10px] group-hover:translate-x-0 duration-300">
                            <TbArrowRight />
                         </div>
                    </div>
                </div>
            </Link>
           );
        })}
      </div>
    </div>
  );
}
