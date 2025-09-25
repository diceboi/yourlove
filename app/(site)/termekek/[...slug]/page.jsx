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

function pathIncludesId(kategoriaJson, id) {
  try {
    const paths = JSON.parse(kategoriaJson);
    return Array.isArray(paths) && paths.some((p) => Array.isArray(p) && p.includes(id));
  } catch {
    return false;
  }
}

export default async function Page({ params, searchParams }) {
  const { slug } = await params;                           // [...slug]
  const sp = await searchParams;
  const productSlug = slug[slug.length - 1];
  const leaf = slug?.[slug.length - 1];              // utolsó szegmens
  const supabase = await createClient();

  // --- Termék oldal? ---
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("seo_slug", leaf)
    .maybeSingle();

  // Közös: ingyenes szállítás határ + upsell
  const { data: freeshippingRows } = await supabase
    .from("free_shipping_limit")
    .select("ertek")
    .limit(1);
  const freeShippingLimit = freeshippingRows?.[0]?.ertek;

  const { data: productsUnderFreeShipping = [] } = await supabase
    .from("products")
    .select("*")
    .lt("eladasi_ar_brutto", freeShippingLimit ?? 9_999_999);

  if (product) {
    // 🟢 TERMÉKOLDAL
    return (
      <div className="w-full xl:pt-28 pt-20 xl:pb-8 pb-4 px-4 xl:px-12">
        <div className="flex flex-col lg:gap-8 gap-4">
          <Suspense fallback={null}>
            <Breadcrumbs />
          </Suspense>

          <div className="flex lg:flex-row flex-col lg:gap-8 gap-4">
            <div className="flex lg:flex-row flex-col lg:gap-32 gap-8 w-full">
              <div className="flex flex-col lg:gap-16 gap-8 lg:w-2/3 w-full">
                {/* képgaléria (rövidített) */}
                <div className="flex lg:flex-row flex-col-reverse gap-4 w-full">
                  {/* ...thumbok... */}
                  <div className="relative w-full lg:h-[70vh] h-[40vh]">
                    <Image
                      src={product.termekkep}
                      fill
                      style={{ objectFit: "contain", objectPosition: "center" }}
                      alt={product.fo_cim || "Termék kép"}
                    />
                  </div>
                </div>

                <div className="block lg:hidden">
                  <ProductInfoPanel product={product} />
                </div>

                <div className="flex flex-col gap-4">
                  <Paragraph>
                    {/* ide jöhet a leírás / content */}
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
  }

  // 🔵 KATEGÓRIA/ARCHÍV NÉZET
  // 1) Szülő kategória a leaf slug alapján
  const { data: category } = await supabase
    .from("product-categories")
    .select("id, nev, slug, szulo, kep, leiras_fent, leiras_lent, kozzeteve")
    .eq("slug", String(leaf).toLowerCase())
    .maybeSingle();

  if (!category) {
    return (
      <div className="w-full xl:pt-28 pt-20 px-4 xl:px-12">
        <div className="text-sm text-gray-500 py-8">Kategória nem található.</div>
      </div>
    );
  }

  // 2) Szűrők (query stringből)
  const get = (k) => {
 const v = sp?.[k];
 return Array.isArray(v) ? v[0] : (v ?? "");
  };
  const arrange      = get("arrange");
  const color        = get("color");
  const childSlug    = get("category");
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

  // 3) Dinamikus query építése – amit lehet, a DB-ben szűrünk
  let q = supabase
    .from("products")
    .select(
      "id, fo_cim, alcim, eladasi_ar_brutto, seo_slug, termekkep, kategoria, kozzeteve, szin, meretek, suly, anyag, toltes, toltesi_ido, zajszint, vizallosag, hasznalati_ido, vibracios_modok, sebessegfokozatok, vezerles, applikacio, garancia, keszlet, created_at"
    )
    .eq("kozzeteve", true);

  const ilike = (col, val) => {
    if (val) q = q.ilike(col, `%${val}%`);
  };

  ilike("szin", color);
  ilike("anyag", material);
  ilike("meretek", size);
  ilike("suly", weightrange);
  ilike("toltes", charging);
  ilike("toltesi_ido", chargingtime);
  ilike("zajszint", noise);
  ilike("vizallosag", waterproof);
  ilike("hasznalati_ido", usetime);
  ilike("vibracios_modok", modes);
  ilike("sebessegfokozatok", speed);
  ilike("vezerles", controll);
  ilike("applikacio", app);

  // garancia "1-year" -> tartalmazza az 1-et
  if (warranty) {
    const m = String(warranty).match(/(\d+)/);
    if (m) q = q.ilike("garancia", `%${m[1]}%`);
    else q = q.ilike("garancia", `%${warranty}%`);
  }

  // készlet
  if (stock === "instock") q = q.gt("keszlet", 0);
  else if (stock === "out-of-stock") q = q.eq("keszlet", 0);
  // else if (stock === "backorder") q = q.eq("keszlet", -1); // ha így jelölöd

  // ár intervallum
  if (priceRange) {
    if (priceRange.includes("-")) {
      const [min, max] = priceRange.split("-").map((n) => Number(String(n).replace(/\D/g, "")));
      if (!Number.isNaN(min)) q = q.gte("eladasi_ar_brutto", min);
      if (!Number.isNaN(max)) q = q.lte("eladasi_ar_brutto", max);
    } else if (priceRange.endsWith("+")) {
      const n = Number(priceRange.replace("+", ""));
      if (!Number.isNaN(n)) q = q.gte("eladasi_ar_brutto", n);
    }
  }

  // rendezés
  if (arrange === "price-low-to-high") {
    q = q.order("eladasi_ar_brutto", { ascending: true });
  } else if (arrange === "price-high-to-low") {
    q = q.order("eladasi_ar_brutto", { ascending: false });
  } else if (arrange === "newest") {
    q = q.order("created_at", { ascending: false });
  } else {
    // default: relevancia/népszerűség oszlopodtól függően
    q = q.order("created_at", { ascending: false });
  }

  // 4) Lekérés
  const { data: prelim = [] } = await q.limit(2000);

  // 5) Kategóriafa szűrés (JSON-string útvonalak alapján)
  //    parent kötelező (ennek az oldalnak az alapja), child opcionális (category query param)
  let filtered = prelim.filter((p) => pathIncludesId(p.kategoria, category.id));

  if (childSlug) {
    const { data: childCat } = await supabase
      .from("product-categories")
      .select("id, slug")
      .eq("slug", String(childSlug).toLowerCase())
      .maybeSingle();

    if (childCat) {
      filtered = filtered.filter((p) => pathIncludesId(p.kategoria, childCat.id));
    } else {
      // ha a child slug nem létezik, üres lista
      filtered = [];
    }
  }

  return (
    <div className="w-full xl:pt-28 pt-20 xl:pb-8 pb-4 px-4 xl:px-12">
      <div className="flex flex-col lg:gap-8 gap-4">
        <Suspense fallback={null}>
          <Breadcrumbs />
        </Suspense>

        {/* Kategória szövegek */}
        <CategoryPageTexts category={category.nev} />

        {/* Szűrők – a tényleges parent slugot adjuk át */}
        <div className="flex flex-col sticky top-0 left-0 z-10 bg-white border-b border-[var(--border)] py-0 2xl:py-4">
          <Suspense fallback={<div>Betöltés...</div>}>
            <FilterSection slug={category.slug} />
          </Suspense>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 grid-cols-2 mt-8 border-l border-t border-[var(--border)]">
        {filtered.map((p) => (
          <ProductListItem
            key={p.id}
            image={p.termekkep || "/default.png"}
            focim={p.fo_cim}
            alcim={p.alcim}
            price={p.eladasi_ar_brutto}
            slug={p.seo_slug}
            category={p.kategoria}
          />
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full text-sm text-gray-500 p-6">
            Nincs találat a megadott szűrőkre.
          </div>
        )}
      </div>
    </div>
  );
}
