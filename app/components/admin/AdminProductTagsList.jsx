"use client";

import React, { useContext, useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import Label from "../UI/Texts/Label";
import { AdminMenuContext } from "@/app/AdminContext";
import { TbExternalLink, TbEdit } from "react-icons/tb";
import { createClient } from "@/utils/supabase/client";

export default function AdminProductTagsList({ tags }) {
  const { searchTerm } = useContext(AdminMenuContext);
  const supabase = useMemo(() => createClient(), []);

  // saját state + prop szinkron
  const [rows, setRows] = useState(tags || []);
  useEffect(() => { setRows(tags || []); }, [tags]);

  // refetch az adatbázisból
  const refetch = useCallback(async () => {
    const { data, error } = await supabase
      .from("product-tags")
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

  // id -> kategória map (a breadcrumbs-hoz)
  const byId = useMemo(() => {
    const m = new Map();
    (rows || []).forEach((c) => m.set(String(c.id), c));
    return m;
  }, [rows]);

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
    <div className="flex flex-col gap-2 px-6">
      {filtered.map((tag) => {
        const href = `/termekek/cimkek/${tag.slug}`;

        return (
          <div
            key={tag.id}
            className="relative flex flex-row justify-between border border-[var(--border)] bg-white rounded-2xl cursor-pointer"
          >
            <div className="flex flex-row w-full">

              <div className="flex flex-col gap-2 justify-center w-40 border-r border-[var(--border)] p-2">
                <Label classname="font-bold">{tag.nev}</Label>
                <Label>#{tag.id}</Label>
              </div>

              <div className="flex flex-col gap-2 w-40 justify-center items-center border-r border-[var(--border)] px-2">
                <Label classname="font-bold text-center">{tag.slug}</Label>
              </div>

              <div className="flex flex-col gap-2 w-30 justify-center items-center border-r border-[var(--border)] px-2">
                {tag.kozzeteve ? (
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
              <Link href={`/admin/termekcimkek/${tag.id}`}>
                <TbEdit />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
