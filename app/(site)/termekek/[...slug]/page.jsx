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
  const { slug } = await params;
  const productSlug = slug[slug.length - 1];

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
          <Suspense fallback={null}>
            <Breadcrumbs />
          </Suspense>
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
    const categorySlug = productSlug;

  // 2) Kategória lekérése slug alapján
  const { data: category } = await supabase
    .from("product-categories")
    .select("id, nev, slug, szulo, kep, leiras_fent, leiras_lent, kozzeteve")
    .eq("slug", String(categorySlug).toLowerCase())
    .maybeSingle();

  if (!category) {
    // ha nincs ilyen kategória, dobhatsz 404-et is
    // return notFound();
    return (
      <div className="w-full xl:pt-28 pt-20 px-4 xl:px-12">
        <div className="text-sm text-gray-500 py-8">Kategória nem található.</div>
      </div>
    );
  }

  // 3) Termékek lekérése és SZERVER oldali szűrése a kategória id-re
  //    (a products.kategoria JSON-string pályáiban szerepel-e a category.id)
  //    Ha sok terméked van, érdemes később JSONB-re váltani és SQL-ben szűrni.
  const { data: allPublished = [] } = await supabase
    .from("products")
    .select("id, fo_cim, alcim, eladasi_ar_brutto, seo_slug, termekkep, kategoria, kozzeteve")
    .eq("kozzeteve", true)
    .limit(1000); // finomhangold / pagináld igény szerint

  const products = (allPublished || []).filter((p) => {
    try {
      const paths = JSON.parse(p.kategoria); // elvárt: [[1,2],[3,7], ...]
      return Array.isArray(paths) && paths.some((path) => Array.isArray(path) && path.includes(category.id));
    } catch {
      return false;
    }
  });

  // (opcionális) ha üres: itt dönthetsz, hogy 404 vagy üres lista
  // if (products.length === 0) return notFound();

  return (
    <div className="w-full xl:pt-28 pt-20 xl:pb-8 pb-4 px-4 xl:px-12">
      <div className="flex flex-col lg:gap-8 gap-4">
        <Suspense fallback={null}>
          <Breadcrumbs />
        </Suspense>

        {/* Kategória leírások – a komponensedet állítsd át, hogy fogadja az objektumot is */}
        <CategoryPageTexts category={category.nev} />

        {/* Szűrő */}
        <div className="flex flex-col sticky top-0 left-0 z-10 bg-white border-b border-[var(--border)] py-0 2xl:py-4">
          <Suspense fallback={<div>Betöltés...</div>}>
            <FilterSection slug={productSlug}/>
          </Suspense>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 grid-cols-2 mt-8 border-l border-t border-[var(--border)]">
        {products.map((p) => (
          <ProductListItem
            key={p.id}
            image={p.termekkep || "/default.png"}
            focim={p.fo_cim}
            alcim={p.alcim}
            price={p.eladasi_ar_brutto}
            slug={p.seo_slug}
            category={p.kategoria} // ha a komponensnek kell
          />
        ))}
      </div>
    </div>
  );
}}