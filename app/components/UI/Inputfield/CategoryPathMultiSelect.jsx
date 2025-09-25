"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { TbChevronDown, TbCheck, TbX } from "react-icons/tb";

export default function CategoryPathMultiSelect({
  label = "Kategóriák",
  value = [],                 // number[][] – kiválasztott pathok (pl. [[1,2],[3,7]])
  onChange,                   // (paths:number[][]) => void
  placeholder = "Válassz kategóriákat…",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [cats, setCats] = useState([]); // {id, nev, slug, szulo}
  const [q, setQ] = useState("");
  const boxRef = useRef(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("blog-categories")
      .select("id, nev, slug, szulo")
      .order("nev", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error("Kategóriák betöltési hiba:", error);
          setCats([]);
        } else {
          setCats(data || []);
        }
      });
  }, []);

  // id -> kategória map
  const byId = useMemo(() => {
    const m = new Map();
    cats.forEach((c) => m.set(String(c.id), c));
    return m;
  }, [cats]);

  // path egy leaf id-hoz: gyökeretől leaf-ig
  const getPathIds = (leafId) => {
    const path = [];
    let cur = byId.get(String(leafId));
    let depth = 0;
    while (cur && depth < 24) {
      path.push(cur.id);
      cur = cur.szulo == null ? null : byId.get(String(cur.szulo));
      depth++;
    }
    return path.reverse();
  };

  // breadcrumb szöveg path-ból
  const nameOf = (id) => byId.get(String(id))?.nev || `#${id}`;
  const breadcrumbFromPath = (path) => path.map(nameOf).join(" > ");

  // Egyenlőségvizsgálat path-oknál
  const samePath = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

  const isSelectedPath = (path) => (value || []).some((p) => samePath(p, path));

  const addOrRemovePathByLeaf = (leafId) => {
    const path = getPathIds(leafId);
    if (!path.length) return;
    const exists = isSelectedPath(path);
    const next = exists
      ? (value || []).filter((p) => !samePath(p, path))
      : [ ...(value || []), path ];
    onChange?.(next);
  };

  // kattintás-kívülre: zár
  useEffect(() => {
    const onDoc = (e) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // opciók + keresés (minden kategória választható; ha csak leaf-eket szeretnél, szűrj itt)
  const options = useMemo(() => {
    const withBc = cats.map((c) => {
      const path = getPathIds(c.id);
      return {
        ...c,
        path,
        bc: breadcrumbFromPath(path),
      };
    });
    const s = q.trim().toLowerCase();
    if (!s) return withBc;
    return withBc.filter(
      (it) =>
        it.bc.toLowerCase().includes(s) ||
        (it.slug || "").toLowerCase().includes(s) ||
        String(it.id).includes(s)
    );
  }, [cats, q, byId]);

  // kiválasztott path-ok „chip”-ként
  const selectedChips = useMemo(() => {
    return (value || []).map((path) => ({
      key: path.join(">"),
      path,
      bc: breadcrumbFromPath(path),
      leafId: path[path.length - 1],
    }));
  }, [value, byId]);

  return (
    <fieldset className={`relative bg-white rounded-md shadow-sm ${className}`} ref={boxRef}>
      {label && (
        <label className="px-2 py-2.5 text-xs font-bold bg-white block rounded-t-md">
          {label}
        </label>
      )}

      {/* kiválasztások chip-ek */}
      <div
        className="min-h-[42px] flex flex-wrap items-center gap-2 border border-[var(--border)] rounded-md px-2 py-2 cursor-text"
        onClick={() => setOpen(true)}
      >
        {selectedChips.length === 0 && (
          <span className="text-sm text-gray-500">{placeholder}</span>
        )}

        {selectedChips.map((sel) => (
          <span
            key={sel.key}
            className="text-xs bg-gray-100 rounded-md px-2 py-1 flex items-center gap-2"
          >
            {sel.bc}
            <button
              type="button"
              className="opacity-70 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                // törlés ugyanazzal a toggle-lal a leaf alapján
                addOrRemovePathByLeaf(sel.leafId);
              }}
              aria-label="Eltávolítás"
            >
              <TbX />
            </button>
          </span>
        ))}

        <span className="ml-auto opacity-60"><TbChevronDown /></span>
      </div>

      {/* lenyíló */}
      {open && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-[var(--border)] rounded-md shadow-lg z-50">
          <div className="p-2 border-b border-[var(--border)]">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Keresés (breadcrumb/id/slug)…"
              className="w-full text-sm border border-[var(--border)] rounded-md px-2 py-1 outline-none focus:border-[var(--green)]"
            />
          </div>

          <ul className="max-h-72 overflow-auto">
            {options.length === 0 && (
              <li className="px-3 py-2 text-sm text-gray-500">Nincs találat</li>
            )}
            {options.map((opt) => {
              const selected = isSelectedPath(opt.path);
              return (
                <li
                  key={opt.id}
                  className={`px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer flex items-center justify-between ${selected ? "bg-gray-50" : ""}`}
                  onClick={() => addOrRemovePathByLeaf(opt.id)}
                >
                  <span className="truncate">{opt.bc}</span>
                  {selected && <TbCheck className="shrink-0" />}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </fieldset>
  );
}
