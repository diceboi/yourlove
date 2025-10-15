// app/(site)/termekek/page.jsx
import { createClient } from "@/utils/supabase/server";
import Breadcrumbs from "@/app/components/UI/Breadcrumbs";
import ProductListItem from "@/app/components/UI/ProductListItem";
import CategoryPageTexts from "@/app/components/CategoryPageTexts";
import FilterSection from "@/app/components/UI/FilterSection";
import FilterDrawerProvider from '@/app/components/filter/FilterDrawerProvider'
import FilterDrawer from '@/app/components/filter/FilterDrawer'
import FilterToggleButton from '@/app/components/filter/FilterToggleButton'
import { Suspense } from "react";

export default async function Page({ searchParams }) {
  const supabase = await createClient();
  const sp = await searchParams;

  // helper a query paramokhoz (Next hozhat tömböt is)
  const get = (k) => {
    const v = sp?.[k];
    return Array.isArray(v) ? v[0] : (v ?? "");
  };

  // Query paramok
  const arrange      = get("arrange");
  const color        = get("color");
  const childSlug    = get("category");     // opcionális: konkrét kategória slug
  const stock        = get("stock");
  const warranty     = get("warranty");
  const priceRange   = get("pricerange");
  const size         = get("size");
  const weightrange  = get("weightrange");
  const material     = get("material");
  const charging     = get("charging");
  const chargingtime = get("chargingtime");
  const noise        = get("noise");
  const waterproof   = get("waterproof");
  const usetime      = get("usetime");
  const modes        = get("modes");
  const speed        = get("speed");
  const controll     = get("controll");
  const app          = get("app");

  // 1) (Publikált) termékek felhozása – itt inkább "bő" lekérés, majd JS szűrés
  
const { data, error } = await supabase
  .from("products")
  .select("*")
  .eq("kozzeteve", true)
  .limit(1000);

  if (error) {
  console.error("Supabase products error:", error);
}

const allPublished = Array.isArray(data) ? data : [];

  // 2) Ha kategória slug érkezett, feloldjuk id-vé
  let categoryId = null;
  if (childSlug) {
    const { data: cat } = await supabase
      .from("product-categories")
      .select("id, slug")
      .eq("slug", String(childSlug).toLowerCase())
      .maybeSingle();
    categoryId = cat?.id ?? null;
  }

  // 3) JS szűrés
  let products = allPublished.filter((p) => {
    // Kategória szűrés (kategoria = JSON-string, pl. [[1,2],[3,7]])
    if (categoryId) {
      try {
        const paths = JSON.parse(p.kategoria);
        const inCat =
          Array.isArray(paths) &&
          paths.some((path) => Array.isArray(path) && path.includes(categoryId));
        if (!inCat) return false;
      } catch {
        return false;
      }
    }

    // A lenti szűrők csak akkor szűrnek, ha van paraméter és van ilyen mező a rekordban
    if (color && p.szin && String(p.szin).toLowerCase() !== color.toLowerCase()) return false;
    if (stock && p.keszlet && String(p.keszlet).toLowerCase() !== stock.toLowerCase()) return false;
    if (warranty && p.garancia && String(p.garancia).toLowerCase() !== warranty.toLowerCase()) return false;
    if (size && p.meret && String(p.meret).toLowerCase() !== size.toLowerCase()) return false;
    if (weightrange && p.suly && String(p.suly).toLowerCase() !== weightrange.toLowerCase()) return false;
    if (material && p.anyag && String(p.anyag).toLowerCase() !== material.toLowerCase()) return false;
    if (charging && p.toltes_tipus && String(p.toltes_tipus).toLowerCase() !== charging.toLowerCase()) return false;
    if (chargingtime && p.toltesi_ido && String(p.toltesi_ido).toLowerCase() !== chargingtime.toLowerCase()) return false;
    if (noise && p.zajszint && String(p.zajszint).toLowerCase() !== noise.toLowerCase()) return false;
    if (waterproof && p.vizallosag && String(p.vizallosag).toLowerCase() !== waterproof.toLowerCase()) return false;
    if (usetime && p.hasznalati_ido && String(p.hasznalati_ido).toLowerCase() !== usetime.toLowerCase()) return false;
    if (modes && p.modok && String(p.modok).toLowerCase() !== modes.toLowerCase()) return false;
    if (speed && p.sebesseg && String(p.sebesseg).toLowerCase() !== speed.toLowerCase()) return false;
    if (controll && p.iranyitas && String(p.iranyitas).toLowerCase() !== controll.toLowerCase()) return false;

    if (app) {
      // "true"/"false" → boolean összevetés, ha a mező boolean
      const want = app === "true";
      if (typeof p.app === "boolean" && p.app !== want) return false;
      // ha stringként tárolod:
      if (typeof p.app === "string" && (p.app.toLowerCase() === "true") !== want) return false;
    }

    // Ár sáv (egyszerű minta: "0-to-10000" | "10000+")
    if (priceRange) {
      const price = Number(p.eladasi_ar_brutto ?? 0);
      if (priceRange.includes("-to-")) {
        const [min, max] = priceRange.split("-to-").map((n) => Number(n));
        if (Number.isFinite(min) && price < min) return false;
        if (Number.isFinite(max) && price > max) return false;
      } else if (priceRange.endsWith("+")) {
        const min = Number(priceRange.replace("+", ""));
        if (Number.isFinite(min) && price < min) return false;
      }
    }

    return true;
  });

  // 4) Rendezés
  if (arrange === "price-low-to-high") {
    products.sort((a, b) => (a.eladasi_ar_brutto ?? 0) - (b.eladasi_ar_brutto ?? 0));
  } else if (arrange === "price-high-to-low") {
    products.sort((a, b) => (b.eladasi_ar_brutto ?? 0) - (a.eladasi_ar_brutto ?? 0));
  } else if (arrange === "newest") {
    products.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  } else if (arrange === "rating") {
    // ha lesz értékelés meződ, itt rendezd
  } else if (arrange === "popular") {
    // ha van kattintás/nézettség meződ, itt rendezd
  }

  return (
    <div className="w-full xl:pt-28 pt-20 xl:pb-8 pb-4 px-4 xl:px-12">
      <div className="flex flex-col lg:gap-8 gap-4">
        <Suspense fallback={null}>
          <Breadcrumbs />
        </Suspense>

        <CategoryPageTexts category={"Termékek"} />

        {/* Szűrők – slug nélkül vagyunk, így a FilterSection hozhatja az ÖSSZES filtert */}
        <div className="flex flex-col sticky top-0 left-0 z-10 bg-white border-b border-[var(--border)] py-0 2xl:py-4">
          <Suspense fallback={<div>Betöltés...</div>}>
            <FilterSection />
          </Suspense>
        </div>
      </div>

      <div className="flex lg:flex-row flex-col gap-16">
        <FilterDrawerProvider>
          {/* mobil felső sor: csak a gomb */}
          <div className="flex items-center justify-end md:hidden mt-4">
            <FilterToggleButton />
          </div>
  
          <div className="mt-4 flex gap-6">
            {/* DESKTOP oldalsáv */}
            <div className="hidden md:block w-64 shrink-0">
              <Suspense fallback={<div>Betöltés...</div>}>
                <FilterSection />
              </Suspense>
            </div>
  
            {/* TERMÉK RÁCS */}
            <div className="flex-1">
              <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-4">
                {/* ... ProductListItem map (nálad már megvan) ... */}
              </div>
            </div>
          </div>
  
          {/* MOBIL DRAWER tartalma (ugyanaz a FilterSection) */}
          <FilterDrawer>
            <FilterSection />
          </FilterDrawer>
        </FilterDrawerProvider>

        <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 mt-8 gap-4">
          {products.map((p) => (
            <ProductListItem
              key={p.id}
              id={p.id}
              image={p.termekkep || "/default.png"}
              focim={p.fo_cim}
              alcim={p.alcim}
              price={p.eladasi_ar_brutto}
              slug={p.seo_slug}
              category={p.kategoria}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
