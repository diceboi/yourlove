"use client";

import React, { useContext, useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import Label from "../UI/Texts/Label";
import { AdminMenuContext } from "@/app/AdminContext";
import { TbExternalLink, TbEdit, TbChevronDown } from "react-icons/tb";
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

// ... importok változatlanok

export default function AdminProductList({ products }) {
  const { searchTerm } = useContext(AdminMenuContext);
  const supabase = useMemo(() => createClient(), []);

  // --- állapotok + fetch (változatlan) ---
  const [rows, setRows] = useState(products || []);
  useEffect(() => { setRows(products || []); }, [products]);
  const refetch = useCallback(async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("letrehozva", { ascending: true });
    if (!error) setRows(data || []);
  }, [supabase]);

  useEffect(() => {
    const onChanged = () => refetch();
    window.addEventListener("admin:products:changed", onChanged);
    return () => window.removeEventListener("admin:products:changed", onChanged);
  }, [refetch]);

  // --- kategóriák és címkék (változatlan) ---
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
    const ids = parseTagIds(product.cimkek);
    if (!ids.length) return [];
    return ids.map((id) => tagById.get(String(id))?.nev).filter(Boolean);
  };

  // --- szűrt sorok (változatlan) ---
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
        tagText.includes(term)
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

  // Közös segédfüggvények a megjelenítéshez
  const renderBreadcrumbs = (p) => {
    const bcs = productBreadcrumbs(p);
    if (!bcs.length) return "—";
    return bcs.join(" | ");
  };
  const price = (p) => p.akcios_ar_brutto ?? p.eladasi_ar_brutto;

  return (
    <>
      {/* ====== 1) Táblázat (md és fölötte) ====== */}
      <div className="hidden md:block px-6">
        <div className="relative max-w-full overflow-x-auto border border-[var(--border)] rounded-2xl">
          <table className="min-w-full table-auto text-sm">
            <thead className="bg-[#f5f5f5] sticky top-0 z-10">
              <tr>
                <th className="text-left font-semibold px-3 py-3">Név</th>

                {/* Kategória csak lg-től felfelé */}
                <th className="text-left font-semibold px-3 py-3 hidden lg:table-cell">
                  Kategória
                </th>

                {/* Címkék csak xl-től */}
                <th className="text-left font-semibold px-3 py-3 hidden xl:table-cell">
                  Címkék
                </th>

                <th className="text-left font-semibold px-3 py-3">
                  Ár
                </th>

                {/* Készlet lg-től */}
                <th className="text-left font-semibold px-3 py-3 hidden lg:table-cell">
                  Készlet
                </th>

                {/* Állapot xl-től */}
                <th className="text-left font-semibold px-3 py-3 hidden xl:table-cell">
                  Állapot
                </th>

                <th className="text-right font-semibold px-3 py-3 w-[120px] bg-[#f5f5f5]">
                  Műveletek
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {filtered.map((product) => {
                const bcs = productBreadcrumbs(product);
                const primaryBc = bcs[0] || "";
                const categorySlugPath = primaryBc ? slugFromBreadcrumb(primaryBc) : "";
                const tagNames = productTagNames(product);

                return (
                  <tr
                    key={product.id}
                    className="border-t border-[var(--border)] hover:bg-gray-50"
                  >
                    {/* Név – mindig látszik */}
                    <td className="px-3 py-3 align-middle">
                      <div className="flex items-center gap-3">
                        <Image
                          src={product.termekkep || "/default.png"}
                          width={48}
                          height={48}
                          alt={product.seo_slug || "termek-kep"}
                          className="rounded-md flex-none"
                        />
                        <div className="min-w-0">
                          <div className="font-semibold truncate">{product.fo_cim}</div>
                          <div className="text-xs text-gray-500 truncate">{product.cikkszam}</div>
                        </div>
                      </div>
                    </td>

                    {/* Kategória – csak lg-től */}
                    <td className="px-3 py-3 align-middle hidden lg:table-cell">
                      {bcs.length ? (
                        <div className="flex flex-col">
                          {bcs.map((bc, i) => (
                            <div key={i} className="font-medium">{bc}</div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>

                    {/* Címkék – csak xl-től */}
                    <td className="px-3 py-3 align-middle hidden xl:table-cell">
                      {tagNames.length ? (
                        <span className="font-medium">{tagNames.join(", ")}</span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>

                    {/* Ár – mindig látszik */}
                    <td className="px-3 py-3 align-middle">
                      <span className="text-[var(--green)] font-bold min-w-fit">
                        {price(product)} Ft
                      </span>
                    </td>

                    {/* Készlet – lg-től */}
                    <td className="px-3 py-3 align-middle hidden lg:table-cell">
                      <span className="font-semibold">{product.keszlet} db</span>
                    </td>

                    {/* Állapot – xl-től */}
                    <td className="px-3 py-3 align-middle hidden xl:table-cell">
                      {product.kozzeteve ? (
                        <span className="font-bold text-[var(--green)]">Közzétéve</span>
                      ) : (
                        <span className="font-bold text-[var(--warning)]">Vázlat</span>
                      )}
                    </td>

                    {/* Műveletek – sticky, fix szélesség */}
                    <td className="pl-3 align-middle w-[120px] min-w-[120px] sticky right-0 z-20 bg-white">
                      <div className="flex items-center justify-end gap-0 h-[72px]">
                        <Link
                          href={`/termekek/${product.canonical_path}/${product.seo_slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Megnyitás új lapon"
                          className="flex items-center justify-center hover:bg-white w-1/2 h-full"
                        >
                          <TbExternalLink className="text-[var(--pink)] w-5 h-auto" />
                        </Link>
                        <Link
                          href={`/admin/termekek/${product.seo_slug}`}
                          aria-label="Szerkesztés"
                          className="flex items-center justify-center hover:bg-white w-1/2 h-full"
                        >
                          <TbEdit className="w-5 h-auto" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>

          </table>
        </div>
      </div>

      {/* ====== 2) Kártyás nézet (mobil, md alatt) ====== */}
      <div className="md:hidden px-3 space-y-2">
        {filtered.map((product) => {
          const bcs = productBreadcrumbs(product);
          const primaryBc = bcs[0] || "";
          const categorySlugPath = primaryBc ? slugFromBreadcrumb(primaryBc) : "";
          const tagNames = productTagNames(product);

          return (
            <div
              key={product.id}
              className="border border-[var(--border)] bg-white rounded-2xl p-3"
            >
              <div className="flex items-center gap-3">
                <Image
                  src={product.termekkep || "/default.png"}
                  width={56}
                  height={56}
                  alt={product.seo_slug || "termek-kep"}
                  className="rounded-md flex-none"
                />
                <div className="min-w-0">
                  <div className="font-semibold">{product.fo_cim}</div>
                  <div className="text-xs text-gray-500">{product.cikkszam}</div>
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <Link
                    href={
                      categorySlugPath
                        ? `/termekek/${categorySlugPath}/${product.seo_slug}`
                        : `/termekek/${product.seo_slug}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Megnyitás új lapon"
                  >
                    <TbExternalLink className="text-[var(--pink)]" />
                  </Link>
                  <Link href={`/admin/termekek/${product.seo_slug}`} aria-label="Szerkesztés">
                    <TbEdit />
                  </Link>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                <div className="text-gray-500">Kategória</div>
                <div className="font-medium">
                  {bcs.length ? bcs.join(" | ") : <span className="text-gray-500">—</span>}
                </div>

                <div className="text-gray-500">Címkék</div>
                <div className="font-medium">
                  {tagNames.length ? tagNames.join(", ") : <span className="text-gray-500">—</span>}
                </div>

                <div className="text-gray-500">Ár</div>
                <div className="text-[var(--green)] font-bold">{price(product)} Ft</div>

                <div className="text-gray-500">Készlet</div>
                <div className="font-semibold">{product.keszlet} db</div>

                <div className="text-gray-500">Állapot</div>
                <div className="font-bold">
                  {product.kozzeteve ? (
                    <span className="text-[var(--green)]">Közzétéve</span>
                  ) : (
                    <span className="text-[var(--warning)]">Vázlat</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

