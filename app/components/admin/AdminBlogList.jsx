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

const parseJsonSafe = (v) => {
  try {
    return JSON.parse(v);
  } catch {
    return null;
  }
};

const toNum = (n) => {
  const x = Number(n);
  return Number.isFinite(x) ? x : null;
};

const parseIdArray = (v) => {
  if (v == null) return [];
  const data = typeof v === "string" ? parseJsonSafe(v) ?? v : v;

  if (Array.isArray(data)) return data.map(toNum).filter(Boolean);
  if (typeof data === "number") return [data];

  if (typeof data === "string") {
    const ids = data.match(/\d+/g)?.map(Number) || [];
    return ids.filter(Number.isFinite);
  }
  return [];
};

const parseCategoryPaths = (v, getPathIds) => {
  if (v == null) return [];
  const data = typeof v === "string" ? parseJsonSafe(v) ?? v : v;

  if (Array.isArray(data)) {
    if (data.every((it) => Array.isArray(it))) {
      return data
        .map((path) => path.map(toNum).filter(Boolean))
        .filter((p) => p.length);
    }
    const ids = parseIdArray(data);
    return ids.map((leafId) => getPathIds(leafId)).filter((p) => p.length);
  }

  const ids = parseIdArray(v);
  return ids.map((leafId) => getPathIds(leafId)).filter((p) => p.length);
};

export default function AdminBlogList({ blogs }) {
  const { searchTerm } = useContext(AdminMenuContext);
  const supabase = useMemo(() => createClient(), []);

  const [rows, setRows] = useState(blogs || []);
  useEffect(() => {
    setRows(blogs || []);
  }, [blogs]);

  const refetch = useCallback(async () => {
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .order("id", { ascending: true });
    if (!error) setRows(data || []);
  }, [supabase]);

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
      .then(({ data, error }) => setCats(error ? [] : data || []));
  }, [supabase]);

  const catById = useMemo(() => {
    const m = new Map();
    cats.forEach((c) => m.set(String(c.id), c));
    return m;
  }, [cats]);

  const nameOf = (id) => catById.get(String(id))?.nev || `#${id}`;

  const getPathIds = (leafId) => {
    const path = [];
    let cur = catById.get(String(leafId));
    let depth = 0;
    while (cur && depth < 32) {
      path.push(cur.id);
      cur = cur.szulo == null ? null : catById.get(String(cur.szulo));
      depth++;
    }
    return path.reverse();
  };

  const breadcrumbFromPath = (path) => path.map((id) => nameOf(id)).join(" > ");

  const blogCategoryTexts = (blog) => {
    const paths = parseCategoryPaths(blog.kategoria ?? blog.kategoriak, getPathIds);
    return paths.map((p) => breadcrumbFromPath(p));
  };

  const [blogTags, setBlogTags] = useState([]);
  useEffect(() => {
    supabase
      .from("blog-tags")
      .select("id, nev, slug")
      .order("nev", { ascending: true })
      .then(({ data, error }) => setBlogTags(error ? [] : data || []));
  }, [supabase]);

  const tagById = useMemo(() => {
    const m = new Map();
    blogTags.forEach((t) => m.set(String(t.id), t));
    return m;
  }, [blogTags]);

  const blogTagNames = (blog) => {
    const ids = parseIdArray(blog.cimke ?? blog.cimkek ?? blog.tags);
    return ids.map((id) => tagById.get(String(id))?.nev).filter(Boolean);
  };

  const filtered = useMemo(() => {
    if (!searchTerm) return rows;
    const term = searchTerm.toLowerCase();
    return (rows || []).filter((b) => {
      const catsTxt = blogCategoryTexts(b).join(" ; ").toLowerCase();
      const tagsTxt = blogTagNames(b).join(" ; ").toLowerCase();
      return (
        b.id?.toString().toLowerCase().includes(term) ||
        b.cim?.toLowerCase().includes(term) ||
        b.nev?.toLowerCase().includes(term) ||
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

  const getCover = (b) => b.kep || b.og_image || b.cover || "/default.png";

  return (
    <>
      {/* ====== Táblázat (md és fölötte) ====== */}
      <div className="hidden md:block px-3 md:px-6">
        <div className="relative w-full max-w-full overflow-x-auto border border-[var(--border)] rounded-2xl">
          <table className="min-w-full text-sm">
            <thead className="bg-[#f5f5f5] sticky top-0 z-10">
              <tr>
                {/* Cím – mindig látszik */}
                <th className="text-left font-semibold px-3 py-3">
                  Cím
                </th>

                {/* Slug – lg-től */}
                <th className="text-left font-semibold px-3 py-3 hidden lg:table-cell">
                  Slug
                </th>

                {/* Kategória – lg-től */}
                <th className="text-left font-semibold px-3 py-3 hidden lg:table-cell">
                  Kategória
                </th>

                {/* Címkék – xl-től */}
                <th className="text-left font-semibold px-3 py-3 hidden xl:table-cell">
                  Címkék
                </th>

                {/* Állapot – mindig látszik */}
                <th className="text-left font-semibold px-3 py-3">
                  Állapot
                </th>

                {/* Műveletek – fix szélesség */}
                <th className="text-right font-semibold px-3 py-3 w-[140px] min-w-[140px]">
                  Műveletek
                </th>
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
                    {/* Cím + ID + kép – mindig látszik */}
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
                          <div className="font-semibold truncate">
                            {blog.cim || blog.nev}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            #{blog.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Slug – lg+ */}
                    <td className="px-3 py-3 align-middle hidden lg:table-cell">
                      {blog.slug ? (
                        <span className="font-medium">{blog.slug}</span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>

                    {/* Kategória – lg+ */}
                    <td className="px-3 py-3 align-middle hidden lg:table-cell">
                      {catsTxt.length ? (
                        <div className="flex flex-col">
                          {catsTxt.map((t, i) => (
                            <span key={i} className="font-medium line-clamp-2">
                              {t}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>

                    {/* Címkék – xl+ */}
                    <td className="px-3 py-3 align-middle hidden xl:table-cell">
                      {tagsTxt.length ? (
                        <span className="font-medium line-clamp-2">
                          {tagsTxt.join(", ")}
                        </span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>

                    {/* Állapot – mindig látszik */}
                    <td className="px-3 py-3 align-middle">
                      {blog.kozzeteve ? (
                        <span className="font-bold text-[var(--green)]">
                          Közzétéve
                        </span>
                      ) : (
                        <span className="font-bold text-[var(--warning)]">
                          Vázlat
                        </span>
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
