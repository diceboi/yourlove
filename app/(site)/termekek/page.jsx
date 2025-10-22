// app/(site)/termekek/page.jsx
import { createClient } from "@/utils/supabase/server"
import Breadcrumbs from "@/app/components/UI/Breadcrumbs"
import ProductListItem from "@/app/components/UI/ProductListItem"
import CategoryPageTexts from "@/app/components/CategoryPageTexts"
import FilterSection from "@/app/components/UI/FilterSection"
import FilterDrawerProvider from "@/app/components/filter/FilterDrawerProvider"
import FilterDrawer from "@/app/components/filter/FilterDrawer"
import FilterToggleButton from "@/app/components/filter/FilterToggleButton"
import Link from "next/link"
import Image from "next/image"
import ButtonText from "@/app/components/UI/Texts/ButtonText"
import { Suspense } from "react"
import ProductsInfinite from "@/app/components/products/ProductsInfinite"
import ProductsPaginated from "@/app/components/products/ProductsPaginated"

/* ---------- Segédfüggvények ---------- */
function safeParseJSON(s) { try { return JSON.parse(s) } catch { return null } }

// products.kategoria (JSON string) -> ID útvonalak tömbje
function getCategoryPathsFromProduct(product) {
  const raw = product?.kategoria
  const parsed = typeof raw === "string" ? safeParseJSON(raw) : raw
  return Array.isArray(parsed) ? parsed.filter(p => Array.isArray(p) && p.length) : []
}

// ha több útvonal is van, válaszd a leghosszabbat (legmélyebb)
function pickBestPath(paths) {
  if (!paths.length) return null
  return paths.slice().sort((a,b)=>b.length-a.length)[0]
}

// adott kategória teljes slug-útvonala gyökerétől
function buildCategorySlugPath(catId, catsById) {
  const chain = []
  let cur = catsById.get(catId)
  while (cur) {
    chain.push(cur)
    cur = cur.szulo ? catsById.get(cur.szulo) : null
  }
  chain.reverse()
  return chain.map(c => c.slug).join("/")
}

/* ---------- Page ---------- */
export default async function Page({ searchParams }) {
  const supabase = await createClient()
  const sp = searchParams

  const get = (k) => {
    const v = sp?.[k]
    return Array.isArray(v) ? v[0] : (v ?? "")
  }

  // Query paramok
  const arrange      = get("arrange")
  const color        = get("color")
  const childSlug    = get("category")
  const stock        = get("stock")
  const warranty     = get("warranty")
  const priceRange   = get("pricerange")
  const size         = get("size")
  const weightrange  = get("weightrange")
  const material     = get("material")
  const charging     = get("charging")
  const chargingtime = get("chargingtime")
  const noise        = get("noise")
  const waterproof   = get("waterproof")
  const usetime      = get("usetime")
  const modes        = get("modes")
  const speed        = get("speed")
  const controll     = get("controll")
  const app          = get("app")

  // ⬇️ Kategóriák (a főkategória boxokhoz + termék útvonal feloldáshoz)
  const { data: allCats = [] } = await supabase
  .from('product-categories')
  .select('id, slug, nev, szulo, kozzeteve, icon, kep')

  const catsByIdObj = Object.fromEntries(allCats.map(c => [c.id, c]))
  const rootCats = allCats.filter(c =>
    (c.kozzeteve !== false) &&
    (c.szulo === null || typeof c.szulo === "undefined")
  )

  // (Publikált) termékek – bő lekérés, majd JS szűrés
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("kozzeteve", true)
    .limit(1000)

  if (error) {
    console.error("Supabase products error:", error)
  }
  const allPublished = Array.isArray(data) ? data : []

  // Ha "category" query slug érkezett, oldjuk fel id-vé, és aszerint szűrjünk
  let categoryId = null
  if (childSlug) {
    const { data: cat } = await supabase
      .from("product-categories")
      .select("id, slug")
      .eq("slug", String(childSlug).toLowerCase())
      .maybeSingle()
    categoryId = cat?.id ?? null
  }

  let products = allPublished.filter((p) => {
    // Kategória szűrés (kategoria = JSON-string útvonalak)
    if (categoryId) {
      try {
        const paths = JSON.parse(p.kategoria)
        const inCat = Array.isArray(paths) && paths.some(path => Array.isArray(path) && path.includes(categoryId))
        if (!inCat) return false
      } catch {
        return false
      }
    }

    // Szűrők
    if (color && p.szin && String(p.szin).toLowerCase() !== color.toLowerCase()) return false
    if (stock && p.keszlet && String(p.keszlet).toLowerCase() !== stock.toLowerCase()) return false
    if (warranty && p.garancia && String(p.garancia).toLowerCase() !== warranty.toLowerCase()) return false
    if (size && p.meret && String(p.meret).toLowerCase() !== size.toLowerCase()) return false
    if (weightrange && p.suly && String(p.suly).toLowerCase() !== weightrange.toLowerCase()) return false
    if (material && p.anyag && String(p.anyag).toLowerCase() !== material.toLowerCase()) return false
    if (charging && p.toltes_tipus && String(p.toltes_tipus).toLowerCase() !== charging.toLowerCase()) return false
    if (chargingtime && p.toltesi_ido && String(p.toltesi_ido).toLowerCase() !== chargingtime.toLowerCase()) return false
    if (noise && p.zajszint && String(p.zajszint).toLowerCase() !== noise.toLowerCase()) return false
    if (waterproof && p.vizallosag && String(p.vizallosag).toLowerCase() !== waterproof.toLowerCase()) return false
    if (usetime && p.hasznalati_ido && String(p.hasznalati_ido).toLowerCase() !== usetime.toLowerCase()) return false
    if (modes && p.modok && String(p.modok).toLowerCase() !== modes.toLowerCase()) return false
    if (speed && p.sebesseg && String(p.sebesseg).toLowerCase() !== speed.toLowerCase()) return false
    if (controll && p.iranyitas && String(p.iranyitas).toLowerCase() !== controll.toLowerCase()) return false

    if (app) {
      const want = app === "true"
      if (typeof p.app === "boolean" && p.app !== want) return false
      if (typeof p.app === "string" && (p.app.toLowerCase() === "true") !== want) return false
    }

    if (priceRange) {
      const price = Number(p.eladasi_ar_brutto ?? 0)
      if (priceRange.includes("-to-")) {
        const [min, max] = priceRange.split("-to-").map((n) => Number(n))
        if (Number.isFinite(min) && price < min) return false
        if (Number.isFinite(max) && price > max) return false
      } else if (priceRange.endsWith("+")) {
        const min = Number(priceRange.replace("+", ""))
        if (Number.isFinite(min) && price < min) return false
      }
    }
    return true
  })

  // Rendezés
  if (arrange === "price-low-to-high") {
    products.sort((a,b)=> (a.eladasi_ar_brutto ?? 0) - (b.eladasi_ar_brutto ?? 0))
  } else if (arrange === "price-high-to-low") {
    products.sort((a,b)=> (b.eladasi_ar_brutto ?? 0) - (a.eladasi_ar_brutto ?? 0))
  } else if (arrange === "newest") {
    products.sort((a,b)=> new Date(b.created_at || 0) - new Date(a.created_at || 0))
  }

  return (
    <div className="w-full xl:pt-18 pt-18 xl:pb-8 pb-4 px-4 xl:px-12">
      <div className="flex flex-col lg:gap-4 gap-4  mb-8">
        <Suspense fallback={null}>
          <Breadcrumbs />
        </Suspense>

        <CategoryPageTexts category={"Termékek"} />

        {/* Főkategóriák (boxok) */}
        {rootCats.length > 0 && (
          <div className="space-y-2">
            <ButtonText>Kategóriák</ButtonText>
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {rootCats.map((c) => (
                <Link
                  key={c.id}
                  href={`/termekek/${c.slug}`}
                  className="relative flex gap-2 items-center text-sm px-3 py-2 rounded-2xl border border-[var(--border)]
                             hover:bg-[var(--grey-bg)] hover:border-[var(--border)]
                             transition-colors whitespace-nowrap text-ellipsis min-w-fit"
                  title={c.nev}
                >
                  { (c.kep || c.icon) && <Image src={c.kep || c.icon} alt={c.nev} width={50} height={50} className="rounded" /> }
                  {c.nev}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex md:flex-row flex-col md:gap-16 h-full">
        <div className="md:sticky top-40 h-full">
          <FilterDrawerProvider>
            {/* mobil felső sor: csak a gomb */}
            <div className="flex items-center justify-end md:hidden mt-4">
              <FilterToggleButton />
            </div>

            <div className="md:mt-8 flex gap-6 max-h-[76vh] overflow-y-auto pr-4">
              {/* DESKTOP oldalsáv */}
              <div className="hidden md:block w-64 shrink-0">
                <Suspense fallback={<div>Betöltés...</div>}>
                  <FilterSection />
                </Suspense>
              </div>
            </div>

            {/* MOBIL DRAWER tartalma */}
            <FilterDrawer>
              <FilterSection />
            </FilterDrawer>
          </FilterDrawerProvider>
        </div>

        <ProductsPaginated catsByIdObj={catsByIdObj} />
      </div>
    </div>
  )
}
