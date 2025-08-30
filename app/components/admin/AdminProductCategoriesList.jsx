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

  // saját state + prop szinkron
  const [rows, setRows] = useState(categories || []);
  useEffect(() => { setRows(categories || []); }, [categories]);

  // refetch az adatbázisból
  const refetch = useCallback(async () => {
    const { data, error } = await supabase
      .from("product-categories")
      .select("*")
      .order("id", { ascending: true });
    if (!error) setRows(data || []);
  }, [supabase]);

  // custom event figyelése
  useEffect(() => {
    const onChanged = () => refetch();
    window.addEventListener("admin:categories:changed", onChanged);
    return () => window.removeEventListener("admin:categories:changed", onChanged);
  }, [refetch]);

  // id -> kategória map (a breadcrumbs-hoz)
  const byId = useMemo(() => {
    const m = new Map();
    (rows || []).forEach((c) => m.set(String(c.id), c));
    return m;
  }, [rows]);

  // név alapú breadcrumb
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

  // slug útvonal felépítése a linkhez (felsőtől az aktuálisig)
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
      parts.push(parent.slug);
      pid = parent.szulo ?? null;
      depth++;
    }
    parts.reverse();
    return [...parts, cat.slug].filter(Boolean);
  };

  // keresés
  const filtered = useMemo(() => {
    if (!searchTerm) return rows;
    const term = searchTerm.toLowerCase();
    return (rows || []).filter((c) => {
      return (
        c.id?.toString().toLowerCase().includes(term) ||
        c.nev?.toLowerCase().includes(term) ||
        c.slug?.toLowerCase().includes(term) ||
        c.leiras_fent?.toLowerCase().includes(term) ||
        c.leiras_lent?.toLowerCase().includes(term) ||
        (c.szulo != null && String(c.szulo).toLowerCase().includes(term))
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
    <div className="flex flex-col gap-2 px-6">
      {filtered.map((category) => {
        const breadcrumb = makeBreadcrumb(category);
        const parts = buildSlugTrail(category).map(encodeURIComponent);
        const href = `/termekek${parts.length ? `/${parts.join("/")}` : ""}`;

        return (
          <div
            key={category.id}
            className="relative flex flex-row justify-between border border-[var(--border)] bg-white rounded-2xl cursor-pointer"
          >
            <div className="flex flex-row w-full">
              <Image
                src={category.kep || "/default.png"}
                width={50}
                height={50}
                alt={category.slug || "kategoria-kep"}
                className="mr-4 rounded-md m-2"
              />

              <div className="flex flex-col gap-2 justify-center w-40 border-r border-[var(--border)]">
                <Label classname="font-bold">{category.nev}</Label>
                <Label>#{category.id}</Label>
              </div>

              <div className="flex flex-col gap-2 w-40 justify-center items-center border-r border-[var(--border)] px-2">
                <Label classname="font-bold text-center">{category.slug}</Label>
              </div>

              <div className="flex flex-col gap-2 w-80 justify-center items-center border-r border-[var(--border)] px-2">
                <Label classname="font-bold text-center">{breadcrumb || "—"}</Label>
              </div>

              <div className="flex flex-col gap-2 w-30 justify-center items-center border-r border-[var(--border)] px-2">
                {category.kozzeteve ? (
                  <Label classname="font-bold text-center text-[var(--green)]">Közzétéve</Label>
                ) : (
                  <Label classname="font-bold text-center text-[var(--warning)]">Vázlat</Label>
                )}
              </div>
            </div>

            <div className="flex flex-row items-center justify-end gap-8 px-8 w-full">
              <Link href={href} target="_blank" rel="noopener noreferrer">
                <TbExternalLink className="text-[var(--pink)]" />
              </Link>
              <Link href={`/admin/termekkategoriak/${category.id}`}>
                <TbEdit />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
