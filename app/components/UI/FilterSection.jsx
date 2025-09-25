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
      {/* Felső filter sor – csak a relevánsakat mutatjuk */}
      <div className="flex flex-row flex-wrap gap-4 py-2">
        <FilterArrange
          label="Rendezés"
          options={[
            { label: "Ár szerint csökkenő", value: "price-low-to-high" },
            { label: "Ár szerint növekvő", value: "price-high-to-low" },
            { label: "Legújabb", value: "newest" },
            { label: "Értékelés", value: "rating" },
            { label: "Legnépszerűbb", value: "popular" },
            { label: "Legtöbbet keresett", value: "most-searched" },
          ]}
          onChange={(value) => updateFilter("arrange", value)}
        />

        {has(facet.color) && (
          <FilterColor
            label="Szín"
            options={facet.color}
            onChange={(value) => updateFilter("color", value)}
          />
        )}

        {has(facet.category) && (
          <FilterCategory
            label="Kategória"
            options={facet.category}
            onChange={(value) => updateFilter("category", value)}
          />
        )}

        {has(facet.stock) && (
          <FilterStock
            label="Raktárkészlet"
            options={facet.stock}
            onChange={(value) => updateFilter("stock", value)}
          />
        )}

        {has(facet.warranty) && (
          <FilterWarranty
            label="Garancia"
            options={facet.warranty}
            onChange={(value) => updateFilter("warranty", value)}
          />
        )}

        {has(facet.pricerange) && (
          <FilterPriceRange
            label="Ár"
            options={facet.pricerange}
            onChange={(value) => updateFilter("pricerange", value)}
          />
        )}

        {has(facet.size) && (
          <FilterSize
            label="Méret"
            options={facet.size}
            onChange={(value) => updateFilter("size", value)}
          />
        )}

        {has(facet.weightrange) && (
          <FilterWeightRange
            label="Súly"
            options={facet.weightrange}
            onChange={(value) => updateFilter("weightrange", value)}
          />
        )}

        {has(facet.material) && (
          <FilterMaterial
            label="Anyag"
            options={facet.material}
            onChange={(value) => updateFilter("material", value)}
          />
        )}

        {has(facet.charging) && (
          <FilterCharging
            label="Töltés"
            options={facet.charging}
            onChange={(value) => updateFilter("charging", value)}
          />
        )}

        {has(facet.chargingtime) && (
          <FilterChargingTime
            label="Töltési idő"
            options={facet.chargingtime}
            onChange={(value) => updateFilter("chargingtime", value)}
          />
        )}

        {has(facet.noise) && (
          <FilterNoise
            label="Zajszint"
            options={facet.noise}
            onChange={(value) => updateFilter("noise", value)}
          />
        )}

        {has(facet.waterproof) && (
          <FilterWaterproof
            label="Vízállóság"
            options={facet.waterproof}
            onChange={(value) => updateFilter("waterproof", value)}
          />
        )}

        {has(facet.usetime) && (
          <FilterUsetime
            label="Használati idő"
            options={facet.usetime}
            onChange={(value) => updateFilter("usetime", value)}
          />
        )}

        {has(facet.modes) && (
          <FilterModes
            label="Használati módok"
            options={facet.modes}
            onChange={(value) => updateFilter("modes", value)}
          />
        )}

        {has(facet.speed) && (
          <FilterSpeed
            label="Sebesség fokozatok"
            options={facet.speed}
            onChange={(value) => updateFilter("speed", value)}
          />
        )}

        {has(facet.controll) && (
          <FilterControll
            label="Irányítás"
            options={facet.controll}
            onChange={(value) => updateFilter("controll", value)}
          />
        )}

        {has(facet.app) && (
          <FilterApp
            label="Applikáció"
            options={facet.app}
            onChange={(value) => updateFilter("app", value)}
          />
        )}
      </div>

      {/* Chip sáv */}
      <div
        className={`flex flex-row flex-wrap gap-2 pb-1 ${
          selectedColor ||
          selectedSort ||
          selectedCategory ||
          selectedStock ||
          selectedWarranty ||
          selectedPriceRange ||
          selectedSize ||
          selectedWeightRange ||
          selectedMaterial ||
          selectedCharging ||
          selectedChargingTime ||
          selectedNoise ||
          selectedWaterproof ||
          selectedUseTime ||
          selectedModes ||
          selectedSpeed ||
          selectedControll ||
          selectedApp
            ? "py-2"
            : "py-0"
        }`}
      >
        {selectedSort && (
          <FilterChipButton title={selectedSort} buttonicon="TbX" onclick={() => updateFilter("arrange", "")} />
        )}
        {selectedColor && (
          <FilterChipButton title={selectedColor} buttonicon="TbX" onclick={() => updateFilter("color", "")} />
        )}
        {selectedCategory && (
          <FilterChipButton title={selectedCategory} buttonicon="TbX" onclick={() => updateFilter("category", "")} />
        )}
        {selectedStock && (
          <FilterChipButton title={selectedStock} buttonicon="TbX" onclick={() => updateFilter("stock", "")} />
        )}
        {selectedWarranty && (
          <FilterChipButton title={selectedWarranty} buttonicon="TbX" onclick={() => updateFilter("warranty", "")} />
        )}
        {selectedPriceRange && (
          <FilterChipButton title={selectedPriceRange} buttonicon="TbX" onclick={() => updateFilter("pricerange", "")} />
        )}
        {selectedSize && (
          <FilterChipButton title={selectedSize} buttonicon="TbX" onclick={() => updateFilter("size", "")} />
        )}
        {selectedWeightRange && (
          <FilterChipButton title={selectedWeightRange} buttonicon="TbX" onclick={() => updateFilter("weightrange", "")} />
        )}
        {selectedMaterial && (
          <FilterChipButton title={selectedMaterial} buttonicon="TbX" onclick={() => updateFilter("material", "")} />
        )}
        {selectedCharging && (
          <FilterChipButton title={selectedCharging} buttonicon="TbX" onclick={() => updateFilter("charging", "")} />
        )}
        {selectedChargingTime && (
          <FilterChipButton title={selectedChargingTime} buttonicon="TbX" onclick={() => updateFilter("chargingtime", "")} />
        )}
        {selectedNoise && (
          <FilterChipButton title={selectedNoise} buttonicon="TbX" onclick={() => updateFilter("noise", "")} />
        )}
        {selectedWaterproof && (
          <FilterChipButton title={selectedWaterproof} buttonicon="TbX" onclick={() => updateFilter("waterproof", "")} />
        )}
        {selectedUseTime && (
          <FilterChipButton title={selectedUseTime} buttonicon="TbX" onclick={() => updateFilter("usetime", "")} />
        )}
        {selectedModes && (
          <FilterChipButton title={selectedModes} buttonicon="TbX" onclick={() => updateFilter("modes", "")} />
        )}
        {selectedSpeed && (
          <FilterChipButton title={selectedSpeed} buttonicon="TbX" onclick={() => updateFilter("speed", "")} />
        )}
        {selectedControll && (
          <FilterChipButton title={selectedControll} buttonicon="TbX" onclick={() => updateFilter("controll", "")} />
        )}
        {selectedApp && (
          <FilterChipButton title={selectedApp} buttonicon="TbX" onclick={() => updateFilter("app", "")} />
        )}
      </div>
    </>
  );
}
