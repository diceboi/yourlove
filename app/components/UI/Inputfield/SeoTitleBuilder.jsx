"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  TbChevronRight,
  TbChevronLeft,
  TbGripVertical,
  TbX,
  TbSeparatorHorizontal,
} from "react-icons/tb";

const PARTS = [
  { key: "NAME", label: "Terméknév" },     // form.fo_cim
  { key: "SUBTITLE", label: "Alcím" },     // form.alcim
  { key: "CATEGORY", label: "Kategória" }, // első path leaf neve
  { key: "SITENAME", label: "Weboldal" },  // siteName
];

const makeId = () => Math.random().toString(36).slice(2, 9);

export default function SeoTitleBuilder({
  form,
  siteName = "Yourlove.hu",
  value = "",          // DB-ben tárolt seo_title (string)
  onChange,           // (newTitle: string) => void
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);
  useEffect(() => {
    const onDoc = (e) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // Kategória nevek egyszer
  const [cats, setCats] = useState([]);
  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("product-categories")
      .select("id, nev")
      .order("nev", { ascending: true })
      .then(({ data, error }) => setCats(error ? [] : (data || [])));
  }, []);

  const catById = useMemo(() => {
    const m = new Map();
    cats.forEach((c) => m.set(String(c.id), c));
    return m;
  }, [cats]);

  const primaryCategoryName = useMemo(() => {
    const paths = Array.isArray(form?.kategoriak_paths) ? form.kategoriak_paths : [];
    if (!paths.length) return "";
    const first = paths[0];
    if (!Array.isArray(first) || first.length === 0) return "";
    const leafId = first[first.length - 1];
    return catById.get(String(leafId))?.nev || "";
  }, [form?.kategoriak_paths, catById]);

  // ----- Builder állapot (chips) + touched -----
  const [items, setItems] = useState([
    { id: makeId(), type: "PART", key: "NAME" },
    { id: makeId(), type: "SEP",  text: " - " },
    { id: makeId(), type: "PART", key: "SITENAME" },
  ]);
  const [touched, setTouched] = useState(false);

  // ----- Drag & drop -----
  const dragIdRef = useRef(null);
  const onDragStart = (id) => (e) => {
    dragIdRef.current = id;
    e.dataTransfer.effectAllowed = "move";
  };
  const onDragOver = (id) => (e) => {
    e.preventDefault();
  };
  const onDrop = (id) => (e) => {
    e.preventDefault();
    const fromId = dragIdRef.current;
    dragIdRef.current = null;
    if (!fromId || fromId === id) return;
    setTouched(true);
    setItems((arr) => {
      const from = arr.findIndex((x) => x.id === fromId);
      const to = arr.findIndex((x) => x.id === id);
      if (from < 0 || to < 0) return arr;
      const next = [...arr];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  // ----- PART-ok felirata/értéke -----
  const partLabel = (k) => PARTS.find((p) => p.key === k)?.label || k;
  const partText = (k) => {
    switch (k) {
      case "NAME":     return (form?.fo_cim || "").trim();
      case "SUBTITLE": return (form?.alcim || "").trim();
      case "CATEGORY": return (primaryCategoryName || "").trim();
      case "SITENAME": return (siteName || "").trim();
      default:         return "";
    }
  };

  // ----- Preview (felesleges elválasztók takarítása) -----
  const preview = useMemo(() => {
    const raw = items.map((it) =>
      it.type === "PART"
        ? { type: "PART", text: partText(it.key) }
        : { type: "SEP", text: it.text ?? "" }
    );

    // eleji/végi SEP eldobása
    let tmp = raw.filter((_, i) => !(i === 0 && raw[0]?.type === "SEP"));
    tmp = tmp.filter((_, i, a) => !(i === a.length - 1 && a[a.length - 1]?.type === "SEP"));

    // üres PART-ok körüli SEP + duplázás eldobása
    const cleaned = [];
    for (let i = 0; i < tmp.length; i++) {
      const curr = tmp[i];
      if (curr.type === "SEP") {
        const prev = tmp[i - 1];
        const next = tmp[i + 1];
        const prevEmpty = prev?.type === "PART" && !prev.text;
        const nextEmpty = next?.type === "PART" && !next.text;
        if (!prev || !next || prevEmpty || nextEmpty) continue;
        if (cleaned.length && cleaned[cleaned.length - 1].type === "SEP") continue;
      }
      cleaned.push(curr);
    }

    return cleaned.map((x) => x.text).join("");
  }, [items, form?.fo_cim, form?.alcim, primaryCategoryName, siteName]);

  useEffect(() => {
    if (touched) onChange?.(preview);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preview, touched]);

  const displayTitle = touched ? preview : (value || "").trim();

  // ======== VISSZAFEJTŐ: seo_title -> items ========
  /**
   * Heurisztikus parser:
   * - a jelenleg ismert részeket (NAME/SUBTITLE/CATEGORY/SITENAME) megpróbálja
   *   megtalálni a saved stringben, és köztük a maradékot SEP-ként elmenti.
   * - A leghosszabb egyezéseket preferálja.
   */
  const parseToItems = (saved, texts) => {
    if (!saved) return null;
    const candidates = Object.entries(texts)
      .filter(([, t]) => t)                           // nem üres részek
      .map(([key, txt]) => ({ key, txt }));

    if (candidates.length === 0) return null;

    // Ha semmilyen candidate nem szerepel benne, hagyjuk.
    const anyHit = candidates.some(({ txt }) => saved.includes(txt));
    if (!anyHit) return null;

    // Ne ütközzenek azonos tartalmú részek: a hosszabbakat előre
    candidates.sort((a, b) => b.txt.length - a.txt.length);

    const out = [];
    let i = 0;
    while (i < saved.length) {
      // találunk-e itt valamelyik candidate-t?
      let match = null;
      for (const c of candidates) {
        if (c.txt && saved.startsWith(c.txt, i)) {
          match = c;
          break;
        }
      }
      if (match) {
        out.push({ id: makeId(), type: "PART", key: match.key });
        i += match.txt.length;
      } else {
        // szeparátor: addig olvasunk, míg a következő PART-ig el nem jutunk
        let j = i + 1;
        while (j <= saved.length) {
          const chunk = saved.slice(j);
          const hits = candidates.some(({ txt }) => chunk.startsWith(txt));
          if (hits) break;
          j++;
        }
        const sepText = saved.slice(i, j);
        if (sepText) out.push({ id: makeId(), type: "SEP", text: sepText });
        i = j;
      }
    }

    // kell, hogy legyen benne legalább egy PART
    if (!out.some((x) => x.type === "PART")) return null;
    return out;
  };

  // Ha a user még nem módosított (touched=false), és van DB érték,
  // próbáld visszafejteni és feltölteni a chipeket.
  useEffect(() => {
    if (touched) return;

    const saved = (value || "").trim();
    if (!saved) return;

    const texts = {
      NAME: (form?.fo_cim || "").trim(),
      SUBTITLE: (form?.alcim || "").trim(),
      CATEGORY: (primaryCategoryName || "").trim(),
      SITENAME: (siteName || "").trim(),
    };

    const parsed = parseToItems(saved, texts);
    if (parsed && parsed.length) {
      setItems(parsed);
    }
  }, [touched, value, form?.fo_cim, form?.alcim, primaryCategoryName, siteName]);

  // ======== Műveletek ========
  const addPart = (key) => {
    setTouched(true);
    setItems((arr) => [...arr, { id: makeId(), type: "PART", key }]);
  };

  const addSeparator = (text = " - ") => {
    setTouched(true);
    setItems((arr) => [...arr, { id: makeId(), type: "SEP", text }]);
  };

  const removeById = (id) => {
    setTouched(true);
    setItems((arr) => arr.filter((x) => x.id !== id));
  };

  const moveBy = (id, delta) => {
    setTouched(true);
    setItems((arr) => {
      const idx = arr.findIndex((x) => x.id === id);
      if (idx < 0) return arr;
      const to = idx + delta;
      if (to < 0 || to >= arr.length) return arr;
      const next = [...arr];
      const [moved] = next.splice(idx, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  return (
    <fieldset className={`bg-white rounded-md shadow-sm ${className}`} ref={boxRef}>
      <label className="px-2 py-2.5 text-xs font-bold bg-white block rounded-t-md">
        SEO cím építő
      </label>

      {/* chipek */}
      <div className="flex flex-wrap items-center gap-2 border border-[var(--border)] rounded-md px-2 py-2 m-2">
        {items.length === 0 && (
          <span className="text-sm text-gray-500">Adj hozzá elemeket…</span>
        )}

        {items.map((it) => (
          <span
            key={it.id}
            className="text-xs bg-gray-100 rounded-md px-2 py-1 flex items-center gap-1 cursor-move"
            draggable
            onDragStart={onDragStart(it.id)}
            onDragOver={onDragOver(it.id)}
            onDrop={onDrop(it.id)}
            title="Húzd a sorrendhez"
          >
            <TbGripVertical className="opacity-60" />

            <button
              type="button"
              onClick={() => moveBy(it.id, -1)}
              aria-label="Balra"
              className="p-0.5 rounded hover:bg-gray-200"
            >
              <TbChevronLeft className="opacity-70" />
            </button>
            <button
              type="button"
              onClick={() => moveBy(it.id, +1)}
              aria-label="Jobbra"
              className="p-0.5 rounded hover:bg-gray-200"
            >
              <TbChevronRight className="opacity-70" />
            </button>

            {it.type === "PART" ? (
              <span className="mx-1">{partLabel(it.key)}</span>
            ) : (
              <span className="flex items-center gap-1">
                <TbSeparatorHorizontal className="opacity-60" />
                <input
                  className="w-24 text-xs border border-[var(--border)] rounded px-1 py-0.5 outline-none focus:border-[var(--green)]"
                  value={it.text ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTouched(true);
                    setItems((arr) =>
                      arr.map((x) => (x.id === it.id ? { ...x, text: val } : x))
                    );
                  }}
                  placeholder="(pl.  -  |  ·  |  / )"
                />
              </span>
            )}

            <button
              type="button"
              className="opacity-70 hover:opacity-100"
              onClick={() => removeById(it.id)}
              aria-label="Eltávolítás"
            >
              <TbX />
            </button>
          </span>
        ))}

        <span className="ml-auto">
          <button
            type="button"
            className="text-xs border rounded-md px-2 py-1"
            onClick={() => setOpen((v) => !v)}
          >
            Elem hozzáadás
          </button>
        </span>
      </div>

      {/* lenyíló menü */}
      {open && (
        <div className="mt-1 bg-white border border-[var(--border)] rounded-md shadow-lg z-50">
          <ul className="max-h-60 overflow-auto text-sm">
            {PARTS.map((opt) => (
              <li
                key={opt.key}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  addPart(opt.key);
                  setOpen(false);
                }}
              >
                {opt.label}
              </li>
            ))}
            <li
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                addSeparator(" - ");
                setOpen(false);
              }}
            >
              + Elválasztó ( - )
            </li>
            <li
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                addSeparator("");
                setOpen(false);
              }}
            >
              + Elválasztó (üres)
            </li>
          </ul>
        </div>
      )}

      {/* előnézet */}
      <div className="p-2 text-sm">
        <span className="text-[var(--secondary-text)] mr-2">Előnézet:</span>
        <span className="text-[var(--secondary-text)] font-medium">
          {displayTitle || "—"}
        </span>
      </div>
    </fieldset>
  );
}
