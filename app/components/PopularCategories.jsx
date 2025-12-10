"use client";

import Link from "next/link";
import Image from "next/image";
import H3 from "./UI/Texts/H3";
import { TbArrowRight, TbCategory } from "react-icons/tb";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";


export default function PopularCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const supabase = createClient();
      // Fetch categories that have both an image and an icon, limit to 3
      const { data } = await supabase
        .from("product-categories")
        .select("id, nev, slug, kep, icon")
        .eq("kozzeteve", true)
        .not("kep", "is", null) // Only fetch if they have a cover image
        .limit(4); 
      
      if (data) {
        setCategories(data);
      }
      setLoading(false);
    };

    fetchCategories();
  }, []);

  if (loading) return null; // Or skeleton

  if (categories.length === 0) return null;

  return (
    <div className="flex flex-col gap-8 w-full py-16 px-4 xl:px-12 bg-gray-50">
      <div className="flex flex-nowrap items-center gap-4">
        <TbCategory className="text-[var(--pink)] w-10 h-10" />
        <H3>Népszerű kategóriák</H3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/termekek/${cat.slug}`}
            className="group relative h-64 w-full overflow-hidden rounded-2xl shadow-md transition-all hover:shadow-xl hover:-translate-y-1"
          >
            {/* Background Image */}
            <Image
              src={cat.kep || "/default.png"}
              alt={cat.nev}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            
            {/* Overlay - same style as MainCategories */}
            <div className="absolute inset-0 bg-[var(--black)]/40 duration-300" />

            {/* Content (Icon + Text + Arrow) - same layout as MainCategories */}
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
                <span className="text-xl font-bold text-white tracking-wide">
                  {cat.nev}
                </span>
                 {/* Chevron / Arrow indicator that appears on hover */}
                 <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-xl translate-x-[-10px] group-hover:translate-x-0 duration-300">
                    <TbArrowRight />
                 </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
