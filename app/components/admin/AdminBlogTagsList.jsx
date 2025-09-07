"use client";

import React, { useContext, useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { AdminMenuContext } from "@/app/AdminContext";
import { TbExternalLink, TbEdit } from "react-icons/tb";
import { createClient } from "@/utils/supabase/client";

// --- rövidítés max karakterszámra ---
const MAX_DESC = 120;
function truncateText(s, max = MAX_DESC) {
  if (!s) return "";
  const text = String(s).trim().replace(/\s+/g, " ");
  if (text.length <= max) return text;
  const boundary = text.lastIndexOf(" ", max - 1);
  const cut = boundary >= Math.floor(max * 0.6) ? boundary : max;
  return text.slice(0, cut).replace(/[.,;:!?-]+$/, "").trimEnd() + "…";
}

export default function AdminBlogTagsList({ tags }) {
  const { searchTerm } = useContext(AdminMenuContext);
  const supabase = useMemo(() => createClient(), []);

  // saját state + prop szinkron
  const [rows, setRows] = useState(tags || []);
  useEffect(() => { setRows(tags || []); }, [tags]);

  // refetch az adatbázisból
  const refetch = useCallback(async () => {
    const { data, error } = await supabase
      .from("blog-tags")
      .select("*")
      .order("id", { ascending: true });
    if (!error) setRows(data || []);
  }, [supabase]);

  // custom event figyelése
  useEffect(() => {
    const onChanged = () => refetch();
    window.addEventListener("admin:tags:changed", onChanged);
    return () => window.removeEventListener("admin:tags:changed", onChanged);
  }, [refetch]);

  // keresés
  const filtered = useMemo(() => {
    if (!searchTerm) return rows;
    const term = searchTerm.toLowerCase();
    return (rows || []).filter((c) => {
      return (
        c.id?.toString().toLowerCase().includes(term) ||
        c.nev?.toLowerCase().includes(term) ||
        c.slug?.toLowerCase().includes(term) ||
        c.leiras?.toLowerCase().includes(term)
      );
    });
  }, [rows, searchTerm]);

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
      <div className="hidden md:block px-6">
        <div className="w-full overflow-x-auto border border-[var(--border)] rounded-2xl">
          <table className="w-full table-auto text-sm">
            <thead className="bg-[#f5f5f5] sticky top-0 z-10">
              <tr>
                <th className="text-left font-semibold px-3 py-3 min-w-[260px]">Név</th>
                <th className="text-left font-semibold px-3 py-3 min-w-[220px]">Slug</th>
                <th className="text-left font-semibold px-3 py-3 min-w-[420px]">Leírás</th>
                <th className="text-left font-semibold px-3 py-3 min-w-[140px]">Állapot</th>
                <th className="text-right font-semibold px-3 py-3 min-w-[140px]">Műveletek</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {filtered.map((tag) => {
                const href = `/blog/cimkek/${encodeURIComponent(tag.slug || "")}`;

                return (
                  <tr
                    key={tag.id}
                    className="border-t border-[var(--border)] hover:bg-gray-50"
                  >
                    {/* Név + ID */}
                    <td className="px-3 py-3 align-middle">
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{tag.nev}</div>
                        <div className="text-xs text-gray-500 truncate">#{tag.id}</div>
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="px-3 py-3 align-middle">
                      {tag.slug ? (
                        <span className="font-medium">{tag.slug}</span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>

                    {/* Leírás – max hossz, title-ben teljes szöveg */}
                    <td className="px-3 py-3 align-middle">
                      {tag.leiras ? (
                        <span title={tag.leiras}>{truncateText(tag.leiras)}</span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>

                    {/* Állapot */}
                    <td className="px-3 py-3 align-middle">
                      {tag.kozzeteve ? (
                        <span className="font-bold text-[var(--green)]">Közzétéve</span>
                      ) : (
                        <span className="font-bold text-[var(--warning)]">Vázlat</span>
                      )}
                    </td>

                    {/* Műveletek – fél-fél kattintható terület */}
                    <td className="pl-3 align-middle">
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
                          href={`/admin/blogcimkek/${tag.id}`}
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
        {filtered.map((tag) => {
          const href = `/blog/cimkek/${encodeURIComponent(tag.slug || "")}`;

          return (
            <div
              key={tag.id}
              className="border border-[var(--border)] bg-white rounded-2xl p-3"
            >
              <div className="flex items-center gap-3">
                <div className="min-w-0">
                  <div className="font-semibold">{tag.nev}</div>
                  <div className="text-xs text-gray-500">#{tag.id}</div>
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
                    href={`/admin/blogcimkek/${tag.id}`}
                    aria-label="Szerkesztés"
                  >
                    <TbEdit />
                  </Link>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                <div className="text-gray-500">Slug</div>
                <div className="font-medium">
                  {tag.slug || <span className="text-gray-500">—</span>}
                </div>

                <div className="text-gray-500">Leírás</div>
                <div className="font-medium" title={tag.leiras || ""}>
                  {tag.leiras ? truncateText(tag.leiras) : <span className="text-gray-500">—</span>}
                </div>

                <div className="text-gray-500">Állapot</div>
                <div className="font-bold">
                  {tag.kozzeteve ? (
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
