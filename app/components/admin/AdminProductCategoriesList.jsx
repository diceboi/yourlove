"use client";

import React, { useContext, useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import Label from "../UI/Texts/Label";
import { AdminMenuContext } from "@/app/AdminContext";
import { TbExternalLink, TbEdit } from "react-icons/tb";
import { createClient } from "@/utils/supabase/client";

export default function AdminProductCategoriesList({ categories }) {
  const { searchTerm } = useContext(AdminMenuContext);
  const supabase = useMemo(() => createClient(), []);

  const [rows, setRows] = useState(categories || []);
  useEffect(() => { setRows(categories || []); }, [categories]);

  const refetch = useCallback(async () => {
    const { data, error } = await supabase
      .from("product-categories")
      .select("*")
      .order("id", { ascending: true });
    if (!error) setRows(data || []);
  }, [supabase]);

  useEffect(() => {
    const onChanged = () => refetch();
    window.addEventListener("admin:categories:changed", onChanged);
    return () => window.removeEventListener("admin:categories:changed", onChanged);
  }, [refetch]);

  const byId = useMemo(() => {
    const m = new Map();
    (rows || []).forEach((c) => m.set(String(c.id), c));
    return m;
  }, [rows]);

  const makeBreadcrumb = (cat) => {
    if (!cat) return "";
    const parents = [];
    const seen = new Set();
    let pid = cat.szulo ?? null;
    let depth = 0;

    while (pid != null && depth < 10) {
      const key = String(pid);
      if (seen.has(key)) break;
      seen.add(key);
      const parent = byId.get(key);
      if (!parent) break;
      parents.push(parent.nev || `#${parent.id}`);
      pid = parent.szulo ?? null;
      depth++;
    }
    parents.reverse();
    parents.push(cat.nev || `#${cat.id}`);
    return parents.join(" > ");
  };

  const buildSlugTrail = (cat) => {
    if (!cat) return [];
    const parts = [];
    const seen = new Set();
    let pid = cat.szulo ?? null;
    let depth = 0;

    while (pid != null && depth < 10) {
      const key = String(pid);
      if (seen.has(key)) break;
      seen.add(key);
      const parent = byId.get(key);
      if (!parent) break;
      if (parent.slug) parts.push(parent.slug);
      pid = parent.szulo ?? null;
      depth++;
    }
    parts.reverse();
    return [...parts, cat.slug].filter(Boolean);
  };

  const filtered = useMemo(() => {
    if (!searchTerm) return rows;
    const term = searchTerm.toLowerCase();
    return (rows || []).filter((c) => {
      const bc = makeBreadcrumb(c).toLowerCase();
      return (
        c.id?.toString().toLowerCase().includes(term) ||
        c.nev?.toLowerCase().includes(term) ||
        c.slug?.toLowerCase().includes(term) ||
        c.leiras_fent?.toLowerCase().includes(term) ||
        c.leiras_lent?.toLowerCase().includes(term) ||
        bc.includes(term) ||
        (c.szulo != null && String(c.szulo).toLowerCase().includes(term))
      );
    });
  }, [rows, searchTerm, byId]);

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
    <>
      {/* ====== Táblázat (md és fölötte) ====== */}
      <div className="hidden md:block px-3 md:px-6">
        <div className="relative w-full max-w-full overflow-x-auto border border-[var(--border)] rounded-2xl">
          <table className="min-w-full text-sm">
            <thead className="bg-[#f5f5f5] sticky top-0 z-10">
              <tr>
                {/* Név – mindig látszik */}
                <th className="text-left font-semibold px-3 py-3">
                  Név
                </th>

                {/* Slug – csak lg-től */}
                <th className="text-left font-semibold px-3 py-3 hidden lg:table-cell">
                  Slug
                </th>

                {/* Elérés (breadcrumb) – xl-től */}
                <th className="text-left font-semibold px-3 py-3 hidden xl:table-cell">
                  Elérés
                </th>

                {/* Állapot – mindig látszik */}
                <th className="text-left font-semibold px-3 py-3">
                  Állapot
                </th>

                {/* Műveletek – jobb oldalt, fix szélesség (nem sticky, csak keskeny) */}
                <th className="text-right font-semibold px-3 py-3 w-[140px] min-w-[140px]">
                  Műveletek
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {filtered.map((category) => {
                const breadcrumb = makeBreadcrumb(category);
                const parts = buildSlugTrail(category).map(encodeURIComponent);
                const href = `/termekek${parts.length ? `/${parts.join("/")}` : ""}`;

                return (
                  <tr
                    key={category.id}
                    className="border-t border-[var(--border)] hover:bg-gray-50"
                  >
                    {/* Név + ID + kép – mindig látszik */}
                    <td className="px-3 py-3 align-middle">
                      <div className="flex items-center gap-3">
                        <Image
                          src={category.kep || "/default.png"}
                          width={48}
                          height={48}
                          alt={category.slug || "kategoria-kep"}
                          className="rounded-md flex-none"
                        />
                        <div className="min-w-0">
                          <div className="font-semibold truncate">{category.nev}</div>
                          <div className="text-xs text-gray-500 truncate">#{category.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Slug – csak lg-től */}
                    <td className="px-3 py-3 align-middle hidden lg:table-cell">
                      {category.slug ? (
                        <span className="font-medium">{category.slug}</span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>

                    {/* Elérés – xl-től */}
                    <td className="px-3 py-3 align-middle hidden xl:table-cell">
                      {breadcrumb ? (
                        <span className="font-medium">{breadcrumb}</span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>

                    {/* Állapot – mindig látszik */}
                    <td className="px-3 py-3 align-middle">
                      {category.kozzeteve ? (
                        <span className="font-bold text-[var(--green)]">Közzétéve</span>
                      ) : (
                        <span className="font-bold text-[var(--warning)]">Vázlat</span>
                      )}
                    </td>

                    {/* Műveletek */}
                    <td className="pl-3 align-middle w-[140px] min-w-[140px]">
                      <div className="flex items-center justify-end gap-0 h-[72px]">
                        <Link
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Megnyitás új lapon"
                          className="flex items-center justify-center hover:bg-white w-1/2 h-full"
                        >
                          <TbExternalLink className="text-[var(--pink)] w-5 h-auto" />
                        </Link>
                        <Link
                          href={`/admin/termekkategoriak/${category.id}`}
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

      {/* ====== Kártyás nézet (mobil, md alatt) ====== */}
      <div className="md:hidden px-3 space-y-2">
        {filtered.map((category) => {
          const breadcrumb = makeBreadcrumb(category);
          const parts = buildSlugTrail(category).map(encodeURIComponent);
          const href = `/termekek${parts.length ? `/${parts.join("/")}` : ""}`;

          return (
            <div
              key={category.id}
              className="border border-[var(--border)] bg-white rounded-2xl p-3"
            >
              <div className="flex items-center gap-3">
                <Image
                  src={category.kep || "/default.png"}
                  width={56}
                  height={56}
                  alt={category.slug || "kategoria-kep"}
                  className="rounded-md flex-none"
                />
                <div className="min-w-0">
                  <div className="font-semibold">{category.nev}</div>
                  <div className="text-xs text-gray-500">#{category.id}</div>
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <Link
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Megnyitás új lapon"
                  >
                    <TbExternalLink className="text-[var(--pink)]" />
                  </Link>
                  <Link
                    href={`/admin/termekkategoriak/${category.id}`}
                    aria-label="Szerkesztés"
                  >
                    <TbEdit />
                  </Link>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                <div className="text-gray-500">Slug</div>
                <div className="font-medium">
                  {category.slug || <span className="text-gray-500">—</span>}
                </div>

                <div className="text-gray-500">Elérés</div>
                <div className="font-medium">
                  {breadcrumb || <span className="text-gray-500">—</span>}
                </div>

                <div className="text-gray-500">Állapot</div>
                <div className="font-bold">
                  {category.kozzeteve ? (
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
