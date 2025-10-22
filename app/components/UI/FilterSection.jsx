"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Accordion from "@/app/components/UI/Accordion";
import { useFilterDrawer } from "@/app/components/filter/FilterDrawerProvider";

/* --------- Kisegítők --------- */
const norm = (v) => String(v ?? "").trim();
const toNum = (v, fallback = 0) => {
  const n = Number(String(v).replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : fallback;
};
const safeParseJSON = (s) => {
  try { return JSON.parse(s); } catch { return null; }
};
const pathContainsId = (kategoriaJson, id) => {
  try {
    const paths = JSON.parse(kategoriaJson);
    return Array.isArray(paths) && paths.some((p) => Array.isArray(p) && p.includes(id));
  } catch {
    return false;
  }
};
const splitMulti = (v) =>
  norm(v)
    .split(/[;,\|/]+/g)
    .map((s) => s.trim())
    .filter(Boolean);

/* --------- Reusable egyválasztós szekció --------- */
function DraftAccordionSelect({ title, value, onChange, options = [], suffix, classname }) {
  return (
    <Accordion title={title} defaultOpen={false}>
      <div className="flex flex-col gap-1">
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <label
              key={opt.value}
              className={`flex items-center justify-between rounded-lg px-3 py-2 cursor-pointer border
                         ${selected ? "bg-[var(--grey-bg)] border-[var(--border)]" : "border-transparent hover:bg-gray-50"} ${classname || ""}`}
              onClick={() => onChange(opt.value)}
            >
              <span className="text-sm">
                {opt.label}
                {suffix ? ` ${suffix}` : ""}
              </span>
              <span
                className={`w-4 h-4 rounded border ml-3 flex items-center justify-center
                           ${selected ? "bg-[var(--pink)] border-[var(--pink)]" : "border-[var(--border)]"}`}
              >
                {selected ? <span className="block w-2 h-2 rounded-sm bg-white" /> : null}
              </span>
            </label>
          );
        })}
        {value && (
          <button
            className="mt-2 self-start text-xs underline text-[var(--tertiary-text)] hover:text-[var(--black)]"
            onClick={() => onChange("")}
            type="button"
          >
            Törlés
          </button>
        )}
      </div>
    </Accordion>
  );
}

/* --------- Kétkaros ár-csúszka --------- */
function PriceRangeSlider({
  title = "Ár",
  minLimit,
  maxLimit,
  valueMin,
  valueMax,
  onChange, // (min, max) => void
  step = 1000,
}) {
  // biztosítsuk, hogy a min <= max és a határokon belül maradjunk
  const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

  const handleMin = (v) => {
    const nv = clamp(toNum(v, minLimit), minLimit, valueMax);
    onChange(nv, valueMax);
  };
  const handleMax = (v) => {
    const nv = clamp(toNum(v, maxLimit), valueMin, maxLimit);
    onChange(valueMin, nv);
  };

  // százalékos pozíciók a track kitöltéséhez
  const pct = (v) => ((v - minLimit) / (maxLimit - minLimit)) * 100;
  const left = pct(valueMin);
  const right = pct(valueMax);

  return (
    <Accordion title={title} defaultOpen={false}>
      <div className="flex flex-col gap-3 px-4 py-2">
        {/* értékmezők */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="text-xs text-gray-500">Min</label>
            <input
              type="number"
              value={valueMin}
              min={minLimit}
              max={valueMax}
              step={step}
              onChange={(e) => handleMin(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500">Max</label>
            <input
              type="number"
              value={valueMax}
              min={valueMin}
              max={maxLimit}
              step={step}
              onChange={(e) => handleMax(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>

        {/* dupla range track */}
        <div className="relative w-full h-10 flex items-center">
          <div className="absolute inset-x-0 h-1 bg-gray-200 rounded-full" />
          <div
            className="absolute h-1 bg-[var(--pink)] rounded-full"
            style={{ left: `${left}%`, right: `${100 - right}%` }}
          />
          {/* valójában két range input egymás felett */}
          <input
            type="range"
            min={minLimit}
            max={maxLimit}
            step={step}
            value={valueMin}
            onChange={(e) => handleMin(e.target.value)}
            className="absolute w-full appearance-none bg-transparent pointer-events-auto"
            style={{ zIndex: 2 }}
          />
          <input
            type="range"
            min={minLimit}
            max={maxLimit}
            step={step}
            value={valueMax}
            onChange={(e) => handleMax(e.target.value)}
            className="absolute w-full appearance-none bg-transparent pointer-events-auto"
            style={{ zIndex: 3 }}
          />
        </div>

        <div className="text-xs text-gray-500">
          Kiválasztott tartomány: <strong>{valueMin.toLocaleString("hu-HU")} Ft</strong> –{" "}
          <strong>{valueMax.toLocaleString("hu-HU")} Ft</strong>
        </div>

        {/* gyors törlés */}
        <div>
          <button
            type="button"
            className="text-xs underline text-[var(--tertiary-text)] hover:text-[var(--black)]"
            onClick={() => onChange(minLimit, maxLimit)}
          >
            Tartomány visszaállítása
          </button>
        </div>
      </div>
    </Accordion>
  );
}

/* --------- A fő komponens --------- */
export default function FilterSection({ slug }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const { close } = useFilterDrawer();

  // facettek + árhatárok
  const [loading, setLoading] = useState(false);
  const [facet, setFacet] = useState({
    color: [],
    category: [],
    stock: [],
    warranty: [],
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
    priceMinLimit: 0,
    priceMaxLimit: 0,
  });

  // draft (URL->induló értékek)
  const [draft, setDraft] = useState({
    arrange: "",
    color: "",
    category: "",
    stock: "",
    warranty: "",
    pricerange: "", // továbbra is ezt írjuk URL-be, pl: "3000-25000"
    size: "",
    weightrange: "",
    material: "",
    charging: "",
    chargingtime: "",
    noise: "",
    waterproof: "",
    usetime: "",
    modes: "",
    speed: "",
    controll: "",
    app: "",
    // slider belső értékei (számként)
    priceMin: 0,
    priceMax: 0,
  });

  // URL -> draft frissítés
  useEffect(() => {
    const get = (k) => searchParams.get(k) || "";

    // pricerange parse (min-max vagy min+)
    const pr = get("pricerange");
    let parsedMin = draft.priceMin;
    let parsedMax = draft.priceMax;
    if (pr) {
      if (pr.includes("-")) {
        const [minS, maxS] = pr.split("-");
        parsedMin = toNum(minS, draft.priceMin);
        parsedMax = toNum(maxS, draft.priceMax);
      } else if (pr.endsWith("+")) {
        parsedMin = toNum(pr.replace("+", ""), draft.priceMin);
        // max marad a limit
      }
    }

    setDraft((d) => ({
      ...d,
      arrange: get("arrange"),
      color: get("color"),
      category: get("category"),
      stock: get("stock"),
      warranty: get("warranty"),
      pricerange: pr,
      size: get("size"),
      weightrange: get("weightrange"),
      material: get("material"),
      charging: get("charging"),
      chargingtime: get("chargingtime"),
      noise: get("noise"),
      waterproof: get("waterproof"),
      usetime: get("usetime"),
      modes: get("modes"),
      speed: get("speed"),
      controll: get("controll"),
      app: get("app"),
      priceMin: parsedMin || d.priceMin,
      priceMax: parsedMax || d.priceMax,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // facettek + árhatárok betöltése
  const loadFacets = useCallback(async () => {
    setLoading(true);

    // ha van slug, vegyük a kategóriát
    let parent = null;
    if (slug) {
      const { data: parentCat } = await supabase
        .from("product-categories")
        .select("id, nev, slug, szulo")
        .eq("slug", String(slug).toLowerCase())
        .maybeSingle();
      parent = parentCat || null;
    }

    // összes kateg fog kelleni a child opciókhoz
    const { data: allCats = [] } = await supabase
      .from("product-categories")
      .select("id, nev, slug, szulo");

    const catById = new Map(allCats.map((c) => [c.id, c]));

    // csak a szükséges oszlopok
    const { data: allProductsRaw = [] } = await supabase
      .from("products")
      .select(
        [
          "id",
          "kategoria",
          "kozzeteve",
          "eladasi_ar_brutto",
          "akcios_ar_brutto",
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
      .limit(5000); // facethez bőven elég

    // kategória leszűrés (ha van parent)
    const allProducts = parent
      ? allProductsRaw.filter((p) => pathContainsId(p.kategoria, parent.id))
      : allProductsRaw;

    // árhatárok felmérése – akciós ár előnyben, különben eladási ár
    let minPrice = Number.POSITIVE_INFINITY;
    let maxPrice = 0;
    const priceOf = (p) =>
      Number.isFinite(p?.akcios_ar_brutto) && p.akcios_ar_brutto > 0
        ? Number(p.akcios_ar_brutto)
        : Number(p?.eladasi_ar_brutto ?? 0);

    for (const p of allProducts) {
      const price = priceOf(p);
      if (Number.isFinite(price) && price > 0) {
        minPrice = Math.min(minPrice, price);
        maxPrice = Math.max(maxPrice, price);
      }
    }
    if (!Number.isFinite(minPrice)) minPrice = 0;

    // facet opciók
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
    const setStock = new Set(["instock", "out-of-stock"]);
    const setChildCatIds = new Set();

    for (const p of allProducts) {
      if (p.szin) splitMulti(p.szin).forEach((v) => setColor.add(v));
      if (p.meretek) splitMulti(p.meretek).forEach((v) => setSize.add(v));
      if (p.suly) setWeight.add(norm(p.suly));
      if (p.anyag) splitMulti(p.anyag).forEach((v) => setMaterial.add(v));
      if (p.toltes) splitMulti(p.toltes).forEach((v) => setCharging.add(v));
      if (p.toltesi_ido) splitMulti(p.toltesi_ido).forEach((v) => setChargingTime.add(v));
      if (p.zajszint) splitMulti(p.zajszint).forEach((v) => setNoise.add(v));
      if (p.vizallosag) splitMulti(p.vizallosag).forEach((v) => setWaterproof.add(v));
      if (p.hasznalati_ido) splitMulti(p.hasznalati_ido).forEach((v) => setUseTime.add(v));
      if (p.vibracios_modok) splitMulti(p.vibracios_modok).forEach((v) => setModes.add(v));
      if (p.sebessegfokozatok) splitMulti(p.sebessegfokozatok).forEach((v) => setSpeed.add(v));
      if (p.vezerles) splitMulti(p.vezerles).forEach((v) => setControll.add(v));
      if (p.applikacio) splitMulti(p.applikacio).forEach((v) => setApp.add(v.toLowerCase()));
      if (p.garancia) {
        const raw = norm(p.garancia).toLowerCase();
        const m = raw.match(/(\d+)/);
        if (m) setWarranty.add(`${m[1]}-year`);
        else setWarranty.add(raw);
      }
      if (typeof p.keszlet === "number") setStock.add(p.keszlet > 0 ? "instock" : "out-of-stock");
      if (parent) {
        const paths = safeParseJSON(p.kategoria) || [];
        for (const path of paths) {
          if (!Array.isArray(path)) continue;
          const idx = path.indexOf(parent.id);
          if (idx >= 0 && idx + 1 < path.length) setChildCatIds.add(path[idx + 1]);
        }
      }
    }

    const toOptions = (s) =>
      Array.from(s)
        .map((v) => ({ label: v, value: String(v) }))
        .sort((a, b) => a.label.localeCompare(b.label, "hu"));

    const categoryOptions = parent
      ? Array.from(setChildCatIds)
          .map((id) => catById.get(id))
          .filter(Boolean)
          .map((c) => ({ label: c.nev, value: c.slug }))
          .sort((a, b) => a.label.localeCompare(b.label, "hu"))
      : [];

    setFacet({
      color: toOptions(setColor),
      category: categoryOptions,
      stock: toOptions(setStock),
      warranty: toOptions(setWarranty),
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
      priceMinLimit: Math.floor(minPrice),
      priceMaxLimit: Math.ceil(maxPrice),
    });

    // ha nincs még beállítva a slider értéke, állítsuk a határokra
    setDraft((d) => ({
      ...d,
      priceMin: d.priceMin || Math.floor(minPrice),
      priceMax: d.priceMax || Math.ceil(maxPrice),
      // ha a URL-ben volt pricerange, azt felül nem írjuk; csak defaultolunk
      pricerange: d.pricerange || `${Math.floor(minPrice)}-${Math.ceil(maxPrice)}`,
    }));

    setLoading(false);
  }, [slug, supabase]);

  useEffect(() => {
    loadFacets();
  }, [loadFacets]);

  const setField = (key, value) => setDraft((d) => ({ ...d, [key]: value }));

  // APPLY: draft -> URL (pricerange a sliderből kerül fel)
  const applyFilters = () => {
    const params = new URLSearchParams(window.location.search);

    // pricerange formázása "min-max"
    const pr = `${draft.priceMin}-${draft.priceMax}`;
    const next = {
      ...draft,
      pricerange: pr,
    };

    Object.entries(next).forEach(([k, v]) => {
      if (["priceMin", "priceMax"].includes(k)) return; // belső mezők
      if (v) params.set(k, v);
      else params.delete(k);
    });

    // lapozás nullázása
    params.delete("page");
    router.push(`?${params.toString()}`);
    close();
  };

  const resetFilters = () => {
    setDraft((d) => ({
      arrange: "",
      color: "",
      category: "",
      stock: "",
      warranty: "",
      pricerange: "",
      size: "",
      weightrange: "",
      material: "",
      charging: "",
      chargingtime: "",
      noise: "",
      waterproof: "",
      usetime: "",
      modes: "",
      speed: "",
      controll: "",
      app: "",
      priceMin: facet.priceMinLimit || 0,
      priceMax: facet.priceMaxLimit || 0,
    }));
    const params = new URLSearchParams(window.location.search);
    Array.from(params.keys()).forEach((k) => params.delete(k));
    router.push(`?${params.toString()}`);
    close();
  };

  return (
    <div className="relative">
      {/* Ár – kétkaros csúszka */}
      {facet.priceMaxLimit > facet.priceMinLimit && (
        <PriceRangeSlider
          title="Ár"
          minLimit={facet.priceMinLimit}
          maxLimit={facet.priceMaxLimit}
          valueMin={draft.priceMin || facet.priceMinLimit}
          valueMax={draft.priceMax || facet.priceMaxLimit}
          onChange={(min, max) => setDraft((d) => ({ ...d, priceMin: min, priceMax: max }))}
          step={1000}
        />
      )}

      {/* Egyéb harmonikák */}
      {facet.category?.length > 0 && (
        <DraftAccordionSelect
          title="Kategória"
          value={draft.category}
          onChange={(v) => setField("category", v)}
          options={facet.category}
        />
      )}
      {facet.color?.length > 0 && (
        <DraftAccordionSelect
          title="Szín"
          value={draft.color}
          onChange={(v) => setField("color", v)}
          options={facet.color}
        />
      )}
      {facet.stock?.length > 0 && (
        <DraftAccordionSelect
          title="Raktárkészlet"
          value={draft.stock}
          onChange={(v) => setField("stock", v)}
          options={facet.stock}
        />
      )}
      {facet.warranty?.length > 0 && (
        <DraftAccordionSelect
          title="Garancia"
          value={draft.warranty}
          onChange={(v) => setField("warranty", v)}
          options={facet.warranty}
        />
      )}
      {facet.size?.length > 0 && (
        <DraftAccordionSelect
          title="Méret"
          value={draft.size}
          onChange={(v) => setField("size", v)}
          options={facet.size}
        />
      )}
      {facet.weightrange?.length > 0 && (
        <DraftAccordionSelect
          title="Súly"
          value={draft.weightrange}
          onChange={(v) => setField("weightrange", v)}
          options={facet.weightrange}
          suffix="gr"
        />
      )}
      {facet.material?.length > 0 && (
        <DraftAccordionSelect
          title="Anyag"
          value={draft.material}
          onChange={(v) => setField("material", v)}
          options={facet.material}
        />
      )}
      {facet.charging?.length > 0 && (
        <DraftAccordionSelect
          title="Töltés"
          value={draft.charging}
          onChange={(v) => setField("charging", v)}
          options={facet.charging}
        />
      )}
      {facet.chargingtime?.length > 0 && (
        <DraftAccordionSelect
          title="Töltési idő"
          value={draft.chargingtime}
          onChange={(v) => setField("chargingtime", v)}
          options={facet.chargingtime}
          suffix="perc"
        />
      )}
      {facet.noise?.length > 0 && (
        <DraftAccordionSelect
          title="Zajszint"
          value={draft.noise}
          onChange={(v) => setField("noise", v)}
          options={facet.noise}
        />
      )}
      {facet.waterproof?.length > 0 && (
        <DraftAccordionSelect
          title="Vízállóság"
          value={draft.waterproof}
          onChange={(v) => setField("waterproof", v)}
          options={facet.waterproof}
        />
      )}
      {facet.usetime?.length > 0 && (
        <DraftAccordionSelect
          title="Használati idő"
          value={draft.usetime}
          onChange={(v) => setField("usetime", v)}
          options={facet.usetime}
          suffix="perc"
        />
      )}
      {facet.modes?.length > 0 && (
        <DraftAccordionSelect
          title="Használati módok"
          value={draft.modes}
          onChange={(v) => setField("modes", v)}
          options={facet.modes}
        />
      )}
      {facet.speed?.length > 0 && (
        <DraftAccordionSelect
          title="Sebesség fokozatok"
          value={draft.speed}
          onChange={(v) => setField("speed", v)}
          options={facet.speed}
        />
      )}
      {facet.controll?.length > 0 && (
        <DraftAccordionSelect
          title="Irányítás"
          value={draft.controll}
          onChange={(v) => setField("controll", v)}
          options={facet.controll}
        />
      )}
      {facet.app?.length > 0 && (
        <DraftAccordionSelect
          title="Applikáció"
          value={draft.app}
          onChange={(v) => setField("app", v)}
          options={facet.app}
          classname="mb-8"
        />
      )}

      {/* Lábléc gombok */}
      <div className="sticky bottom-0 left-0 py-4 px-4 flex items-center justify-between gap-3 bg-white">
        <div className="absolute -top-16 left-0 w-full h-16 bg-gradient-to-t from-white to-transparent pointer-events-none z-1000"></div>
        <div className="relative flex gap-2 text-sm">
          <button
            onClick={applyFilters}
            className="px-4 h-9 rounded-full bg-[var(--green)] text-white hover:bg-[var(--green-hover)] transition"
          >
            Alkalmaz
          </button>
          <button
            onClick={resetFilters}
            className="px-4 h-9 rounded-full border border-[var(--border)] hover:bg-[var(--border)]/40 transition min-w-fit"
            type="button"
          >
            Szűrők törlése
          </button>
        </div>
      </div>
    </div>
  );
}
