"use client";

import React, { useContext, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import Label from "../UI/Texts/Label";
import { useRouter } from "next/navigation";
import { AdminMenuContext } from "@/app/AdminContext";
import { TbExternalLink, TbEdit } from "react-icons/tb";

export default function AdminProductCategoriesList({ categories }) {
  const router = useRouter();
  const { searchTerm } = useContext(AdminMenuContext);

  // id -> category map
  const catById = useMemo(() => {
    const m = new Map();
    (categories || []).forEach((c) => m.set(String(c.id), c));
    return m;
  }, [categories]);

  // szülői láncból slug-öket épít (legfelsőtől az aktuálisig)
  const buildSlugTrail = (cat) => {
    if (!cat) return [];
    const parents = [];
    const seen = new Set();
    let pid = cat.szulo ?? null;
    let depth = 0;

    while (pid != null && depth < 10) {
      const key = String(pid);
      if (seen.has(key)) break; // ciklusvédelem
      seen.add(key);
      const parent = catById.get(key);
      if (!parent) break; // ha nincs betöltve a szülő, megállunk
      parents.push(parent.slug);
      pid = parent.szulo ?? null;
      depth++;
    }

    parents.reverse();
    return [...parents, cat.slug].filter(Boolean);
  };

  // helper: név-breadcrumb az aktuális kategóriához
  const makeBreadcrumb = (cat) => {
    if (!cat) return "";
    const names = [];
    const visited = new Set();
    let currentParentId = cat.szulo ?? null;
    let depth = 0;

    // szülők nevei (nagy-szülőtől lefelé) + végén az aktuális
    const parents = [];
    while (currentParentId != null && depth < 10) {
      const key = String(currentParentId);
      if (visited.has(key)) {
        // ciklusvédelem
        parents.push("…");
        break;
      }
      visited.add(key);
      const parent = catById.get(key);
      if (!parent) {
        // ha nincs betöltve a szülő, mutassuk az id-t, hogy legyen jelzés
        parents.push(`#${currentParentId}`);
        break;
      }
      parents.push(parent.nev || `#${parent.id}`);
      currentParentId = parent.szulo ?? null;
      depth += 1;
    }

    // a szülők sorrendje legyen a legfelső -> közvetlen szülő
    parents.reverse();

    // végére az aktuális kategória neve
    parents.push(cat.nev || `#${cat.id}`);

    return parents.join(" > ");
  };

  // kereső — a szulo szám lehet, ezért toString
  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categories;
    const term = searchTerm.toLowerCase();
    return categories.filter((category) => {
      return (
        category.id?.toString().toLowerCase().includes(term) ||
        category.nev?.toLowerCase().includes(term) ||
        category.slug?.toLowerCase().includes(term) ||
        category.leiras_fent?.toLowerCase().includes(term) ||
        category.leiras_lent?.toLowerCase().includes(term) ||
        (category.szulo != null &&
          String(category.szulo).toLowerCase().includes(term))
      );
    });
  }, [categories, searchTerm]);

  if (!categories || categories.length === 0) {
    return (
      <div className="flex flex-col gap-2 animate-pulse px-6">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className="h-16 bg-[var(--border)] rounded-2xl w-full"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 px-6">
      {filteredCategories.map((category) => {
        const breadcrumb = makeBreadcrumb(category); // ← itt készül a "Parent > Child > Current"
        return (
          <div
            key={category.id}
            className="relative flex flex-row justify-between border border-[var(--border)] bg-white rounded-2xl cursor-pointer"
          >
            <div className="flex flex-row w-full ">
              <Image
                src={category.kep || "/default.png"}
                width={50}
                height={50}
                alt={category.slug || "termek-kep"}
                className="mr-4 rounded-md m-2"
              />
              <div className="flex flex-col gap-2 justify-center w-40 border-r border-[var(--border)]">
                <Label classname="font-bold">{category.nev}</Label>
                <Label>#{category.id}</Label>
              </div>

              <div className="flex flex-col gap-2 w-40 justify-center items-center border-r border-[var(--border)] px-2">
                <Label classname={"font-bold text-center"}>
                  {category.slug}
                </Label>
              </div>

              {/* EDDIG: `${category.szulo}>${category.nev}` 
                  MOST: szülők nevei + aktuális név breadcrumb */}
              <div className="flex flex-col gap-2 w-80 justify-center items-center border-r border-[var(--border)] px-2">
                <Label classname={"font-bold text-center"}>{breadcrumb}</Label>
              </div>

              <div className="flex flex-col gap-2 w-30 justify-center items-center border-r border-[var(--border)] px-2">
                {category.kozzeteve === true && (
                  <Label
                    classname={"font-bold text-center text-[var(--green)]"}
                  >
                    Közzétéve
                  </Label>
                )}
                {category.kozzeteve === false && (
                  <Label
                    classname={"font-bold text-center text-[var(--warning)]"}
                  >
                    Vázlat
                  </Label>
                )}
              </div>
            </div>

            <div className="flex flex-row items-center justify-end gap-8 px-8 w-full">
              {(() => {
                const parts = buildSlugTrail(category).map(encodeURIComponent);
                const href = `/termekek${parts.length ? `/${parts.join("/")}` : ""}`;
                return (
                  <Link href={href} target="_blank" rel="noopener noreferrer">
                    <TbExternalLink className="text-[var(--pink)]" />
                  </Link>
                );
              })()}
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
