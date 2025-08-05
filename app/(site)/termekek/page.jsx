import { createClient } from "@/utils/supabase/server";
import Breadcrumbs from "@/app/components/UI/Breadcrumbs";
import ProductInfoPanel from "@/app/components/ProductInfoPanel";
import UpsaleProducts from "@/app/components/UpsaleProducts";
import ProductListItem from "@/app/components/UI/ProductListItem";
import CategoryPageTexts from "@/app/components/CategoryPageTexts";
import FilterSection from "@/app/components/UI/FilterSection";
import Image from "next/image";
import Paragraph from "@/app/components/UI/Texts/Paragraph";
import { Suspense } from "react";

export default async function Page() {
  const supabase = await createClient();

  // Lekérdezzük, hogy ez egy termék-e
  const { data: products, error } = await supabase.from("products").select("*");

  return (
    <div className="w-full xl:pt-28 pt-20 xl:pb-8 pb-4 px-4 xl:px-12">
      <div className="flex flex-col lg:gap-8 gap-4">
        <Suspense fallback={null}>
          <Breadcrumbs />
        </Suspense>
        <CategoryPageTexts category={"Termékek"} />

        {/* Szűrő rész Suspense-ben */}
        <div className="flex flex-col sticky top-0 left-0 z-40 bg-white border-b border-[var(--border)] py-0 2xl:py-4">
          <Suspense fallback={<div>Betöltés...</div>}>
            <FilterSection />
          </Suspense>
        </div>
      </div>
      <div className="grid lg:grid-cols-5 grid-cols-2 mt-8 border-l border-t border-[var(--border)]">
        {products.map((p) => (
          <ProductListItem
            key={p.id}
            image={p.termekkep}
            focim={p.fo_cim}
            alcim={p.alcim}
            price={p.eladasi_ar_brutto}
            slug={p.seo_slug}
            category={p.kategoria}
          />
        ))}
      </div>
    </div>
  );
}
