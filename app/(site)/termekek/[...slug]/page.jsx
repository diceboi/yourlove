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
import FilterDrawerProvider from '@/app/components/filter/FilterDrawerProvider'
import FilterDrawer from '@/app/components/filter/FilterDrawer'
import FilterToggleButton from '@/app/components/filter/FilterToggleButton'
import ButtonText from "@/app/components/UI/Texts/ButtonText";
import ProductsInfinite from "@/app/components/products/ProductsInfinite";
import ProductsPaginated from "@/app/components/products/ProductsPaginated";
import Link from 'next/link'
import ProductImageGallerySwiper from "@/app/components/ProductImageGallerySwiper";
import ProductFAQ from "@/app/components/products/ProductFAQ";
import H3 from "@/app/components/UI/Texts/H3";


/* ---------- Segédfüggvények ---------- */

function safeParseJSON(s) {
  try { return JSON.parse(s) } catch { return null }
}

function parseGyikString(gyikStr) {
  if (!gyikStr || typeof gyikStr !== "string") return [];

  // split pontosvesszőkre
  const parts = gyikStr
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const items = [];
  for (let i = 0; i < parts.length; i += 2) {
    const q = parts[i];
    const a = parts[i + 1];
    if (q && a) {
      items.push({ q, a });
    }
  }
  return items;
}

// a products.kategoria (string JSON) -> ID útvonalak tömbje
function getCategoryPathsFromProduct(product) {
  const raw = product?.kategoria;
  const parsed = typeof raw === "string" ? safeParseJSON(raw) : raw;
  return Array.isArray(parsed) ? parsed.filter((p) => Array.isArray(p) && p.length) : [];
}

// Válaszd ki a "legjobb" útvonalat:
// - ha van currentCategoryId (kategória oldal), azt tartalmazó útvonalat részesítjük előnyben
// - különben a leghosszabbat (legmélyebb kategória)
function pickBestPath(paths, currentCategoryId = null) {
  if (!paths.length) return null;
  if (currentCategoryId != null) {
    const withCurrent = paths.filter((p) => p.includes(currentCategoryId));
    if (withCurrent.length) return withCurrent.sort((a, b) => b.length - a.length)[0];
  }
  return paths.slice().sort((a, b) => b.length - a.length)[0];
}

// ID útvonal -> slug útvonal (és név breadcrumbhoz)
function idsPathToSlugsAndNames(idsPath, catsById) {
  const slugs = [];
  const names = [];
  for (const id of idsPath || []) {
    const c = catsById.get(id);
    if (!c) continue;
    slugs.push(c.slug);
    names.push(c.nev);
  }
  return { slugs, names };
}

// ellenőrzés a kategóriafa ID-k alapján
function pathIncludesId(kategoriaJson, id) {
  try {
    const paths = JSON.parse(kategoriaJson);
    return Array.isArray(paths) && paths.some((p) => Array.isArray(p) && p.includes(id));
  } catch {
    return false;
  }
}

// Breadcrumbs trail építése kategória oldalra (szülőlánc alapján)
function buildCategoryTrail(current, catsById) {
  const chain = [];
  let c = current;
  while (c) {
    chain.push(c);
    c = c.szulo ? catsById.get(c.szulo) : null;
  }
  chain.reverse();
  return chain.map((c, i) => ({
    label: c.nev,
    href: `/termekek/${chain.slice(0, i + 1).map((x) => x.slug).join("/")}`,
  }));
}

// Egy kategória teljes slug-útvonala a gyökerétől (pl. "noik/fehernemu/melltarto")
function buildCategorySlugPath(catId, catsById) {
  const chain = []
  let cur = catsById.get(catId)
  while (cur) {
    chain.push(cur)
    cur = cur.szulo ? catsById.get(cur.szulo) : null
  }
  chain.reverse()
  return chain.map(c => c.slug).join('/')
}


/* ---------- Page ---------- */

export default async function Page({ params, searchParams }) {
  const { slug } = params;
  const sp = await searchParams;
  const leaf = slug?.[slug.length - 1];

  const supabase = await createClient();

  // ⬇️ Kategóriák lehúzása egyszer, közösen (mindkét ág használja)
  const { data: allCats = [] } = await supabase
    .from("product-categories")
    .select("id, slug, nev, szulo, kozzeteve, kep, icon");

  const catsById = new Map(allCats.map((c) => [c.id, c]));
  const catsByIdObj = Object.fromEntries(allCats.map(c => [c.id, c]))

  /* ---------- TERMÉKOLDAL? ---------- */

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
    // Termékoldali slug-útvonal feloldás
    const paths = getCategoryPathsFromProduct(product);
    const picked = pickBestPath(paths); // termékoldalon nincs currentCategoryId
    const { slugs: catSlugs, names: catNames } = idsPathToSlugsAndNames(picked, catsById);
    const categoryPath = catSlugs.join("/"); // pl. "noik/fehernemu/melltarto"

    const extraImages = (product.kepgaleria || "")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);

    // első legyen a főkép, utána a galéria
    const galleryImages = Array.from(
      new Set(
        [product.termekkep, ...extraImages].filter(Boolean)
      )
    );

    const faqItems = parseGyikString(product.gyik);

    return (
      <div className="w-full xl:pt-18 pt-18 xl:pb-8 pb-4 px-4 xl:px-12">
        <div className="flex flex-col lg:gap-8 gap-4">
          <Suspense fallback={null}>
            {/* Ha a Breadcrumbs képes fogadni trail-t: */}
            <Breadcrumbs
              trail={[
                { label: "Termékek", href: "/termekek" },
                ...catSlugs.map((slug, i) => ({
                  label: catNames[i],
                  href: `/termekek/${catSlugs.slice(0, i + 1).join("/")}`,
                })),
                { label: product.fo_cim || product.seo_slug },
              ]}
            />
          </Suspense>

          <div className="flex lg:flex-row flex-col lg:gap-8 gap-4">
            <div className="flex lg:flex-row flex-col lg:gap-16 gap-8 w-full">
              <div className="flex flex-col lg:gap-16 gap-8 lg:w-3/5 w-full">
                {/* képgaléria (rövidített) */}
                <ProductImageGallerySwiper images={galleryImages} />

                <div className="block lg:hidden">
                  <ProductInfoPanel product={product} />
                </div>

                <div className="flex flex-col gap-4">
                  <Paragraph>{product.termekleiras}</Paragraph>
                </div>

                <div className="flex flex-col gap-4">
                  {faqItems.length > 0 && <ProductFAQ items={faqItems} />}
                </div>

                <div className="flex flex-col gap-4">
                  <H3>Tisztítás</H3>
                  <Paragraph>{product.tisztitas}</Paragraph>
                </div>

                <div className="flex flex-col gap-4">
                  <H3>Tárolás</H3>
                  <Paragraph>{product.tarolas}</Paragraph>
                </div>

                <div className="flex flex-col gap-4">
                  <H3>Garancia</H3>
                  <Paragraph>{product.garancia} év</Paragraph>
                </div>

                <UpsaleProducts products={productsUnderFreeShipping} />
              </div>

              <div className="hidden lg:block relative lg:w-2/5 w-full">
                <ProductInfoPanel product={product} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- KATEGÓRIA / ARCHÍV NÉZET ---------- */

  // 1) Szülő kategória a leaf slug alapján
  const { data: category } = await supabase
    .from("product-categories")
    .select("id, nev, slug, szulo, kep, leiras_fent, leiras_lent, kozzeteve")
    .eq("slug", String(leaf).toLowerCase())
    .maybeSingle();

  if (!category) {
    return (
      <div className="w-full xl:pt-18 pt-10 px-4 xl:px-12">
        <div className="text-sm text-gray-500 py-8">Kategória nem található.</div>
      </div>
    );
  }

  // 2) Szűrők (query stringből)
  const get = (k) => {
    if (sp && typeof sp.get === 'function') {
      return sp.get(k) ?? '';
    }
    const v = sp?.[k];
    return Array.isArray(v) ? v[0] : (v ?? '');
  };

  const arrange = get("arrange");
  const color = get("color");
  const childSlug = get("category");
  const stock = get("stock");
  const warranty = get("warranty");
  const priceRange = get("pricerange");
  const size = get("size");
  const weightrange = get("weightrange");
  const material = get("material");
  const charging = get("charging");
  const chargingtime = get("chargingtime");
  const noise = get("noise");
  const waterproof = get("waterproof");
  const usetime = get("usetime");
  const modes = get("modes");
  const speed = get("speed");
  const controll = get("controll");
  const app = get("app");

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

  // ár intervallum
  if (priceRange) {
    if (priceRange.includes("-")) {
      const [min, max] = priceRange
        .split("-")
        .map((n) => Number(String(n).replace(/\D/g, "")));
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
      filtered = [];
    }
  }

  const catTrail = buildCategoryTrail(category, catsById);

  return (
    <div className="w-full xl:pt-18 pt-18 xl:pb-8 pb-4 px-4 xl:px-12">
      <div className="flex flex-col lg:gap-8 gap-4 mb-8">
        <Suspense fallback={null}>
          <Breadcrumbs
            trail={[{ label: "Termékek", href: "/termekek" }, ...catTrail]}
          />
        </Suspense>

        {/* Kategória szövegek */}
        <CategoryPageTexts category={category} />

        {/* Alkategóriák (pill/box) */}
        {(() => {
          // fontos: stringes összevetés, és csak a közzétett gyerekeket mutatjuk
          const childCats = (allCats || []).filter(
            (c) =>
              c &&
              c.kozzeteve !== false &&
              String(c.szulo ?? '') === String(category.id ?? '')
          )

          if (!childCats.length) return null

          return (
            <div className="space-y-2">
              <ButtonText>Alkategóriák</ButtonText>
              <div className="flex md:flex-row flex-col gap-2 w-full">
                {childCats.map((c) => {
                  const path = buildCategorySlugPath(c.id, catsById)
                  return (
                    <Link
                      key={c.id}
                      href={`/termekek/${path}`}
                      className="relative flex gap-2 items-center text-sm px-3 py-2 rounded-2xl border border-[var(--border)]
                                hover:bg-[var(--grey-bg)] hover:border-[var(--border)]
                                transition-colors whitespace-nowrap text-ellipsis min-w-fit"
                      title={c.nev}
                    >
                      { (c.kep || c.icon) && <Image src={c.kep || c.icon} alt={c.nev} width={50} height={50} className="rounded" /> }
                      {c.nev}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })()}

      </div>

      <div className="flex md:flex-row flex-col md:gap-16 h-full">
      <div className="md:sticky top-40 h-full">
        <FilterDrawerProvider>
          {/* mobil felső sor: csak a gomb */}
          <div className="flex items-center justify-end md:hidden mt-4">
            <FilterToggleButton />
          </div>

          <div className="md:mt-8 flex gap-6 max-h-[65vh] overflow-y-auto pr-4">
            {/* DESKTOP oldalsáv */}
            <div className="hidden md:block w-64 shrink-0">
              <Suspense fallback={<div>Betöltés...</div>}>
                <FilterSection slug={category.slug} />
              </Suspense>
            </div>
          </div>

          {/* MOBIL DRAWER tartalma (ugyanaz a FilterSection) */}
          <FilterDrawer>
            <FilterSection slug={category.slug} />
          </FilterDrawer>
        </FilterDrawerProvider>
      </div>

      <ProductsPaginated catsByIdObj={catsByIdObj} categoryId={category.id} />
      </div>
    </div>
  );
}
