"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { TbChevronDown, TbX } from "react-icons/tb";

export default function CategorySelectInput({
  label = "Szülőkategória",
  value,              // jelenlegi parent id (pl. 1 vagy null)
  onChange,           // (id | null) -> void
  placeholder = "Válassz szülőkategóriát…",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [allCats, setAllCats] = useState([]);     // {id, nev, slug} elemek
  const [search, setSearch] = useState("");
  const boxRef = useRef(null);

  // betöltés
  useEffect(() => {
    let mounted = true;
    (async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("product-categories")
        .select("id, nev, slug")
        .order("nev", { ascending: true });

      if (!mounted) return;
      if (error) {
        console.error("Kategóriák betöltési hiba:", error);
        setAllCats([]);
      } else {
        setAllCats(data || []);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // kattintás-kívülre: zárja a lenyílót
  useEffect(() => {
    const onDocClick = (e) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const selected = useMemo(
    () => allCats.find(c => String(c.id) === String(value)) || null,
    [allCats, value]
  );

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return allCats;
    return allCats.filter(c =>
      (c.nev || "").toLowerCase().includes(s) ||
      String(c.id).includes(s) ||
      (c.slug || "").toLowerCase().includes(s)
    );
  }, [allCats, search]);

  return (
    <fieldset className={`relative bg-white rounded-md shadow-sm ${className}`} ref={boxRef}>
      {label && (
        <label className="px-2 py-2.5 text-xs font-bold bg-white rounded-t-md block">
          {label}
        </label>
      )}

      {/* Választó sor */}
      <div
        className="flex items-center gap-2 border border-[var(--border)] rounded-md px-2 py-2 cursor-pointer"
        onClick={() => setOpen(o => !o)}
      >
        {selected ? (
          <span
            className="inline-flex items-center gap-2 text-sm bg-[var(--border)] text-black px-2 py-1 rounded-md"
            onClick={(e) => { e.stopPropagation(); }}
          >
            {selected.nev} <span className="opacity-60">#{selected.id}</span>
            <button
              className="ml-1 p-0.5 hover:opacity-80"
              onClick={(e) => { e.stopPropagation(); onChange?.(null); }}
              aria-label="Törlés"
              type="button"
            >
              <TbX />
            </button>
          </span>
        ) : (
          <span className="text-sm text-gray-500">{placeholder}</span>
        )}
        <span className="ml-auto opacity-70"><TbChevronDown /></span>
      </div>

      {/* Lenyíló */}
      {open && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-[var(--border)] rounded-md shadow-lg z-50">
          <div className="p-2 border-b border-[var(--border)]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Keresés név / id / slug szerint…"
              className="w-full text-sm border border-[var(--border)] rounded-md px-2 py-1 outline-none focus:border-[var(--green)]"
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>

          <ul className="max-h-64 overflow-auto">
            {/* Opcionális „Nincs szülő” sor */}
            <li
              className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
              onClick={() => { onChange?.(null); setOpen(false); }}
            >
              Nincs szülőkategória
            </li>
            <li className="h-px bg-[var(--border)]" />

            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-gray-500">Nincs találat</li>
            )}

            {filtered.map(cat => (
              <li
                key={cat.id}
                className={`px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer flex justify-between items-center ${String(cat.id) === String(value) ? "bg-gray-50" : ""}`}
                onClick={() => { onChange?.(cat.id); setOpen(false); }}
              >
                <span className="truncate">{cat.nev}</span>
                <span className="text-xs opacity-60">#{cat.id}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </fieldset>
  );
}
