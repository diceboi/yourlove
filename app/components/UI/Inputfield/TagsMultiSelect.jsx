"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { TbChevronDown, TbCheck, TbX } from "react-icons/tb";

export default function TagsMultiSelect({
  label = "Címkék",
  value = [],                 // number[] – kiválasztott tag ID-k
  onChange,                   // (ids:number[]) => void
  placeholder = "Válassz címkéket…",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [tags, setTags] = useState([]); // {id, nev, slug}
  const [q, setQ] = useState("");
  const boxRef = useRef(null);

  // tagek betöltése
  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("blog-tags")
      .select("id, nev, slug")
      .order("nev", { ascending: true })
      .then(({ data, error }) => {
        if (error) setTags([]);
        else setTags(data || []);
      });
  }, []);

  // id -> tag map
  const byId = useMemo(() => {
    const m = new Map();
    tags.forEach((t) => m.set(String(t.id), t));
    return m;
  }, [tags]);

  // keresett opciók
  const options = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return tags;
    return tags.filter((t) => {
      return (
        (t.nev || "").toLowerCase().includes(s) ||
        (t.slug || "").toLowerCase().includes(s) ||
        String(t.id).includes(s)
      );
    });
  }, [tags, q]);

  // kiválasztott elemek chiphez
  const selected = useMemo(() => {
    const ids = Array.isArray(value) ? value : [];
    return ids
      .map((id) => byId.get(String(id)) || { id, nev: `#${id}` })
      .filter(Boolean);
  }, [value, byId]);

  // helper: toggle id a listában
  const toggle = (id) => {
    const numericId = Number(id);
    if (!Number.isFinite(numericId)) return;
    const current = Array.isArray(value)
      ? value.map((n) => Number(n)).filter(Number.isFinite)
      : [];
    const exists = current.includes(numericId);
    const next = exists
      ? current.filter((x) => x !== numericId)
      : [...current, numericId];
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
        {selected.length === 0 && (
          <span className="text-sm text-gray-500">{placeholder}</span>
        )}

        {selected.map((sel) => (
          <span
            key={sel.id}
            className="text-xs bg-gray-100 rounded-md px-2 py-1 flex items-center gap-2"
          >
            {sel.nev || `#${sel.id}`}
            <button
              type="button"
              className="opacity-70 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                toggle(sel.id);
              }}
              aria-label="Eltávolítás"
            >
              <TbX />
            </button>
          </span>
        ))}

        <span className="ml-auto opacity-60">
          <TbChevronDown />
        </span>
      </div>

      {/* lenyíló */}
      {open && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-[var(--border)] rounded-md shadow-lg z-50">
          <div className="p-2 border-b border-[var(--border)]">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Keresés (név/slug/id)…"
              className="w-full text-sm border border-[var(--border)] rounded-md px-2 py-1 outline-none focus:border-[var(--green)]"
            />
          </div>

          <ul className="max-h-72 overflow-auto">
            {options.length === 0 && (
              <li className="px-3 py-2 text-sm text-gray-500">Nincs találat</li>
            )}
            {options.map((opt) => {
              const checked = Array.isArray(value)
                ? value.map(Number).includes(Number(opt.id))
                : false;
              return (
                <li
                  key={opt.id}
                  className={`px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer flex items-center justify-between ${
                    checked ? "bg-gray-50" : ""
                  }`}
                  onClick={() => toggle(opt.id)}
                >
                  <span className="truncate">{opt.nev}</span>
                  {checked && <TbCheck className="shrink-0" />}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </fieldset>
  );
}
