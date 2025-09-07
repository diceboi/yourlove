"use client";

import React, { useContext, useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import Label from "../UI/Texts/Label";
import { AdminMenuContext } from "@/app/AdminContext";
import { TbExternalLink, TbEdit } from "react-icons/tb";
import { createClient } from "@/utils/supabase/client";

// --- segédek ---
function parseIds(value) {
  if (value == null) return [];
  if (Array.isArray(value)) return value.map(Number).filter(Number.isFinite);
  if (typeof value === "number") return [value];
  if (typeof value === "string") {
    const s = value.trim();
    if (!s) return [];
    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) return parsed.map(Number).filter(Number.isFinite);
    } catch {
      const nums = s.match(/\d+/g)?.map(Number) || [];
      return nums.filter(Number.isFinite);
    }
  }
  return [];
}

export default function AdminBlogList({ blogs }) {
  const { searchTerm } = useContext(AdminMenuContext);
  const supabase = useMemo(() => createClient(), []);

  // saját state + prop szinkron
  const [rows, setRows] = useState(blogs || []);
  useEffect(() => { setRows(blogs || []); }, [blogs]);

  // refetch az adatbázisból
  const refetch = useCallback(async () => {
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .order("id", { ascending: true });
    if (!error) setRows(data || []);
  }, [supabase]);

  // custom event figyelése
  useEffect(() => {
    const onChanged = () => refetch();
    window.addEventListener("admin:blogs:changed", onChanged);
    return () => window.removeEventListener("admin:blogs:changed", onChanged);
  }, [refetch]);

  // --- blog kategória és címke névleképezés ---
  const [cats, setCats] = useState([]);
  useEffect(() => {
    supabase
      .from("blog-categories")
      .select("id, nev, slug, szulo")
      .order("nev", { ascending: true })
      .then(({ data, error }) => setCats(error ? [] : (data || [])));
  }, [supabase]);

  const catById = useMemo(() => {
    const m = new Map();
    cats.forEach((c) => m.set(String(c.id), c));
    return m;
  }, [cats]);

  const makeCatBreadcrumb = (catId) => {
    if (catId == null) return "";
    const parts = [];
    const seen = new Set();
    let pid = Number(catId);
    let depth = 0;

    while (pid != null && depth < 12) {
      const node = catById.get(String(pid));
      if (!node) break;
      parts.push(node.nev || `#${node.id}`);
      if (node.szulo == null) break;
      const key = String(node.szulo);
      if (seen.has(key)) break;
      seen.add(key);
      pid = Number(node.szulo);
      depth++;
    }
    return parts.reverse().join(" > ");
  };

  const [blogTags, setBlogTags] = useState([]);
  useEffect(() => {
    supabase
      .from("blog-tags")
      .select("id, nev, slug")
      .order("nev", { ascending: true })
      .then(({ data, error }) => setBlogTags(error ? [] : (data || [])));
  }, [supabase]);

  const tagById = useMemo(() => {
    const m = new Map();
    blogTags.forEach((t) => m.set(String(t.id), t));
    return m;
  }, [blogTags]);

  const blogCategoryTexts = (blog) => {
    // elfogad: blog.kategoria vagy blog.kategoriak
    const ids = parseIds(blog.kategoriak ?? blog.kategoria);
    if (!ids.length) return [];
    return ids.map((id) => makeCatBreadcrumb(id)).filter(Boolean);
  };

  const blogTagNames = (blog) => {
    // elfogad: blog.cimkek vagy blog.tags
    const ids = parseIds(blog.cimkek ?? blog.tags);
    if (!ids.length) return [];
    return ids.map((id) => tagById.get(String(id))?.nev).filter(Boolean);
  };

  // keresés
  const filtered = useMemo(() => {
    if (!searchTerm) return rows;
    const term = searchTerm.toLowerCase();
    return (rows || []).filter((b) => {
      const catsTxt = blogCategoryTexts(b).join(" ; ").toLowerCase();
      const tagsTxt = blogTagNames(b).join(" ; ").toLowerCase();
      return (
        b.id?.toString().toLowerCase().includes(term) ||
        b.cim?.toLowerCase().includes(term) ||          // blog cím
        b.nev?.toLowerCase().includes(term) ||          // ha nálad "nev"-ként van
        b.slug?.toLowerCase().includes(term) ||
        b.kivonat?.toLowerCase().includes(term) ||
        b.leiras?.toLowerCase().includes(term) ||
        catsTxt.includes(term) ||
        tagsTxt.includes(term)
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

  // kép mező becslés (borítókép)
  const getCover = (b) => b.kep || b.og_image || b.cover || "/default.png";

  return (
    <>
      {/* ====== Táblázat (md és fölötte) ====== */}
      <div className="hidden md:block px-6">
        <div className="w-full overflow-x-auto border border-[var(--border)] rounded-2xl">
          <table className="w-full table-auto text-sm">
            <thead className="bg-[#f5f5f5] sticky top-0 z-10">
              <tr>
                <th className="text-left font-semibold px-3 py-3 min-w-[260px]">Cím</th>
                <th className="text-left font-semibold px-3 py-3 min-w-[220px]">Slug</th>
                <th className="text-left font-semibold px-3 py-3">Kategória</th>
                <th className="text-left font-semibold px-3 py-3">Címkék</th>
                <th className="text-left font-semibold px-3 py-3 min-w-[140px]">Állapot</th>
                <th className="text-right font-semibold px-3 py-3 min-w-[140px]">Műveletek</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {filtered.map((blog) => {
                const href = `/blog/${encodeURIComponent(blog.slug || "")}`;
                const catsTxt = blogCategoryTexts(blog);
                const tagsTxt = blogTagNames(blog);

                return (
                  <tr
                    key={blog.id}
                    className="border-t border-[var(--border)] hover:bg-gray-50"
                  >
                    {/* Cím + ID + kép */}
                    <td className="px-3 py-3 align-middle">
                      <div className="flex items-center gap-3">
                        <Image
                          src={getCover(blog)}
                          width={48}
                          height={48}
                          alt={blog.slug || "blog-kep"}
                          className="rounded-md flex-none object-cover"
                        />
                        <div className="min-w-0">
                          <div className="font-semibold truncate">{blog.cim || blog.nev}</div>
                          <div className="text-xs text-gray-500 truncate">#{blog.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="px-3 py-3 align-middle">
                      {blog.slug ? (
                        <span className="font-medium">{blog.slug}</span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>

                    {/* Kategória(ák) */}
                    <td className="px-3 py-3 align-middle">
                      {catsTxt.length ? (
                        <div className="flex flex-col">
                          {catsTxt.map((t, i) => (
                            <span key={i} className="font-medium line-clamp-2">{t}</span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>

                    {/* Címkék */}
                    <td className="px-3 py-3 align-middle">
                      {tagsTxt.length ? (
                        <span className="font-medium line-clamp-2">{tagsTxt.join(", ")}</span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>

                    {/* Állapot */}
                    <td className="px-3 py-3 align-middle">
                      {blog.kozzeteve ? (
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
                          href={`/admin/blogok/${blog.id}`}
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
        {filtered.map((blog) => {
          const href = `/blog/${encodeURIComponent(blog.slug || "")}`;
          const catsTxt = blogCategoryTexts(blog);
          const tagsTxt = blogTagNames(blog);

          return (
            <div
              key={blog.id}
              className="border border-[var(--border)] bg-white rounded-2xl p-3"
            >
              <div className="flex items-center gap-3">
                <Image
                  src={getCover(blog)}
                  width={56}
                  height={56}
                  alt={blog.slug || "blog-kep"}
                  className="rounded-md flex-none object-cover"
                />
                <div className="min-w-0">
                  <div className="font-semibold">{blog.cim || blog.nev}</div>
                  <div className="text-xs text-gray-500">#{blog.id}</div>
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
                    href={`/admin/blogok/${blog.id}`}
                    aria-label="Szerkesztés"
                  >
                    <TbEdit />
                  </Link>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                <div className="text-gray-500">Slug</div>
                <div className="font-medium">
                  {blog.slug || <span className="text-gray-500">—</span>}
                </div>

                <div className="text-gray-500">Kategória</div>
                <div className="font-medium">
                  {catsTxt.length ? catsTxt.join(" | ") : <span className="text-gray-500">—</span>}
                </div>

                <div className="text-gray-500">Címkék</div>
                <div className="font-medium">
                  {tagsTxt.length ? tagsTxt.join(", ") : <span className="text-gray-500">—</span>}
                </div>

                <div className="text-gray-500">Állapot</div>
                <div className="font-bold">
                  {blog.kozzeteve ? (
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
