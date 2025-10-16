"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

import FilterArrange from "@/app/components/UI/FilterArrange";
import FilterColor from "@/app/components/UI/FilterColor";
import FilterCategory from "@/app/components/UI/FilterCategory";
import FilterChipButton from "@/app/components/UI/Buttons/FilterChipButton";
import FilterStock from "@/app/components/UI/FilterStock";
import FilterWarranty from "@/app/components/UI/FilterWarranty";
import FilterPriceRange from "@/app/components/UI/FilterPriceRange";
import FilterPriceSlider from "./FilterPriceSlider";
import FilterSize from "@/app/components/UI/FilterSize";
import FilterWeightRange from "@/app/components/UI/FilterWeightRange";
import FilterMaterial from "@/app/components/UI/FilterMaterial";
import FilterCharging from "@/app/components/UI/FilterCharging";
import FilterChargingTime from "@/app/components/UI/FilterChargingTime";
import FilterNoise from "@/app/components/UI/FilterNoise";
import FilterWaterproof from "@/app/components/UI/FilterWaterproof";
import FilterUsetime from "@/app/components/UI/FilterUsetime";
import FilterModes from "@/app/components/UI/FilterModes";
import FilterSpeed from "@/app/components/UI/FilterSpeed";
import FilterControll from "@/app/components/UI/FilterControll";
import FilterApp from "@/app/components/UI/FilterApp";
import AccordionFilterMulti from '@/app/components/UI/AccordionFilterMulti'
import Accordion from '@/app/components/UI/Accordion'
import FilterResetButton from '@/app/components/UI/FilterResetButton'


export default function FilterSection({ slug }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);

  // --- URL-ből kivett kiválasztások (chip sávhoz) ---
  const selectedColor = searchParams.get("color") || "";
  const selectedSort = searchParams.get("arrange") || "";
  const selectedCategory = searchParams.get("category") || "";
  const selectedStock = searchParams.get("stock") || "";
  const selectedWarranty = searchParams.get("warranty") || "";
  const selectedPriceRange = searchParams.get("pricerange") || "";
  const selectedSize = searchParams.get("size") || "";
  const selectedWeightRange = searchParams.get("weightrange") || "";
  const selectedMaterial = searchParams.get("material") || "";
  const selectedCharging = searchParams.get("charging") || "";
  const selectedChargingTime = searchParams.get("chargingtime") || "";
  const selectedNoise = searchParams.get("noise") || "";
  const selectedWaterproof = searchParams.get("waterproof") || "";
  const selectedUseTime = searchParams.get("usetime") || "";
  const selectedModes = searchParams.get("modes") || "";
  const selectedSpeed = searchParams.get("speed") || "";
  const selectedControll = searchParams.get("controll") || "";
  const selectedApp = searchParams.get("app") || "";

  // --- Dinamikus opciók állapota ---
  const [loading, setLoading] = useState(false);
  const [facet, setFacet] = useState({
    color: [],
    category: [],
    stock: [],
    warranty: [],
    pricerange: [],   // ha maradna statikus, hagyhatod üresen is
    size: [],
    weightrange: [],
    material: [],
    charging: [],
    chargingtime: [],
    noise: [],
    waterproof: [],
    usetime: [],
    modes: [],
    speed: [],
    controll: [],
    app: [],
  });

  // --- Helper: string normalizálás és listázás ---
  const norm = (v) => String(v || "").trim();
  const splitMulti = (v) =>
    norm(v)
      .split(/[;,\|/]+/g)
      .map((s) => s.trim())
      .filter(Boolean);

  // kategória JSON-útvonal tartalmaz-e egy id-t
  const pathContainsId = (kategoriaJson, id) => {
    try {
      const paths = JSON.parse(kategoriaJson);
      return (
        Array.isArray(paths) &&
        paths.some((p) => Array.isArray(p) && p.includes(id))
      );
    } catch {
      return false;
    }
  };

  // közvetlen gyermek id a parentId után (egy adott úton)
  const findDirectChildId = (kategoriaJson, parentId) => {
    try {
      const paths = JSON.parse(kategoriaJson);
      for (const p of paths || []) {
        const idx = p.indexOf(parentId);
        if (idx >= 0 && idx + 1 < p.length) return p[idx + 1];
      }
    } catch {}
    return null;
  };

  // --- Dinamikus opciók betöltése ---
  const loadFacets = useCallback(async () => {
    setLoading(true);

    // 1) ha van slug, kérjük le a szülő kategória id-t
    let parent = null;
    if (slug) {
      const { data: parentCat } = await supabase
        .from("product-categories")
        .select("id, nev, slug, szulo")
        .eq("slug", String(slug).toLowerCase())
        .maybeSingle();
      parent = parentCat || null;
    }

    // 2) kategória térkép (id -> {nev, slug, szulo})
    const { data: allCats = [] } = await supabase
      .from("product-categories")
      .select("id, nev, slug, szulo");

    const catById = new Map(allCats.map((c) => [c.id, c]));

    // 3) termékek lekérése (csak a szükséges oszlopok)
    const { data: allProducts = [] } = await supabase
      .from("products")
      .select(
        [
          "id",
          "fo_cim",
          "kategoria",
          "kozzeteve",
          "eladasi_ar_brutto",
          "szin",
          "meretek",
          "suly",
          "anyag",
          "toltes",
          "toltesi_ido",
          "zajszint",
          "vizallosag",
          "hasznalati_ido",
          "vibracios_modok",
          "sebessegfokozatok",
          "vezerles",
          "applikacio",
          "garancia",
          "keszlet",
        ].join(",")
      )
      .eq("kozzeteve", true)
      .limit(1000); // finomhangold/pagináld igény szerint

    // 4) ha van slug → szűrés a kategóriára (kliens oldalon a kategoria JSON alapján)
    const products = parent
      ? allProducts.filter((p) => pathContainsId(p.kategoria, parent.id))
      : allProducts;

    // 5) halmazok felépítése
    const setColor = new Set();
    const setSize = new Set();
    const setWeight = new Set();
    const setMaterial = new Set();
    const setCharging = new Set();
    const setChargingTime = new Set();
    const setNoise = new Set();
    const setWaterproof = new Set();
    const setUseTime = new Set();
    const setModes = new Set();
    const setSpeed = new Set();
    const setControll = new Set();
    const setApp = new Set();
    const setWarranty = new Set();
    const setStock = new Set(["instock", "out-of-stock"]); // mindig megjelenhet, ha így akarod

    // kategória-szűrő opciók: a szülő alatti közvetlen gyermek kategóriák,
    // amelyeket a termékek valóban használnak
    const setChildCatIds = new Set();

    for (const p of products) {
      // színek
      if (p.szin) splitMulti(p.szin).forEach((v) => setColor.add(v));

      // méret (szabad szöveg)
      if (p.meretek) splitMulti(p.meretek).forEach((v) => setSize.add(v));

      // súly → itt vagy konkrét értékek, vagy képezhetsz bucketeket
      if (p.suly) setWeight.add(norm(p.suly));

      // anyagok
      if (p.anyag) splitMulti(p.anyag).forEach((v) => setMaterial.add(v));

      // töltés
      if (p.toltes) splitMulti(p.toltes).forEach((v) => setCharging.add(v));

      // töltési idő
      if (p.toltesi_ido)
        splitMulti(p.toltesi_ido).forEach((v) => setChargingTime.add(v));

      // zajszint
      if (p.zajszint) splitMulti(p.zajszint).forEach((v) => setNoise.add(v));

      // vízállóság
      if (p.vizallosag)
        splitMulti(p.vizallosag).forEach((v) => setWaterproof.add(v));

      // használati idő
      if (p.hasznalati_ido)
        splitMulti(p.hasznalati_ido).forEach((v) => setUseTime.add(v));

      // módok – itt a példában 'vibracios_modok' van
      if (p.vibracios_modok)
        splitMulti(p.vibracios_modok).forEach((v) => setModes.add(v));

      // sebességfokozatok
      if (p.sebessegfokozatok)
        splitMulti(p.sebessegfokozatok).forEach((v) => setSpeed.add(v));

      // vezérlés
      if (p.vezerles) splitMulti(p.vezerles).forEach((v) => setControll.add(v));

      // applikáció
      if (p.applikacio)
        splitMulti(p.applikacio).forEach((v) => setApp.add(v.toLowerCase()));

      // garancia → normalizáljuk "1-year", "2-year" stb. alakra
      if (p.garancia) {
        const raw = norm(p.garancia).toLowerCase(); // pl. "1 év"
        const m = raw.match(/(\d+)/);
        if (m) setWarranty.add(`${m[1]}-year`);
        else setWarranty.add(raw);
      }

      // készlet → 'instock'/'out-of-stock' (ha nincs „backorder” infó)
      if (typeof p.keszlet === "number")
        setStock.add(p.keszlet > 0 ? "instock" : "out-of-stock");

      // gyermek kategória opciók (ha van parent)
      if (parent) {
        const childId = findDirectChildId(p.kategoria, parent.id);
        if (childId) setChildCatIds.add(childId);
      }
    }

    // kategória opciók összeállítása (csak ha van parent)
    const categoryOptions = parent
      ? Array.from(setChildCatIds)
          .map((id) => catById.get(id))
          .filter(Boolean)
          .map((c) => ({ label: c.nev, value: c.slug }))
          .sort((a, b) => a.label.localeCompare(b.label, "hu"))
      : []; // fő archívumban akár top kategóriákat is adhatnál ide

    // helper: Set -> [{label, value}]
    const toOptions = (s) =>
      Array.from(s)
        .map((v) => ({ label: v, value: String(v) }))
        .sort((a, b) => a.label.localeCompare(b.label, "hu"));

    setFacet({
      color: toOptions(setColor),
      category: categoryOptions,
      stock: toOptions(setStock),
      warranty: toOptions(setWarranty),
      // price range maradhat statikus, ha úgy szeretnéd
      pricerange: [
        { label: "0–10 000", value: "0-10000" },
        { label: "10 000+", value: "10000+" },
      ],
      size: toOptions(setSize),
      weightrange: toOptions(setWeight),
      material: toOptions(setMaterial),
      charging: toOptions(setCharging),
      chargingtime: toOptions(setChargingTime),
      noise: toOptions(setNoise),
      waterproof: toOptions(setWaterproof),
      usetime: toOptions(setUseTime),
      modes: toOptions(setModes),
      speed: toOptions(setSpeed),
      controll: toOptions(setControll),
      app: toOptions(setApp),
    });

    setLoading(false);
  }, [supabase, slug]);

  useEffect(() => {
    loadFacets();
  }, [loadFacets]);

  // --- URL frissítés ---
  const updateFilter = (key, value) => {
    const params = new URLSearchParams(window.location.search);
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`?${params.toString()}`);
  };

  // Helper: csak akkor rendereljünk egy filtert, ha van opció
  const has = (arr) => Array.isArray(arr) && arr.length > 0;

  return (
  <>
    <FilterResetButton
      keys={[
        'arrange','color','category','stock','warranty','pricerange',
        'size','weightrange','material','charging','chargingtime','noise',
        'waterproof','usetime','modes','speed','controll','app'
      ]}
    />
    {/* Fejléc: Rendezés + Reset (mindig látszik) */}
    <div className="mt-4 mb-2 flex items-center justify-between gap-3">
      <div className="w-full max-w-xs">
        <Accordion title="Rendezés" defaultOpen={false}>
          <div className="grid grid-cols-1 gap-2">
            {[
              { label: "Ár szerint növekvő", value: "price-low-to-high" },
              { label: "Ár szerint csökkenő", value: "price-high-to-low" },
              { label: "Legújabb", value: "newest" },
              { label: "Értékelés", value: "rating" },
              { label: "Legnépszerűbb", value: "popular" },
              { label: "Legtöbbet keresett", value: "most-searched" },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => updateFilter('arrange', opt.value)}
                className={`text-left text-sm px-2 py-1 rounded hover:bg-gray-100 cursor-pointer ${
                  (useSearchParams().get('arrange') || '') === opt.value ? 'font-semibold' : ''
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Accordion>
      </div>
    </div>

    {/* Ár slider */}
    <div className="mb-4">
      <FilterPriceSlider label="Ár" min={0} max={200000} step={1000} paramKey="pricerange" />
    </div>

    {/* Harmonika szekciók checkboxokkal */}
    {has(facet.category) && (
      <AccordionFilterMulti title="Kategória" paramKey="category" options={facet.category} />
    )}
    {has(facet.color) && (
      <AccordionFilterMulti title="Szín" paramKey="color" options={facet.color} />
    )}
    {has(facet.stock) && (
      <AccordionFilterMulti title="Raktárkészlet" paramKey="stock" options={facet.stock} />
    )}
    {has(facet.warranty) && (
      <AccordionFilterMulti title="Garancia" paramKey="warranty" options={facet.warranty} />
    )}
    {has(facet.size) && (
      <AccordionFilterMulti title="Méret" paramKey="size" options={facet.size} />
    )}
    {has(facet.weightrange) && (
      <AccordionFilterMulti title="Súly" paramKey="weightrange" options={facet.weightrange} suffix={"gr"}/>
    )}
    {has(facet.material) && (
      <AccordionFilterMulti title="Anyag" paramKey="material" options={facet.material} />
    )}
    {has(facet.charging) && (
      <AccordionFilterMulti title="Töltés" paramKey="charging" options={facet.charging} />
    )}
    {has(facet.chargingtime) && (
      <AccordionFilterMulti title="Töltési idő" paramKey="chargingtime" options={facet.chargingtime} suffix={"perc"} />
    )}
    {has(facet.noise) && (
      <AccordionFilterMulti title="Zajszint" paramKey="noise" options={facet.noise} />
    )}
    {has(facet.waterproof) && (
      <AccordionFilterMulti title="Vízállóság" paramKey="waterproof" options={facet.waterproof} />
    )}
    {has(facet.usetime) && (
      <AccordionFilterMulti title="Használati idő" paramKey="usetime" options={facet.usetime} suffix={"perc"} />
    )}
    {has(facet.modes) && (
      <AccordionFilterMulti title="Használati módok" paramKey="modes" options={facet.modes} />
    )}
    {has(facet.speed) && (
      <AccordionFilterMulti title="Sebesség fokozatok" paramKey="speed" options={facet.speed} />
    )}
    {has(facet.controll) && (
      <AccordionFilterMulti title="Irányítás" paramKey="controll" options={facet.controll} />
    )}
    {has(facet.app) && (
      <AccordionFilterMulti title="Applikáció" paramKey="app" options={facet.app} />
    )}
  </>
)

}
