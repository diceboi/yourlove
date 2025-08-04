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

export default async function Page({ params }) {
  const { slugSegments } = await params
  const productSlug = slugSegments[slugSegments.length - 1];

  const supabase = await createClient();

  // Lekérdezzük, hogy ez egy termék-e
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("seo_slug", productSlug)
    .single();

  const { data: freeshippingRows, error: freeshippingError } = await supabase
    .from("free_shipping_limit")
    .select("ertek")
    .limit(1);

  const freeShippingLimit = freeshippingRows?.[0]?.ertek;

  console.log("FREE SHIPPING LIMIT:", freeShippingLimit);

  // Lekérdezzük azokat a termékeket, amelyek az ingyenes szállítás határa alatt vannak
  const { data: productsUnderFreeShipping, error: underError } = await supabase
    .from("products")
    .select("*")
    .lt("eladasi_ar_brutto", freeShippingLimit); // itt használj lt = less than

  if (product) {
    // 🟢 TERMÉKOLDAL nézet
    return (
      <div className="w-full xl:pt-28 pt-20 xl:pb-8 pb-4 px-4 xl:px-12">
        <div className="flex flex-col lg:gap-8 gap-4">
          <Breadcrumbs />
          <div className=" flex lg:flex-row flex-col lg:gap-8 gap-4 ">
            <div className="flex lg:flex-row flex-col lg:gap-32 gap-8 w-full">
              <div className="flex flex-col lg:gap-16 gap-8 lg:w-2/3 w-full">
                <div className="flex lg:flex-row flex-col-reverse gap-4 w-full">
                  <div className="flex lg:flex-col flex-wrap gap-2">
                    <div className="relative lg:w-[75px] lg:h-[75px] w-[50px] h-[50px] border border-[var(--border)] hover:border-[var(--black)] rounded-md overflow-hidden cursor-pointer">
                      <Image
                        src="/termekkepek/2.jpg"
                        fill
                        style={{ objectFit: "cover", objectPosition: "center" }}
                        alt="123"
                      />
                    </div>
                    <div className="relative lg:w-[75px] lg:h-[75px] w-[50px] h-[50px] border border-[var(--border)] hover:border-[var(--black)] rounded-md overflow-hidden cursor-pointer">
                      <Image
                        src="/termekkepek/2.jpg"
                        fill
                        style={{ objectFit: "cover", objectPosition: "center" }}
                        alt="123"
                      />
                    </div>
                    <div className="relative lg:w-[75px] lg:h-[75px] w-[50px] h-[50px] border border-[var(--border)] hover:border-[var(--black)] rounded-md overflow-hidden cursor-pointer">
                      <Image
                        src="/termekkepek/2.jpg"
                        fill
                        style={{ objectFit: "cover", objectPosition: "center" }}
                        alt="123"
                      />
                    </div>
                    <div className="relative lg:w-[75px] lg:h-[75px] w-[50px] h-[50px] border border-[var(--border)] hover:border-[var(--black)] rounded-md overflow-hidden cursor-pointer">
                      <Image
                        src="/termekkepek/2.jpg"
                        fill
                        style={{ objectFit: "cover", objectPosition: "center" }}
                        alt="123"
                      />
                    </div>
                    <div className="relative lg:w-[75px] lg:h-[75px] w-[50px] h-[50px] border border-[var(--border)] hover:border-[var(--black)] rounded-md overflow-hidden cursor-pointer">
                      <Image
                        src="/termekkepek/2.jpg"
                        fill
                        style={{ objectFit: "cover", objectPosition: "center" }}
                        alt="123"
                      />
                    </div>
                    <div className="relative lg:w-[75px] lg:h-[75px] w-[50px] h-[50px] border border-[var(--border)] hover:border-[var(--black)] rounded-md overflow-hidden cursor-pointer">
                      <Image
                        src="/termekkepek/2.jpg"
                        fill
                        style={{ objectFit: "cover", objectPosition: "center" }}
                        alt="123"
                      />
                    </div>
                  </div>
                  <div className="relative w-full lg:h-[70vh] h-[40vh]">
                    <Image
                      src={product.termekkep}
                      fill
                      style={{ objectFit: "contain", objectPosition: "center" }}
                      alt="123"
                    />
                  </div>
                </div>
                <div className="block lg:hidden">
                  <ProductInfoPanel product={product} />
                </div>
                <div className="flex flex-col gap-4">
                  <Paragraph>
                    Egy masszírozó az S-Hande márkától, amely egy tengernyi
                    élvezetet nyújt! A Ribbon Pro Red Rose 9 rezgési móddal
                    rendelkezik, amelyek a G-pont és a csikló stimulálására
                    szolgálnak. Különleges formájának és rugalmas kialakításának
                    köszönhetően a készülék egyszerre képes hüvelyi és csikló
                    stimulációt nyújtani. A szexjáték testbarát, puha
                    szilikonból készült, amely biztosítja a bőrrel való gyengéd
                    érintkezést.
                  </Paragraph>
                </div>
                <UpsaleProducts products={productsUnderFreeShipping} />
              </div>
              <div className="hidden lg:block relative lg:w-1/3 w-full">
                <ProductInfoPanel product={product} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    // 🔵 KATEGÓRIAOLDAL nézet
    const categoryQuery = slugSegments.join(">");
    const { data: products } = await supabase
      .from("products")
      .select("*")
      .ilike("kategoria", `%${categoryQuery}%`);

    return (
      <div className="w-full xl:pt-28 pt-20 xl:pb-8 pb-4 px-4 xl:px-12">
        <div className="flex flex-col lg:gap-8 gap-4">
          <Breadcrumbs />
          <CategoryPageTexts category={categoryQuery} />

          {/* Szűrő rész Suspense-ben */}
          <div className="flex flex-col sticky top-0 left-0 z-40 bg-white border-b border-[var(--border)] py-0 2xl:py-4">
            <Suspense fallback={<div>Betöltés...</div>}>
              <FilterSection />
            </Suspense>
          </div>
        </div>
        <div className="grid lg:grid-cols-4 grid-cols-2 gap-4 mt-8">
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
}
