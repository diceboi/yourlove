"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Accordion from "@/app/components/UI/Accordion";
import { useFilterDrawer } from '@/app/components/filter/FilterDrawerProvider'

// --- Kis, helyben használt, “checkbox-stílusú” egyválasztós harmonika ---
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
                         ${selected ? "bg-[var(--grey-bg)] border-[var(--border)]" : "border-transparent hover:bg-gray-50"} ${classname}`}
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
                {selected ? (
                  <span className="block w-2 h-2 rounded-sm bg-white" />
                ) : null}
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

export default function FilterSection({ slug }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const { open, close } = useFilterDrawer()

  // --- Betöltött facettek az adatbázisból ---
  const [loading, setLoading] = useState(false);
  const [facet, setFacet] = useState({
    color: [],
    category: [],
    stock: [],
    warranty: [],
    pricerange: [],
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

  // --- Draft (helyi) űrlapállapot: URL -> induló értékek, majd csak gombra írjuk vissza ---
  const [draft, setDraft] = useState({
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
  });

  // URL -> draft (induló értékek)
  useEffect(() => {
    const get = (k) => searchParams.get(k) || "";
    setDraft((d) => ({
      ...d,
      arrange: get("arrange"),
      color: get("color"),
      category: get("category"),
      stock: get("stock"),
      warranty: get("warranty"),
      pricerange: get("pricerange"),
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
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // ha a lista újrarajzolás miatt változik az URL, frissítjük a draftot is

  // --- Segédek a facet betöltéshez ---
  const norm = (v) => String(v || "").trim();
  const splitMulti = (v) =>
    norm(v)
      .split(/[;,\|/]+/g)
      .map((s) => s.trim())
      .filter(Boolean);

  const pathContainsId = (kategoriaJson, id) => {
    try {
      const paths = JSON.parse(kategoriaJson);
      return Array.isArray(paths) && paths.some((p) => Array.isArray(p) && p.includes(id));
    } catch {
      return false;
    }
  };

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

  // --- Facet betöltés (ugyanaz a logika, mint eddig) ---
  const loadFacets = useCallback(async () => {
    setLoading(true);

    let parent = null;
    if (slug) {
      const { data: parentCat } = await supabase
        .from("product-categories")
        .select("id, nev, slug, szulo")
        .eq("slug", String(slug).toLowerCase())
        .maybeSingle();
      parent = parentCat || null;
    }

    const { data: allCats = [] } = await supabase
      .from("product-categories")
      .select("id, nev, slug, szulo");

    const catById = new Map(allCats.map((c) => [c.id, c]));

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
      .limit(1000);

    const products = parent
      ? allProducts.filter((p) => pathContainsId(p.kategoria, parent.id))
      : allProducts;

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

    for (const p of products) {
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

      if (typeof p.keszlet === "number")
        setStock.add(p.keszlet > 0 ? "instock" : "out-of-stock");

      if (parent) {
        const childId = findDirectChildId(p.kategoria, parent.id);
        if (childId) setChildCatIds.add(childId);
      }
    }

    const categoryOptions = parent
      ? Array.from(setChildCatIds)
          .map((id) => catById.get(id))
          .filter(Boolean)
          .map((c) => ({ label: c.nev, value: c.slug }))
          .sort((a, b) => a.label.localeCompare(b.label, "hu"))
      : [];

    const toOptions = (s) =>
      Array.from(s)
        .map((v) => ({ label: v, value: String(v) }))
        .sort((a, b) => a.label.localeCompare(b.label, "hu"));

    setFacet({
      color: toOptions(setColor),
      category: categoryOptions,
      stock: toOptions(setStock),
      warranty: toOptions(setWarranty),
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

  // --- Draft setter helper ---
  const setField = (key, value) => setDraft((d) => ({ ...d, [key]: value }));

  // --- APPLY: draft -> URL paramok ---
  const applyFilters = () => {
    const params = new URLSearchParams(window.location.search);
    Object.entries(draft).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    // lapozást vedd vissza az első oldalra (ha használsz ?page= paramot a lista alatt)
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  // --- RESET: mindent törlünk (draft + URL) ---
  const resetFilters = () => {
    setDraft({
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
    });
    const params = new URLSearchParams(window.location.search);
    Object.keys(Object.fromEntries(params)).forEach((k) => {
      params.delete(k);
    });
    router.push(`?${params.toString()}`);
  };

  // --- UI ---
  return (
    <div className="relative">
      {/* Rendezés */}
      <div className="mb-2 w-full max-w-xs">
        <Accordion title="Rendezés" defaultOpen={false}>
          <div className="grid grid-cols-1 gap-2">
            {[
              { label: "Ár szerint növekvő", value: "price-low-to-high" },
              { label: "Ár szerint csökkenő", value: "price-high-to-low" },
              { label: "Legújabb", value: "newest" },
              { label: "Értékelés", value: "rating" },
              { label: "Legnépszerűbb", value: "popular" },
              { label: "Legtöbbet keresett", value: "most-searched" },
            ].map((opt) => (
              <label
                key={opt.value}
                className={`text-left text-sm px-2 py-1 rounded cursor-pointer
                            ${draft.arrange === opt.value ? "font-semibold bg-gray-100" : "hover:bg-gray-50"}`}
              >
                <input
                  type="radio"
                  name="arrange"
                  value={opt.value}
                  checked={draft.arrange === opt.value}
                  onChange={() => setField("arrange", opt.value)}
                  className="mr-2"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </Accordion>
      </div>

      {/* Ár (egyválasztós sávvariánsok) — ha slider kell, ide tegyél controlled input range-t */}
      <DraftAccordionSelect
        title="Ár"
        value={draft.pricerange}
        onChange={(v) => setField("pricerange", v)}
        options={facet.pricerange}
      />

      {/* Harmonika szekciók (egyválasztós) */}
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
          classname={"mb-8"}
        />
      )}
      {/* Lábléc: Alkalmaz / Reset */}
      <div className="sticky bottom-0 left-0 py-4 px-4 flex items-center justify-between gap-3 bg-white">
        <div className="absolute -top-16 left-0 w-full h-16 bg-gradient-to-t from-white to-transparent pointer-events-none z-1000"></div>
        <div className="relative flex gap-2 text-sm">
          <button
            onClick={() => {applyFilters(), close()}}
            className="px-4 h-9 rounded-full bg-[var(--pink)] text-white hover:bg-[var(--pink-hover)] transition"
          >
            Alkalmaz
          </button>
          <button
            onClick={() => {resetFilters(), close()}}
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
