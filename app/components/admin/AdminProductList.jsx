"use client";

import React, { useContext, useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import Label from "../UI/Texts/Label";
import { AdminMenuContext } from "@/app/AdminContext";
import { TbExternalLink, TbEdit } from "react-icons/tb";
import { createClient } from "@/utils/supabase/client";

// --- segédek ---
function parseCategoryPaths(kategoria) {
  if (!kategoria) return [];
  if (Array.isArray(kategoria)) return kategoria;
  if (typeof kategoria === "string") {
    const s = kategoria.trim();
    if (!s) return [];
    try {
      const parsed = JSON.parse(s);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function breadcrumbFromPath(pathIds, byId) {
  return pathIds.map((id) => byId.get(String(id))?.nev || `#${id}`).join(" > ");
}

function slugFromBreadcrumb(bc) {
  return bc
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s*>\s*/g, "/")
    .replace(/[^a-z0-9/]+/gi, "-")
    .replace(/\/+/g, "/")
    .replace(/-+/g, "-")
    .replace(/^\/|\/$/g, "");
}

// cimkék mező (ID-k) normalizálása -> number[]
function parseTagIds(cimkek) {
  if (!cimkek) return [];
  if (Array.isArray(cimkek)) {
    return cimkek.map((n) => Number(n)).filter(Number.isFinite);
  }
  if (typeof cimkek === "string") {
    const s = cimkek.trim();
    if (!s) return [];
    // 1) próbáljuk JSON-ként
    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) {
        return parsed.map((n) => Number(n)).filter(Number.isFinite);
      }
    } catch {
      // 2) fallback: összes szám begyűjtése pl. "2,3" vagy "[2,3]" vagy "2; 3"
      const nums = s.match(/\d+/g)?.map((x) => Number(x)) || [];
      return nums.filter(Number.isFinite);
    }
  }
  return [];
}

export default function AdminProductList({ products }) {
  const { searchTerm } = useContext(AdminMenuContext);
  const supabase = useMemo(() => createClient(), []);

  // adatsorok
  const [rows, setRows] = useState(products || []);
  useEffect(() => { setRows(products || []); }, [products]);

  // újrahúzás
  const refetch = useCallback(async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("letrehozva", { ascending: true });
    if (!error) setRows(data || []);
  }, [supabase]);

  // frissítés a custom eventre
  useEffect(() => {
    const onChanged = () => refetch();
    window.addEventListener("admin:products:changed", onChanged);
    return () => window.removeEventListener("admin:products:changed", onChanged);
  }, [refetch]);

  // kategóriák egyszer
  const [cats, setCats] = useState([]);
  useEffect(() => {
    supabase
      .from("product-categories")
      .select("id, nev, slug, szulo")
      .order("nev", { ascending: true })
      .then(({ data, error }) => setCats(error ? [] : (data || [])));
  }, [supabase]);

  const catById = useMemo(() => {
    const m = new Map();
    cats.forEach((c) => m.set(String(c.id), c));
    return m;
  }, [cats]);

  const productBreadcrumbs = (product) => {
    const paths = parseCategoryPaths(product.kategoria);
    if (!paths.length) return [];
    return paths.map((p) => breadcrumbFromPath(p, catById)).filter(Boolean);
  };

  // --- CÍMKÉK: táblából névleképezés ---
  const [tags, setTags] = useState([]);
  useEffect(() => {
    supabase
      .from("product-tags")
      .select("id, nev, slug")
      .order("nev", { ascending: true })
      .then(({ data, error }) => setTags(error ? [] : (data || [])));
  }, [supabase]);

  const tagById = useMemo(() => {
    const m = new Map();
    tags.forEach((t) => m.set(String(t.id), t));
    return m;
  }, [tags]);

  const productTagNames = (product) => {
    const ids = parseTagIds(product.cimkek); // products.cimkek: TEXT "[2,3]"
    if (!ids.length) return [];
    return ids.map((id) => tagById.get(String(id))?.nev).filter(Boolean);
  };

  // keresés a rows-on (címkenevekben is)
  const filtered = useMemo(() => {
    if (!searchTerm) return rows;
    const term = searchTerm.toLowerCase();
    return (rows || []).filter((p) => {
      const bcs = productBreadcrumbs(p).join(" ; ").toLowerCase();
      const tagText = productTagNames(p).join(" ; ").toLowerCase();
      return (
        p.id?.toString().toLowerCase().includes(term) ||
        p.cikkszam?.toLowerCase().includes(term) ||
        p.vonalkod?.toLowerCase().includes(term) ||
        p.seo_slug?.toLowerCase().includes(term) ||
        p.szallito_nev?.toLowerCase().includes(term) ||
        p.gyarto?.toLowerCase().includes(term) ||
        p.anyag?.toLowerCase().includes(term) ||
        p.kulso_anyag?.toLowerCase().includes(term) ||
        p.belso_anyag?.toLowerCase().includes(term) ||
        p.tok_szin?.toLowerCase().includes(term) ||
        p.alcim?.toLowerCase().includes(term) ||
        p.meta_leiras?.toLowerCase().includes(term) ||
        p.termekleiras?.toLowerCase().includes(term) ||
        bcs.includes(term) ||
        tagText.includes(term)   // <-- címkenevekben is keresünk
      );
    });
  }, [rows, searchTerm, catById, tagById]);

  if (!rows || rows.length === 0) {
    return (
      <div className="flex flex-col gap-2 animate-pulse px-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-[var(--border)] rounded-2xl w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 px-6">
      {filtered.map((product) => {
        const bcs = productBreadcrumbs(product);
        const primaryBc = bcs[0] || "";
        const categorySlugPath = primaryBc ? slugFromBreadcrumb(primaryBc) : "";
        const tagNames = productTagNames(product); // ["Elegáns", "Bőr", ...]

        return (
          <div
            key={product.id}
            className="relative flex flex-row justify-between border border-[var(--border)] bg-white rounded-2xl cursor-pointer"
          >
            <div className="flex flex-row w-full ">
              <Image
                src={product.termekkep || "/default.png"}
                width={50}
                height={50}
                alt={product.seo_slug || "termek-kep"}
                className="mr-4 rounded-md m-2"
              />

              <div className="flex flex-col gap-2 justify-center w-40 border-r border-[var(--border)]">
                <Label classname="font-bold">{product.fo_cim}</Label>
                <Label>{product.cikkszam}</Label>
              </div>

              <div className="flex flex-col gap-1 w-80 justify-center items-center border-r border-[var(--border)] px-2 text-center">
                {bcs.length === 0 ? (
                  <Label classname="font-bold text-center text-gray-500">—</Label>
                ) : (
                  bcs.map((bc, i) => (
                    <Label key={i} classname="font-bold text-center">
                      {bc}
                    </Label>
                  ))
                )}
              </div>

              {/* CÍMKÉK NÉVVEL */}
              <div className="flex flex-col gap-2 w-30 justify-center items-center border-r border-[var(--border)] px-2">
                {tagNames.length ? (
                  <Label classname="font-bold text-center">{tagNames.join(", ")}</Label>
                ) : (
                  <Label classname="text-center text-gray-500">—</Label>
                )}
              </div>

              <div className="flex flex-col gap-2 justify-center items-center w-30 border-r border-[var(--border)] px-2">
                <Label classname="text-[var(--green)] font-bold text-center">
                  {product.eladasi_ar_brutto || product.akcios_ar_brutto} Ft
                </Label>
              </div>

              <div className="flex flex-col gap-2 justify-center items-center w-30 border-r border-[var(--border)] px-2">
                <Label classname="font-bold text-center">{product.keszlet} db</Label>
              </div>

              <div className="flex flex-col gap-2 w-30 justify-center items-center border-r border-[var(--border)] px-2">
                {product.kozzeteve ? (
                  <Label classname="font-bold text-center text-[var(--green)]">Közzétéve</Label>
                ) : (
                  <Label classname="font-bold text-center text-[var(--warning)]">Vázlat</Label>
                )}
              </div>
            </div>

            <div className="flex flex-row items-center justify-end gap-8 px-8 w-full">
              <Link
                href={
                  categorySlugPath
                    ? `/termekek/${categorySlugPath}/${product.seo_slug}`
                    : `/termekek/${product.seo_slug}`
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                <TbExternalLink className="text-[var(--pink)]" />
              </Link>

              <Link href={`/admin/termekek/${product.seo_slug}`}>
                <TbEdit />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
